<template>
  <div class="clan-home">

    <!-- Top bar -->
    <div class="top-bar">
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
</template>

<script setup>
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

const emit = defineEmits(['go-to-dashboard', 'logout'])
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

/* ── Competition card ────────────────────────────────────────── */
.competition-section {
  display: flex;
  flex-direction: column;
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .clan-home {
    position: relative;
    inset: auto;
    padding: 16px 16px 48px;
  }

  .clan-banner-name {
    font-size: 26px;
  }

  .dashboard-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
