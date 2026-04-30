<template>
  <div class="clan-home">

    <!-- Top bar -->
    <div class="top-bar">
      <button class="directory-btn" @click="emit('go-to-directory')">
        ☩ Clan Directory
      </button>
      <span class="top-bar-spacer"></span>
      <div class="top-bar-right">
        <span class="top-bar-username">{{ currentUser }}</span>
        <button class="logout-btn" @click="emit('logout')">
          ⚡ Logout
        </button>
      </div>
    </div>

    <!-- Clan name header -->
    <div class="clan-banner">
      <p class="clan-banner-label">Clan</p>
      <h1 class="clan-banner-name">{{ clan || currentUser }}</h1>
      <div class="banner-divider"></div>
    </div>

    <!-- Side layout -->
    <div class="side-layout">

      <!-- MAIN: Competition + nav (first in DOM so it's on top on mobile) -->
      <div class="main-content">

        <!-- Current Competition spotlight -->
        <section class="competition-section">
          <div class="section-header">
            <span class="section-icon">⚔</span>
            <h2 class="section-title">Current Competition</h2>
            <span class="section-icon">⚔</span>
          </div>

          <div class="competition-card">
            <div class="competition-placeholder">
              <p class="placeholder-icon">⸸</p>
              <p class="placeholder-text">No active competition</p>
              <p class="placeholder-sub">Check back soon for the next battle.</p>
            </div>
          </div>
        </section>

        <!-- Navigation into the full dashboard -->
        <div class="nav-section">
          <button class="dashboard-btn" @click="emit('go-to-dashboard')">
            ⚔ View Leagues ⚔
          </button>
        </div>

      </div>

      <!-- LEFT on desktop, bottom on mobile: Clan members -->
      <aside class="side-members">
        <div class="section-header">
          <span class="section-icon">⚔</span>
          <h2 class="section-title">Clan Members</h2>
          <span class="section-icon">⚔</span>
        </div>
        <div class="members-card">
          <div v-if="loading" class="members-state">Loading members...</div>
          <div v-else-if="clanUsernames.length === 0" class="members-state">No members found.</div>
          <ul v-else class="members-list">
            <li v-for="username in clanUsernames" :key="username" class="member-row">
              {{ username }}
            </li>
          </ul>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth, useUser, useClerk } from '@clerk/vue'
import { supabase } from '@/supabaseClient.js'

defineProps({
  clan: {
    type: String,
    default: ''
  },
  currentUser: {
    type: String,
    default: 'Warrior'
  }
})

const { user } = useUser()
const loading = ref(true)
const error = ref(false)
const clanUsernames = ref([])

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('Users')
      .select('clan')
      .eq('clerk_id', user.value.id)
      .single()
    
    const matchValue = data?.clan
    
    const { data: allUsersInClan, error: listError } = await supabase
      .from('Users')
      .select('*')
      .eq('clan', matchValue);

      if (fetchError) throw fetchError
      if (listError) throw listError

      clanUsernames.value = allUsersInClan.map(u => u.username).filter(Boolean)

  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

const emit = defineEmits(['go-to-dashboard', 'go-to-directory', 'logout'])
</script>

<style scoped>
.clan-home {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 20px 28px 60px;
  overflow-y: auto;
  z-index: 1;
}

/* ── Top bar ─────────────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar-spacer {
  flex: 1;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-bar-username {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ffd070;
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
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  color: #ff6b35;
  border-color: #8b0000;
  background: rgba(139, 0, 0, 0.35);
}

/* ── Clan banner ─────────────────────────────────────────────── */
.clan-banner {
  text-align: center;
}

.clan-banner-label {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #c8c0b8;
  opacity: 0.6;
  margin: 0 0 8px;
}

.clan-banner-name {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffd070;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 179, 71, 0.45);
  letter-spacing: 2px;
  line-height: 1.2;
  word-break: break-word;
}

.banner-divider {
  width: 60px;
  height: 1px;
  background: rgba(139, 0, 0, 0.7);
  margin: 20px auto 0;
  box-shadow: 0 0 8px rgba(139, 0, 0, 0.4);
}

/* ── Section shared styles ──────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c8c0b8;
  margin: 0;
}

.section-icon {
  font-size: 13px;
  color: rgba(139, 0, 0, 0.8);
}

/* ── Side layout ────────────────────────────────────────────── */
.side-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex: 1;
}

.side-members {
  flex: 0 0 220px;
  position: sticky;
  top: 0;
  order: -1;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Competition card ────────────────────────────────────────── */
.competition-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.competition-card {
  background: rgba(10, 1, 1, 0.7);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 6px;
  padding: 56px 24px;
  box-shadow:
    0 0 0 1px rgba(255, 107, 53, 0.05) inset,
    0 0 20px rgba(139, 0, 0, 0.2);
}

.competition-placeholder {
  text-align: center;
}

.placeholder-icon {
  font-size: 32px;
  margin: 0 0 12px;
  opacity: 0.3;
  color: #c8c0b8;
}

.placeholder-text {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 600;
  color: #c8c0b8;
  margin: 0 0 8px;
  opacity: 0.7;
}

.placeholder-sub {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: #c8c0b8;
  margin: 0;
  opacity: 0.45;
  font-style: italic;
}

/* ── Clan members ────────────────────────────────────────────── */
.members-card {
  background: rgba(10, 1, 1, 0.7);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 6px;
  padding: 8px 0;
  box-shadow:
    0 0 0 1px rgba(255, 107, 53, 0.05) inset,
    0 0 20px rgba(139, 0, 0, 0.2);
}

.members-state {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: #c8c0b8;
  opacity: 0.5;
  text-align: center;
  padding: 24px;
}

.members-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.member-row {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: #c8c0b8;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(139, 0, 0, 0.2);
  transition: background 0.15s, color 0.15s;
}

.member-row:last-child {
  border-bottom: none;
}

.member-row:hover {
  background: rgba(139, 0, 0, 0.12);
  color: #ffd070;
}

/* ── Dashboard nav button ───────────────────────────────────── */
.nav-section {
  display: flex;
  justify-content: center;
}

.dashboard-btn {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ffd070;
  background: rgba(139, 0, 0, 0.35);
  border: 1px solid rgba(139, 0, 0, 0.6);
  border-radius: 6px;
  padding: 14px 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.dashboard-btn:hover {
  color: #fff;
  background: rgba(139, 0, 0, 0.55);
  border-color: #c0392b;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.4);
  text-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
}

.directory-btn {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c8c0b8;
  background: rgba(10, 1, 1, 0.5);
  border: 1px solid rgba(200, 192, 184, 0.3);
  border-radius: 6px;
  padding: 14px 32px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 230px;
}

.directory-btn:hover {
  color: #ffd070;
  border-color: rgba(255, 208, 112, 0.5);
  box-shadow: 0 0 16px rgba(255, 208, 112, 0.15);
}

@media (max-width: 768px) {
  .clan-home {
    position: relative;
    inset: auto;
    padding: 16px 16px 48px;
  }

  .side-layout {
    flex-direction: column;
  }

  .side-members {
    flex: none;
    width: 100%;
    position: static;
    order: 0;
  }

  .clan-banner-name {
    font-size: 26px;
  }

  .main-content {
    width: 100%;
  }

  .competition-section,
  .competition-card,
  .nav-section {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .dashboard-btn,
  .directory-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
