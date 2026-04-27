<template>
  <div class="clan-overlay">
    <div class="clan-panel">
      <div class="clan-header">
        <h1 class="clan-title">⚔ OSRS Clans ⚔</h1>
        <p class="clan-subtitle">Choose Your Allegiance</p>
      </div>

      <p class="clan-description">
        Are you part of a clan? Enter your clan name below, or continue without one.
      </p>

      <div class="clan-form">
        <div class="form-group" v-if="!skipping">
          <label class="form-label" for="clanName">Clan Name</label>
          <input
            id="clanName"
            v-model="clanName"
            type="text"
            class="form-input"
            placeholder="Enter your clan name..."
            maxlength="100"
            @keydown.enter="handleJoinClan"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button
          class="clan-submit"
          :disabled="isLoading"
          :class="{ 'clan-submit--loading': isLoading }"
          @click="handleJoinClan"
        >
          <span v-if="!isLoading">⚔ Join Clan ⚔</span>
          <span v-else>...</span>
        </button>

        <div class="divider">
          <span class="divider-text">or</span>
        </div>

        <button
          class="no-clan-btn"
          :disabled="isLoading"
          @click="handleNoClan"
        >
          ✦ I Don't Have a Clan ✦
        </button>

        <button
          class="skip-btn"
          :disabled="isLoading"
          @click="handleSkip"
        >
          Skip for now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@clerk/vue'
import { getAuthenticatedSupabase } from '@/supabaseClient.js'

const { getToken } = useAuth()

const props = defineProps({
  clerkId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['clanSet'])

const clanName = ref('')
const isLoading = ref(false)
const error = ref('')
const skipping = ref(false)

const saveClan = async (value) => {
  isLoading.value = true
  error.value = ''

  const token = await getToken.value()
  const authSupabase = getAuthenticatedSupabase(token)

  const { error: dbError } = await authSupabase
    .from('Users')
    .update({ clan: value })
    .eq('id', props.clerkId)

  if (dbError) {
    error.value = 'Failed to save clan. Please try again.'
    isLoading.value = false
    return false
  }

  isLoading.value = false
  return true
}

const handleJoinClan = async () => {
  const trimmed = clanName.value.trim()
  if (!trimmed) {
    error.value = 'Please enter a clan name, or choose "I Don\'t Have a Clan".'
    return
  }
  const ok = await saveClan(trimmed)
  if (ok) emit('clanSet', trimmed)
}

const handleNoClan = async () => {
  // Empty string signals "no clan" (distinct from NULL = "not set yet")
  const ok = await saveClan('')
  if (ok) emit('clanSet', '')
}

// Skip leaves clan as NULL so the user is prompted again next login
const handleSkip = () => {
  emit('clanSet', null)
}
</script>

<style scoped>
.clan-overlay {
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

.clan-panel {
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

.clan-header {
  text-align: center;
  margin-bottom: 20px;
}

.clan-title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffd070;
  margin: 0 0 8px;
  text-shadow: 0 0 16px rgba(255, 179, 71, 0.5);
  letter-spacing: 2px;
}

.clan-subtitle {
  font-family: 'Cinzel', serif;
  font-size: 18px;
  color: #c8c0b8;
  margin: 0;
  font-style: italic;
  letter-spacing: 1px;
}

.clan-description {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: #c8c0b8;
  text-align: center;
  margin: 0 0 24px;
  line-height: 1.6;
  opacity: 0.9;
}

.clan-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.clan-submit {
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
}

.clan-submit:hover:not(:disabled) {
  color: #fff;
  background: rgba(139, 0, 0, 0.6);
  border-color: #c0392b;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.4);
  text-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
}

.clan-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(139, 0, 0, 0.3);
}

.divider-text {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  color: #c8c0b8;
  opacity: 0.6;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.no-clan-btn {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #c8c0b8;
  background: rgba(18, 2, 2, 0.6);
  border: 1px solid rgba(139, 0, 0, 0.3);
  border-radius: 4px;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.no-clan-btn:hover:not(:disabled) {
  color: #ff6b35;
  background: rgba(139, 0, 0, 0.15);
  border-color: rgba(139, 0, 0, 0.5);
}

.no-clan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.skip-btn {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  color: #c8c0b8;
  opacity: 0.5;
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: opacity 0.2s;
  padding: 4px 0;
}

.skip-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.skip-btn:disabled {
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .clan-panel {
    padding: 24px;
  }

  .clan-title {
    font-size: 28px;
  }
}
</style>
