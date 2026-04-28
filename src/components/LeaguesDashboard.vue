<template>
  <div class="leagues-page">

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

    <!-- Page title -->
    <h1 class="page-title">⚔ Leagues ⚔</h1>

    <!-- Side layout -->
    <div class="side-layout">

      <!-- LEFT: Live Feed -->
      <aside class="side-panel side-left">
        <LiveFeed />
      </aside>

      <!-- MIDDLE: empty (desktop only) -->
      <div class="middle-void" aria-hidden="true"></div>

      <!-- RIGHT: toggled content -->
      <aside class="side-panel side-right">

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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LiveFeed from '@/components/LiveFeed.vue'
import StatTrackers from '@/components/StatTrackers.vue'
import Milestones from '@/components/Milestones.vue'
import LeagueInfoPanel from '@/components/LeagueInfoPanel.vue'
import HallOfFamePanel from '@/components/HallOfFamePanel.vue'

defineProps({
  currentUser: {
    type: String,
    default: 'Warrior'
  }
})

const emit = defineEmits(['back', 'logout'])

const activePanel = ref('stats')
</script>

<style scoped>
/* ── Page wrapper ────────────────────────────────────────────────────────── */
.leagues-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

/* ── Top bar ─────────────────────────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  flex-shrink: 0;
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

/* ── Page title ──────────────────────────────────────────────────────────── */
.page-title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 700;
  letter-spacing: 4px;
  color: #ffd070;
  text-shadow: 0 0 18px rgba(255, 179, 71, 0.4);
  text-align: center;
  margin: 0 0 24px;
  flex-shrink: 0;
}

/* ── Desktop layout ──────────────────────────────────────────────────────── */
.side-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 20fr 1fr 20fr;
  background: linear-gradient(0deg, rgba(5, 0, 0, 0.55) 0%, rgba(5, 0, 0, 0.00) 100%);
}

.side-panel {
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 20px 60px;
  scrollbar-width: thin;
  scrollbar-color: #8b0000 transparent;
}

.middle-void {
  pointer-events: none;
}

/* ── Mobile layout ───────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .leagues-page {
    position: relative;
    inset: auto;
    min-height: 100vh;
  }

  .side-layout {
    flex: none;
    display: flex;
    flex-direction: column;
  }

  .side-panel {
    height: auto;
    min-height: 60vh;
    overflow-y: visible;
    overflow-x: hidden;
    padding: 24px 16px 40px;
  }

  .middle-void {
    display: none;
  }
}

.back-btn {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #c8c0b8;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.back-btn:hover {
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

/* ── Toggle buttons ──────────────────────────────────────────────────────── */
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
</style>
