<template>
  <div class="auth-overlay">
    <div class="auth-panel">
      <div class="auth-header">
        <h1 class="auth-title">⚔ OSRS Clans ⚔</h1>
        <p class="auth-subtitle">
          {{ isVerifying ? 'Verify Your Email' : 'Enter the Realm' }}
        </p>
      </div>

      <div v-if="!isVerifying" class="auth-tabs">
        <button 
          class="auth-tab" 
          :class="{ 'auth-tab--active': activeMode === 'signin' }"
          @click="activeMode = 'signin'"
        >
          Sign In
        </button>
        <button 
          class="auth-tab" 
          :class="{ 'auth-tab--active': activeMode === 'signup' }"
          @click="activeMode = 'signup'"
        >
          Create Account
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Normal auth form -->
        <template v-if="!isVerifying">

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :placeholder="activeMode === 'signin' ? 'Enter your email' : 'your.email@domain.com'"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div v-if="activeMode === 'signup'" class="form-group">
            <label class="form-label" for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              placeholder="Confirm your password"
              required
            />
          </div>
        </template>

        <!-- Verification form -->
        <template v-else>
          <div class="verification-info">
            <p class="verification-message">
              We've sent a verification code to <strong>{{ form.email }}</strong>
            </p>
            <p class="verification-submessage">
              Please check your email and enter the code below:
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="verificationCode">Verification Code</label>
            <input
              id="verificationCode"
              v-model="verificationCode"
              type="text"
              class="form-input verification-input"
              placeholder="Enter 6-digit code"
              maxlength="6"
              required
            />
          </div>
        </template>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="auth-submit"
          :disabled="isLoading"
          :class="{ 'auth-submit--loading': isLoading }"
        >
          <span v-if="!isLoading">
            {{ isVerifying 
              ? '✦ Verify Email ✦' 
              : activeMode === 'signin' 
                ? '⚔ Enter Realm ⚔' 
                : '✦ Create Account ✦' 
            }}
          </span>
          <span v-else>...</span>
        </button>
      </form>

      <div class="auth-footer">
        <p v-if="!isVerifying" class="auth-note">
          {{ activeMode === 'signin' 
            ? 'New warrior? Create an account to track your victories.' 
            : 'Already have an account? Sign in to continue your quest.'
          }}
        </p>
        <p v-else class="auth-note">
          Didn't receive the code? 
          <button @click="resendCode" class="resend-btn" :disabled="isLoading">
            Resend Email
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuth, useSignIn, useSignUp, useClerk, useUser } from '@clerk/vue'
import { supabase } from '@/supabaseClient.js'

const emit = defineEmits(['authenticated'])

const { isLoaded, isSignedIn } = useAuth()
const { signIn, isLoaded: signInLoaded } = useSignIn()
const { signUp, isLoaded: signUpLoaded } = useSignUp()
const { user } = useUser()
const clerk = useClerk()

const activeMode = ref('signin')
const isLoading = ref(false)
const error = ref('')
const isVerifying = ref(false)
const verificationCode = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// Function to sync user to Supabase after successful Clerk signup
const syncUserToSupabase = async (clerkUser) => {
  try {
    const { error } = await supabase
      .from('Users')
      .insert({
        clerk_id: clerkUser.id,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      // Silent error - user is still authenticated with Clerk
      console.error('Failed to sync user to Supabase:', error.message)
    }
  } catch (err) {
    // Silent error - user is still authenticated with Clerk
    console.error('Error syncing to Supabase:', err.message)
  }
}

const handleSubmit = async () => {
  error.value = ''
  
  // Check if user is already signed in
  if (isSignedIn.value) {
    emit('authenticated', { alreadySignedIn: true })
    return
  }
  
  // Check if Clerk is loaded
  if (!isLoaded.value) {
    error.value = 'Authentication service is loading. Please wait a moment and try again.'
    return
  }
  
  // Check if Clerk objects are available
  if (activeMode.value === 'signin' && !signIn.value) {
    error.value = 'Sign-in service is not available. Please refresh the page.'
    return
  }
  
  if (activeMode.value === 'signup' && !signUp.value) {
    error.value = 'Sign-up service is not available. Please refresh the page.'
    return
  }
  
  // Basic validation
  if (!form.username.trim() || !form.password.trim() || !form.email.trim()) {
    error.value = 'Username, email, and password are required'
    return
  }
  
  if (activeMode.value === 'signup') {
    if (form.password !== form.confirmPassword) {
      error.value = 'Passwords do not match'
      return
    }
    if (form.password.length < 6) {
      error.value = 'Password must be at least 6 characters'
      return
    }
  }
  
  isLoading.value = true
  
  try {
    // Handle email verification step
    if (isVerifying.value) {
      if (!verificationCode.value.trim()) {
        error.value = 'Please enter the verification code'
        return
      }

      const result = await signUp.value.attemptEmailAddressVerification({
        code: verificationCode.value.trim()
      })

      if (result.status === 'complete') {
        // Activate the session to complete the authentication process
        if (result.createdSessionId) {
          try {
            await clerk.value.setActive({
              session: result.createdSessionId
            })
          } catch (sessionError) {
            // Don't show error to user since authentication already succeeded
            // Clerk should handle the session automatically
          }
        }
        
        isVerifying.value = false
        // Sync the user to Supabase database
        if (user.value) {
          await syncUserToSupabase(user.value)
        }
        // Authentication is now complete and App.vue will detect the state change
      } else {
        error.value = 'Verification failed. Please check your code and try again.'
      }
      return
    }
    if (activeMode.value === 'signin') {
      try {
        let result
        
        try {
          // First attempt: Try with username as identifier
          result = await signIn.value.create({
            identifier: form.username,
            password: form.password,
          })
        } catch (usernameError) {
          // Check if the error is "already signed in"
          if (usernameError?.message?.includes('already signed in')) {
            error.value = 'You are already signed in. Try refreshing the page or click "Sign Out" to sign in as a different user.'
            return
          }
          
          // Second attempt: Try with email as identifier
          result = await signIn.value.create({
            identifier: form.email,
            password: form.password,
          })
        }
        
        if (result.status === 'complete') {
          // Sign in successful - activate the session
          if (result.createdSessionId) {
            try {
              await clerk.value.setActive({
                session: result.createdSessionId
              })
            } catch (sessionError) {
              // Don't show error to user since authentication already succeeded
              // Clerk should handle the session automatically
            }
          }
          // The parent component will detect authentication via useAuth()
        } else {
          // Handle cases where additional steps are needed
          if (result.status === 'needs_verification') {
            error.value = 'Please verify your account first'
          } else {
            error.value = 'Additional verification required'
          }
        }
      } catch (signInError) {
        // Re-throw to be caught by main error handler
        throw signInError
      }
    } else {
      // Sign up with Clerk
      const signUpData = {
        emailAddress: form.email,
        password: form.password,
        username: form.username,
      }
      
      const result = await signUp.value.create(signUpData)

      if (result.status === 'complete') {
        // Sign up successful - activate the session
        if (result.createdSessionId) {
          try {
            await clerk.value.setActive({
              session: result.createdSessionId
            })
          } catch (sessionError) {
            // Don't show error to user since authentication already succeeded
            // Clerk should handle the session automatically
          }
        }
        // Sync the user to Supabase database
        if (user.value) {
          await syncUserToSupabase(user.value)
        }
        // The parent component will detect authentication via useAuth()
      } else if (result.status === 'missing_requirements') {
        // Handle email verification
        await result.prepareEmailAddressVerification({ strategy: 'email_code' })
        isVerifying.value = true
        error.value = ''  // Clear any previous errors
      } else {
        error.value = 'Account creation requires additional verification'
      }
    }
  } catch (err) {
    // More detailed error handling
    if (err?.errors && err.errors.length > 0) {
      const clerkError = err.errors[0]
      
      // Handle specific Clerk error codes
      if (clerkError.code === 'form_identifier_not_found') {
        error.value = 'Account not found. Please check your email or create an account.'
      } else if (clerkError.code === 'form_password_incorrect') {
        error.value = 'Incorrect password. Please try again.'
      } else if (clerkError.code === 'form_identifier_exists') {
        error.value = 'Account already exists. Please sign in instead.'
      } else if (clerkError.code === 'session_exists') {
        error.value = 'You are already signed in.'
      } else if (clerkError.code === 'verification_failed') {
        error.value = 'Account verification failed. Please try again.'
      } else if (clerkError.code === 'form_param_missing' || clerkError.code === 'form_param_nil') {
        error.value = 'Please fill in all required fields.'
      } else if (clerkError.code === 'form_param_format_invalid') {
        error.value = 'Please check your email format and try again.'
      } else {
        error.value = clerkError.message || clerkError.longMessage || `Authentication failed (${clerkError.code})`
      }
    } else if (err?.message) {
      error.value = err.message
    } else {
      error.value = 'Authentication failed. Please check your connection and try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const resendCode = async () => {
  if (!signUp.value) {
    error.value = 'Unable to resend code. Please refresh and try again.'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    await signUp.value.prepareEmailAddressVerification({ strategy: 'email_code' })
    error.value = 'Verification code sent! Please check your email.'
  } catch (err) {
    error.value = 'Failed to resend code. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.3);
}

.auth-panel {
  width: 100%;
  max-width: 420px;
  background: rgba(10, 1, 1, 0.85);
  border: 1px solid rgba(139, 0, 0, 0.5);
  border-radius: 8px;
  padding: 32px;
  box-shadow:
    0 0 0 1px rgba(255, 107, 53, 0.08) inset,
    0 0 32px rgba(139, 0, 0, 0.4),
    0 8px 64px rgba(0, 0, 0, 0.8);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffd070;
  margin: 0 0 8px;
  text-shadow: 0 0 16px rgba(255, 179, 71, 0.5);
  letter-spacing: 2px;
}

.auth-subtitle {
  font-family: 'Cinzel', serif;
  font-size: 18px;
  color: #c8c0b8;
  margin: 0;
  font-style: italic;
  letter-spacing: 1px;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 24px;
}

.auth-tab {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #c8c0b8;
  background: rgba(18, 2, 2, 0.6);
  border: 1px solid rgba(139, 0, 0, 0.3);
  border-radius: 4px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-tab:hover {
  color: #ff6b35;
  background: rgba(139, 0, 0, 0.2);
  border-color: rgba(139, 0, 0, 0.5);
}

.auth-tab--active {
  color: #ffd070;
  background: rgba(139, 0, 0, 0.25);
  border-color: #c0392b;
  box-shadow: 0 0 12px rgba(139, 0, 0, 0.3);
  text-shadow: 0 0 8px rgba(255, 179, 71, 0.3);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 600;
  color: #c8c0b8;
  letter-spacing: 0.5px;
}

.form-input {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  color: #f0ece4;
  background: rgba(18, 2, 2, 0.8);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 4px;
  padding: 12px 16px;
  outline: none;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: #c8c0b8;
  opacity: 0.6;
}

.form-input:focus {
  border-color: rgba(139, 0, 0, 0.8);
  box-shadow: 0 0 12px rgba(139, 0, 0, 0.2);
  background: rgba(18, 2, 2, 0.95);
}

.error-message {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: #ff4444;
  text-align: center;
  padding: 8px 12px;
  background: rgba(139, 0, 0, 0.15);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 4px;
}

.auth-submit {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ffd070;
  background: rgba(139, 0, 0, 0.4);
  border: 1px solid rgba(139, 0, 0, 0.6);
  border-radius: 4px;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.auth-submit:hover:not(:disabled) {
  color: #fff;
  background: rgba(139, 0, 0, 0.6);
  border-color: #c0392b;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.4);
  text-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-submit--loading {
  color: #c8c0b8;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.auth-note {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: #c8c0b8;
  line-height: 1.4;
  opacity: 0.8;
  font-style: italic;
  margin: 0;
}

.verification-info {
  text-align: center;
  margin-bottom: 20px;
}

.verification-message {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  color: #ffd070;
  margin: 0 0 8px;
  font-weight: 600;
}

.verification-submessage {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: #c8c0b8;
  margin: 0;
  opacity: 0.9;
}

.verification-input {
  text-align: center;
  font-size: 18px;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
}

.resend-btn {
  background: none;
  border: none;
  color: #ff6b35;
  cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  text-decoration: underline;
  transition: color 0.2s;
}

.resend-btn:hover:not(:disabled) {
  color: #ffd070;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .auth-panel {
    max-width: 100%;
    padding: 24px;
  }
  
  .auth-title {
    font-size: 28px;
  }
  
  .auth-tabs {
    gap: 6px;
  }
  
  .auth-tab {
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>