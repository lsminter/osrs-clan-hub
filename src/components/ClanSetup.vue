<template>
  <div class="clan-overlay">
    <div class="clan-panel">
      <div class="clan-header">
        <h1 class="clan-title">⚔ OSRS Clans ⚔</h1>
        <p class="clan-subtitle">Choose Your Allegiance</p>
      </div>

      <!-- Mode tabs -->
      <div class="mode-tabs">
        <button class="mode-tab" :class="{ 'mode-tab--active': mode === 'search' }" @click="switchMode('search')">
          Search
        </button>
        <button class="mode-tab" :class="{ 'mode-tab--active': mode === 'create' }" @click="switchMode('create')">
          Create
        </button>
      </div>

      <p class="clan-description">
        <template v-if="mode === 'search'">Search for your clan below, or continue without one.</template>
        <template v-else>Found your friends but no clan yet? Create one.</template>
      </p>

      <div class="clan-form">

        <!-- CREATE mode -->
        <template v-if="mode === 'create'">
          <div class="form-group">
            <label class="form-label" for="newClanName">Clan Name</label>
            <input
              id="newClanName"
              v-model="newClanName"
              type="text"
              class="form-input"
              placeholder="Enter a unique clan name..."
              maxlength="100"
              autocomplete="off"
              @keydown.enter="handleCreateClan"
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button
            class="clan-submit"
            :disabled="isLoading || !newClanName.trim()"
            :class="{ 'clan-submit--loading': isLoading }"
            @click="handleCreateClan"
          >
            <span v-if="!isLoading">⚔ Create Clan ⚔</span>
            <span v-else>...</span>
          </button>

          <div class="divider"><span class="divider-text">or</span></div>

          <button class="no-clan-btn" :disabled="isLoading" @click="handleNoClan">
            ✦ I Don't Have a Clan ✦
          </button>
          <button class="skip-btn" :disabled="isLoading" @click="handleSkip">Skip for now</button>
        </template>

        <!-- SEARCH mode -->
        <template v-else>
        <div class="form-group">
          <label class="form-label" for="clanSearch">Search Clans</label>
          <div class="search-wrapper">
            <input
              id="clanSearch"
              v-model="searchQuery"
              type="text"
              class="form-input"
              :class="{ 'form-input--selected': selectedClan }"
              placeholder="Type to search clans..."
              maxlength="100"
              autocomplete="off"
              @input="onSearchInput"
              @keydown.escape="closeDropdown"
              @keydown.enter="selectHighlighted"
              @keydown.down.prevent="moveHighlight(1)"
              @keydown.up.prevent="moveHighlight(-1)"
            />
            <button v-if="selectedClan" class="clear-btn" @click="clearSelection" title="Clear selection">✕</button>
            <span v-else-if="isSearching" class="search-spinner">⟳</span>
          </div>

          <div v-if="selectedClan" class="selected-badge">
            <span class="selected-label">Selected:</span>
            <span class="selected-name">{{ selectedClan }}</span>
          </div>

          <div v-if="showDropdown && results.length" class="results-dropdown">
            <button
              v-for="(clan, i) in results"
              :key="clan"
              class="result-item"
              :class="{ 'result-item--highlighted': highlightIndex === i }"
              @mousedown.prevent="selectClan(clan)"
            >
              ⚔ {{ clan }}
            </button>
          </div>
          <div
            v-else-if="showDropdown && searchQuery.length >= 2 && !isSearching"
            class="no-results"
          >
            No clans found for "{{ searchQuery }}"
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button
          class="clan-submit"
          :disabled="isLoading || !selectedClan"
          :class="{ 'clan-submit--loading': isLoading }"
          @click="handleJoinClan"
        >
          <span v-if="!isLoading">⚔ Join Clan ⚔</span>
          <span v-else>...</span>
        </button>

        <div class="divider">
          <span class="divider-text">or</span>
        </div>

        <button class="no-clan-btn" :disabled="isLoading" @click="handleNoClan">
          ✦ I Don't Have a Clan ✦
        </button>

        <button class="skip-btn" :disabled="isLoading" @click="handleSkip">
          Skip for now
        </button>
        </template>
        <!-- end SEARCH mode -->

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

const mode = ref('search') // 'search' | 'create'
const searchQuery = ref('')
const selectedClan = ref('')
const results = ref([])
const showDropdown = ref(false)
const isSearching = ref(false)
const isLoading = ref(false)
const error = ref('')
const highlightIndex = ref(-1)
const newClanName = ref('')
let searchTimeout = null

const switchMode = (m) => {
  mode.value = m
  error.value = ''
  // reset both forms
  searchQuery.value = ''
  selectedClan.value = ''
  results.value = []
  showDropdown.value = false
  newClanName.value = ''
}

const onSearchInput = () => {
  selectedClan.value = ''
  highlightIndex.value = -1
  error.value = ''
  clearTimeout(searchTimeout)

  if (searchQuery.value.length < 2) {
    results.value = []
    showDropdown.value = false
    return
  }

  showDropdown.value = true
  isSearching.value = true
  searchTimeout = setTimeout(searchClans, 300)
}

const searchClans = async () => {
  try {
    const token = await getToken.value()
    const authSupabase = getAuthenticatedSupabase(token)

    const { data, error: dbError } = await authSupabase
      .from('Clan')
      .select('clan_name')
      .ilike('clan_name', `%${searchQuery.value.trim()}%`)
      .limit(20)

    if (!dbError && data) {
      results.value = data.map(r => r.clan_name).filter(Boolean).slice(0, 8)
    } else {
      results.value = []
    }
  } catch {
    results.value = []
  } finally {
    isSearching.value = false
  }
}

const selectClan = (clan) => {
  selectedClan.value = clan
  searchQuery.value = clan
  showDropdown.value = false
  highlightIndex.value = -1
}

const clearSelection = () => {
  selectedClan.value = ''
  searchQuery.value = ''
  results.value = []
  showDropdown.value = false
}

const closeDropdown = () => {
  showDropdown.value = false
}

const moveHighlight = (dir) => {
  if (!results.value.length) return
  highlightIndex.value = (highlightIndex.value + dir + results.value.length) % results.value.length
}

const selectHighlighted = () => {
  if (highlightIndex.value >= 0 && results.value[highlightIndex.value]) {
    selectClan(results.value[highlightIndex.value])
  } else if (results.value.length === 1) {
    selectClan(results.value[0])
  }
}

const saveClan = async (value) => {
  isLoading.value = true
  error.value = ''

  const token = await getToken.value()
  const authSupabase = getAuthenticatedSupabase(token)

  const { data, error: dbError } = await authSupabase
    .from('Users')
    .update({ clan: value })
    .eq('clerk_id', props.clerkId)
    .select()

  isLoading.value = false

  if (dbError) {
    console.error('saveClan DB error:', dbError)
    error.value = 'Failed to save clan. Please try again.'
    return false
  }

  if (!data || data.length === 0) {
    console.error('saveClan: update matched 0 rows. clerk_id may not match or RLS is blocking.', { clerkId: props.clerkId })
    error.value = 'Could not update your clan — please contact support.'
    return false
  }

  console.log('saveClan: success', data)
  return true
}

const handleCreateClan = async () => {
  const trimmed = newClanName.value.trim()
  if (!trimmed) {
    error.value = 'Please enter a clan name.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const token = await getToken.value()
    const authSupabase = getAuthenticatedSupabase(token)

    // 1. Check if clan already exists in the Clan table (case-insensitive)
    const { data: existing, error: checkError } = await authSupabase
      .from('Clan')
      .select('clan_name')
      .ilike('clan_name', trimmed)
      .limit(1)

    if (checkError) {
      error.value = 'Could not verify clan name. Please try again.'
      isLoading.value = false
      return
    }

    if (existing && existing.length > 0) {
      error.value = `"${trimmed}" already exists. Search for it instead.`
      isLoading.value = false
      return
    }

    // 2. Insert new clan into the Clan table
    const { error: insertError } = await authSupabase
      .from('Clan')
      .insert({ clan_name: trimmed })

    if (insertError) {
      // The insert may have succeeded even if Supabase returns an error
      // (e.g. INSERT policy exists but SELECT policy is missing — row is written
      //  but the client can't read it back). Verify before giving up.
      const { data: verify } = await authSupabase
        .from('Clan')
        .select('clan_name')
        .ilike('clan_name', trimmed)
        .limit(1)

        console.log({verify: verify, insertError: insertError, error: "There's an error"})

      if (!verify || verify.length === 0) {
        error.value = 'Failed to create clan. Please try again.'
        isLoading.value = false
        return
      }
      // Insert succeeded — the error was only about reading the row back
    }
  } catch {
    error.value = 'An unexpected error occurred. Please try again.'
    isLoading.value = false
    return
  }

  isLoading.value = false

  // 3. Save clan name to the user's record
  const ok = await saveClan(trimmed)
  if (ok) emit('clanSet', trimmed)
}

const handleJoinClan = async () => {
  if (!selectedClan.value) {
    error.value = 'Please select a clan from the search results.'
    return
  }
  const ok = await saveClan(selectedClan.value)
  if (ok) emit('clanSet', selectedClan.value)
}

const handleNoClan = async () => {
  const ok = await saveClan('')
  if (ok) emit('clanSet', '')
}

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
  margin-bottom: 16px;
}

/* ── Mode tabs ───────────────────────────────────────────────── */
.mode-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 4px;
  overflow: hidden;
}

.mode-tab {
  flex: 1;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #c8c0b8;
  background: rgba(18, 2, 2, 0.6);
  border: none;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab + .mode-tab {
  border-left: 1px solid rgba(139, 0, 0, 0.4);
}

.mode-tab:hover:not(.mode-tab--active) {
  color: #ffd070;
  background: rgba(139, 0, 0, 0.15);
}

.mode-tab--active {
  color: #ffd070;
  background: rgba(139, 0, 0, 0.35);
  text-shadow: 0 0 8px rgba(255, 179, 71, 0.4);
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
  position: relative;
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

.form-input--selected {
  border-color: rgba(192, 57, 43, 0.7);
  color: #ffd070;
}

/* ── Search wrapper / dropdown ───────────────────────────────── */
.search-wrapper {
  position: relative;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #c8c0b8;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.clear-btn:hover {
  opacity: 1;
  color: #ff4444;
}

.search-spinner {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #c8c0b8;
  font-size: 16px;
  opacity: 0.6;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

.selected-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(192, 57, 43, 0.12);
  border: 1px solid rgba(192, 57, 43, 0.35);
  border-radius: 4px;
}

.selected-label {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  color: #c8c0b8;
  opacity: 0.7;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.selected-name {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffd070;
  letter-spacing: 1px;
}

.results-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  background: rgba(10, 1, 1, 0.97);
  border: 1px solid rgba(139, 0, 0, 0.5);
  border-radius: 4px;
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
}

.result-item {
  display: block;
  width: 100%;
  text-align: left;
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #e8e0d4;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(139, 0, 0, 0.15);
  padding: 11px 16px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover,
.result-item--highlighted {
  background: rgba(139, 0, 0, 0.25);
  color: #ffd070;
}

.no-results {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: #c8c0b8;
  opacity: 0.6;
  text-align: center;
  padding: 10px 0 2px;
  letter-spacing: 0.3px;
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
