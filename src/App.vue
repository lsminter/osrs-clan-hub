<template>
  <video class="bg-video" src="/bg.webm" autoplay loop muted playsinline></video>
  <div class="bg-overlay"></div>

  <!-- Auth Panel (shown when not authenticated) -->
  <AuthPanel v-if="!isAuthenticated" />

  <!-- Loading state while checking clan setup -->
  <div v-else-if="isCheckingClan" class="loading-screen">
    <p class="loading-text">Entering the Realm...</p>
    <div class="loading-bar"><div class="loading-fill"></div></div>
  </div>

  <!-- Clan Setup (shown after signup, before dashboard) -->
  <ClanSetup
    v-else-if="needsClanSetup"
    :clerk-id="user?.id"
    @clan-set="handleClanSet"
  />

  <!-- Leagues (navigated to from Clan Home) -->
  <LeaguesDashboard
    v-else-if="activePage === 'leagues'"
    :current-user="currentUser"
    @back="activePage = 'home'"
    @logout="handleLogout"
  />

  <!-- Clan Home (default authenticated view) -->
  <ClanHomePage
    v-else
    :clan="userClan"
    :current-user="currentUser"
    @go-to-dashboard="activePage = 'leagues'"
    @logout="handleLogout"
  />
</template>

<script setup>
import { ref, onUnmounted, computed, watch } from 'vue'
import AuthPanel from '@/components/AuthPanel.vue'
import ClanSetup from '@/components/ClanSetup.vue'
import ClanHomePage from '@/components/ClanHomePage.vue'
import LeaguesDashboard from '@/components/LeaguesDashboard.vue'
import { initStats, closeStats } from '@/stores/statsStore.js'
import { useAuth, useUser, useClerk } from '@clerk/vue'
import { supabase } from '@/supabaseClient.js'

const { isSignedIn } = useAuth()
const { user } = useUser()
const { signOut } = useClerk()

async function getData() {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('clerk_id', user.value.id)
      .single()
    
    if (error) {
      console.error('Supabase error:', error.message)
    }
    return data
  } catch (err) {
    console.error('Error fetching data:', err.message)
  }
}

const activePage = ref('home')
const needsClanSetup = ref(false)
const showWelcome = ref(false)
const userClan = ref('')
const isCheckingClan = ref(false)

// Computed properties based on Clerk's authentication state
const isAuthenticated = computed(() => isSignedIn?.value ?? false)
const currentUser = computed(() => user?.value?.username || user?.value?.firstName || 'Warrior')

// Check whether the signed-in user still needs to complete clan setup
const checkClanSetup = async (clerkId) => {
  if (!clerkId) return
  isCheckingClan.value = true
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('clan')
      .eq('clerk_id', clerkId)
      .single()
      console.log("Check if user has a clan name", data)
    if (!error && data && data.clan === null) {
      needsClanSetup.value = true
      showWelcome.value = false
    } else {
      needsClanSetup.value = false
      userClan.value = data?.clan ?? ''
      showWelcome.value = true
    }
  } catch {
    needsClanSetup.value = false
  } finally {
    isCheckingClan.value = false
  }
}

const handleClanSet = (clan) => {
  needsClanSetup.value = false
  // null means the user skipped — go straight to the dashboard, prompt again next login
  if (clan === null) {
    showWelcome.value = false
    console.log("handleClanSet: Clan equals null")
    return
  }
  userClan.value = clan
  showWelcome.value = true
}

// Watch for authentication changes to initialize/cleanup stats
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    initStats()
    // user.value may not be populated yet; the watcher below will handle it
    checkClanSetup(user?.value?.id)
  } else {
    needsClanSetup.value = false
    showWelcome.value = false
    userClan.value = ''
    activePage.value = 'home'
    isCheckingClan.value = false
    closeStats()
  }
}, { immediate: true })

// Clerk loads user data asynchronously after isAuthenticated becomes true.
// Re-run clan check once the user id is available.
watch(() => user?.value?.id, (newId) => {
  if (newId && isAuthenticated.value) {
    checkClanSetup(newId)
  }
})

onUnmounted(closeStats)

const handleLogout = async () => {
  try {
    // Get the clerk instance and clear everything
    const clerkInstance = clerk.value
    if (clerkInstance) {
      // Try to clear all sessions using Clerk's internal methods
      await clerkInstance.signOut()
      
      // Also clear the active session specifically
      if (clerkInstance.session) {
        await clerkInstance.setActive({ session: null })
      }
      
      // Clear the user data
      if (clerkInstance.user) {
        clerkInstance.user = null
      }
    }
    
  } catch (error) {
    console.error('Clerk logout failed:', error)
  }
  
  // Nuclear option - immediately clear everything and reload
  localStorage.clear()
  sessionStorage.clear()
  
  // Clear ALL cookies
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    if (name) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.clerk.accounts.dev"
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.clerk.dev"
    }
  })
  
  // Force immediate reload
  window.location.href = window.location.origin + window.location.pathname
}
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

/* Desktop: no page scroll, panels scroll independently */
@media (min-width: 769px) {

  html,
  body,
  #app {
    overflow: hidden;
  }
}

/* Mobile: page itself scrolls */
@media (max-width: 768px) {

  html,
  body,
  #app {
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>

<style scoped>
/* ── Loading screen ──────────────────────────────────────────────────────── */
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 10;
}

.loading-text {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: clamp(16px, 2.5vw, 24px);
  font-weight: 700;
  letter-spacing: 4px;
  color: #ffd070;
  text-shadow: 0 0 18px rgba(255, 179, 71, 0.5);
  animation: pulse 1.6s ease-in-out infinite;
}

.loading-bar {
  width: min(280px, 60vw);
  height: 4px;
  background: rgba(139, 0, 0, 0.25);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(139, 0, 0, 0.4);
}

.loading-fill {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, transparent, #c0392b, #ffd070, #c0392b, transparent);
  border-radius: 2px;
  animation: sweep 1.4s ease-in-out infinite;
}

@keyframes sweep {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(350%); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── Background ──────────────────────────────────────────────────────────── */
.bg-video {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: -2;
  pointer-events: none;
}

.bg-overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.25) 100%),
    rgba(5, 0, 0, 0.25);
}
</style>