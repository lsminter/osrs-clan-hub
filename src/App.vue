<template>
  <video class="bg-video" src="/bg.webm" autoplay loop muted playsinline></video>
  <div class="bg-overlay"></div>

  <!-- Auth Panel (shown when not authenticated) -->
  <AuthPanel v-if="!isAuthenticated" @authenticated="handleAuthentication" />

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

// Computed properties based on Clerk's authentication state
const isAuthenticated = computed(() => isSignedIn?.value ?? false)
const currentUser = computed(() => user?.value?.username || user?.value?.firstName || 'Warrior')

// Check whether the signed-in user still needs to complete clan setup
const checkClanSetup = async (clerkId) => {
  if (!clerkId) return
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('clan')
      .eq('clerk_id', clerkId)
      .single()
      console.log(data)
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
  }
}

const handleClanSet = (clan) => {
  needsClanSetup.value = false
  // null means the user skipped — go straight to the dashboard, prompt again next login
  if (clan === null) {
    showWelcome.value = false
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

const handleAuthentication = (authData) => {
  // Authentication is now handled by Clerk automatically
  // This function can be used for any additional setup when user signs in
}

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