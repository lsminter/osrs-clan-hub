<template>
  <div class="directory-page">

    <!-- Top bar -->
    <div class="top-bar">
      <button class="back-btn" @click="emit('back')">← Clan Home</button>
      <span class="top-bar-spacer"></span>
      <div class="top-bar-right">
        <span class="top-bar-username">{{ currentUser }}</span>
        <button class="logout-btn" @click="emit('logout')">
          ⚡ Logout
        </button>
      </div>
    </div>

    <!-- Title -->
    <div class="page-header">
      <p class="page-label">All Clans</p>
      <h1 class="page-title">Clan Directory</h1>
      <div class="banner-divider"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-message">
      <p>Loading clans...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-message state-error">
      <p>Failed to load clans. Please try again.</p>
    </div>

    <!-- Empty -->
    <div v-else-if="clans.length === 0" class="state-message">
      <p class="placeholder-icon">⸸</p>
      <p class="placeholder-text">No clans found</p>
    </div>

    <!-- Clan list -->
    <div v-else class="clan-list">
      <div
        v-for="(clan, index) in clans"
        :key="clan.name"
        class="clan-row"
      >
        <span class="clan-rank">{{ index + 1 }}</span>
        <span class="clan-name">{{ clan.name }}</span>
        <span class="clan-count">{{ clan.count }} {{ clan.count === 1 ? 'member' : 'members' }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient.js'

defineProps({
  currentUser: {
    type: String,
    default: 'Warrior'
  }
})

const emit = defineEmits(['back', 'logout'])

const loading = ref(true)
const error = ref(false)
const clans = ref([])

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('people_in_a_clan')
      .select('*')
      .limit(30)

    if (fetchError) throw fetchError

    clans.value = data
      .filter(row => row.clan?.trim())
      .map(row => ({ name: row.clan.trim(), count: row.total_count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.directory-page {
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

.back-btn {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #c8c0b8;
  background: transparent;
  border: 1px solid rgba(200, 192, 184, 0.25);
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #ffd070;
  border-color: rgba(255, 208, 112, 0.4);
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

/* ── Page header ─────────────────────────────────────────────── */
.page-header {
  text-align: center;
}

.page-label {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #c8c0b8;
  opacity: 0.6;
  margin: 0 0 8px;
}

.page-title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffd070;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 179, 71, 0.45);
  letter-spacing: 2px;
  line-height: 1.2;
}

.banner-divider {
  width: 60px;
  height: 1px;
  background: rgba(139, 0, 0, 0.7);
  margin: 20px auto 0;
  box-shadow: 0 0 8px rgba(139, 0, 0, 0.4);
}

/* ── State messages ──────────────────────────────────────────── */
.state-message {
  text-align: center;
  font-family: 'Cinzel', serif;
  color: #c8c0b8;
  opacity: 0.6;
  margin-top: 40px;
}

.state-error {
  color: #ff6b35;
  opacity: 0.8;
}

.placeholder-icon {
  font-size: 32px;
  margin: 0 0 12px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.7;
}

/* ── Clan list ───────────────────────────────────────────────── */
.clan-list {
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clan-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(10, 1, 1, 0.7);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 6px;
  padding: 14px 20px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.clan-row:hover {
  border-color: rgba(139, 0, 0, 0.7);
  box-shadow: 0 0 12px rgba(139, 0, 0, 0.2);
}

.clan-rank {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  color: #c8c0b8;
  opacity: 0.4;
  min-width: 24px;
  text-align: right;
}

.clan-name {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffd070;
  letter-spacing: 1px;
  flex: 1;
}

.clan-count {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: #c8c0b8;
  opacity: 0.7;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .directory-page {
    position: relative;
    inset: auto;
    padding: 16px 16px 48px;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
