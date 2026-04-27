<template>
  <video class="bg-video" src="/bg.webm" autoplay loop muted playsinline></video>
  <div class="bg-overlay"></div>

  <!-- Auth Panel (shown when not authenticated) -->
  <AuthPanel v-if="!isAuthenticated" @authenticated="handleAuthentication" />

  <!-- Main Dashboard (shown when authenticated) -->
  <div v-else class="side-layout">

    <!-- LEFT: Live Feed -->
    <aside class="side-panel side-left">
      <LiveFeed />
    </aside>

    <!-- MIDDLE: empty (desktop only) -->
    <div class="middle-void" aria-hidden="true"></div>

    <!-- RIGHT: toggled content -->
    <aside class="side-panel side-right">

      <!-- User info and logout -->
      <div class="user-bar">
        <span class="welcome-text">⚔ Welcome, {{ currentUser }} ⚔</span>
        <button class="logout-btn" @click="handleLogout">
          ⚡ Logout
        </button>
      </div>

      <div class="panel-toggles">
        <button class="toggle-btn" :class="{ 'toggle-btn--active': activePanel === 'stats' }"
          @click="activePanel = 'stats'">
          ⚔ Clan Stats
        </button>
        <button class="toggle-btn" :class="{ 'toggle-btn--active': activePanel === 'milestones' }"
          @click="activePanel = 'milestones'">
          ⸸ Milestones
        </button>
        <button class="toggle-btn" :class="{ 'toggle-btn--active': activePanel === 'league' }"
          @click="activePanel = 'league'">
          ⚿ League Info
        </button>
        <button class="toggle-btn" :class="{ 'toggle-btn--active': activePanel === 'halloffame' }"
          @click="activePanel = 'halloffame'">
          ☩ Hall of Fame
        </button>
      </div>

      <template v-if="activePanel === 'stats'">
        <StatTrackers />
      </template>

      <template v-else-if="activePanel === 'milestones'">
        <Milestones />
      </template>

      <template v-else-if="activePanel === 'league'">
        <LeagueInfoPanel />
      </template>

      <template v-else>
        <HallOfFamePanel />
      </template>

    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import LiveFeed from '@/components/LiveFeed.vue'
import StatTrackers from '@/components/StatTrackers.vue'
import Milestones from '@/components/Milestones.vue'
import LeagueInfoPanel from '@/components/LeagueInfoPanel.vue'
import HallOfFamePanel from '@/components/HallOfFamePanel.vue'
import AuthPanel from '@/components/AuthPanel.vue'
import { initStats, closeStats } from '@/stores/statsStore.js'
import { useAuth, useUser, useClerk } from '@clerk/vue'
import { supabase } from '@/supabaseClient.js'

async function getData() {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
    
    if (error) {
      console.error('Supabase error:', error.message)
    }
    // Data is available for use but not logged
    return data
  } catch (err) {
    console.error('Error fetching data:', err.message)
  }
}

// Call getData when component is mounted instead of immediately
const callGetData = () => {
  setTimeout(() => {
    getData()
  }, 1000) // Delay to ensure everything is initialized
}
callGetData()

const { isSignedIn } = useAuth()
const { user } = useUser()
const { signOut } = useClerk()

const activePanel = ref('stats')

// Computed properties based on Clerk's authentication state
const isAuthenticated = computed(() => isSignedIn?.value ?? false)
const currentUser = computed(() => user?.value?.username || user?.value?.firstName || 'Warrior')

// Watch for authentication changes to initialize/cleanup stats
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    initStats()
  } else {
    closeStats()
  }
}, { immediate: true })

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

/* ── Desktop layout ──────────────────────────────────────────────────────── */
.side-layout {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 20fr 1fr 20fr;
  z-index: 1;
}

.side-panel {
  min-height: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 28px 20px 60px;
  scrollbar-width: thin;
  scrollbar-color: #8b0000 transparent;
}

.side-left {
  background: linear-gradient(90deg, rgba(5, 0, 0, 0.55) 0%, rgba(5, 0, 0, 0.08) 100%);
}

.side-right {
  background: linear-gradient(270deg, rgba(5, 0, 0, 0.55) 0%, rgba(5, 0, 0, 0.08) 100%);
}

.middle-void {
  pointer-events: none;
}

/* ── Mobile layout ───────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .side-layout {
    position: relative;
    inset: auto;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .side-panel {
    height: auto;
    min-height: 100vh;
    overflow-y: visible;
    overflow-x: hidden;
    padding: 24px 16px 40px;
  }

  /* On mobile both panels get full-width solid backgrounds */
  .side-left {
    background: rgba(5, 0, 0, 0.78);
  }

  .side-right {
    background: rgba(5, 0, 0, 0.78);
  }

  .middle-void {
    display: none;
  }
}

/* ── Toggle buttons ──────────────────────────────────────────────────────── */
.user-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: rgba(18, 2, 2, 0.6);
  border: 1px solid rgba(139, 0, 0, 0.3);
  border-radius: 6px;
  gap: 12px;
}

.welcome-text {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ffd070;
  text-shadow: 0 0 8px rgba(255, 179, 71, 0.3);
}

.logout-btn {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #c8c0b8;
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.logout-btn:hover {
  color: #ff6b35;
  border-color: #8b0000;
  background: rgba(139, 0, 0, 0.35);
}

.panel-toggles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.toggle-btn {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #e8e0d4;
  background: rgba(18, 2, 2, 0.75);
  border: 1px solid rgba(139, 0, 0, 0.45);
  border-radius: 6px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.toggle-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 60, 0, 0.04) 0%, transparent 60%);
  pointer-events: none;
}

.toggle-btn:hover {
  color: #ff6b35;
  border-color: #8b0000;
  background: rgba(139, 0, 0, 0.2);
  box-shadow: 0 0 16px rgba(139, 0, 0, 0.3);
}

.toggle-btn--active {
  color: #ffd070;
  background: rgba(139, 0, 0, 0.35);
  border-color: #c0392b;
  box-shadow:
    0 0 20px rgba(139, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 107, 53, 0.15);
  text-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
}

.toggle-btn--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff6b35, transparent);
  box-shadow: 0 0 8px #ff6b35;
}

@media (max-width: 768px) {
  .toggle-btn {
    font-size: 13px;
    padding: 10px 12px;
    letter-spacing: 1px;
  }
}

.col-spacer {
  height: 28px;
  flex-shrink: 0;
}

</style>