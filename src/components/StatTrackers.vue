<template>
    <section class="stat-trackers">
        <div class="section-header">
            <h2 class="section-title">Clan Stats</h2>
        </div>

        <div class="trackers-list">
            <div v-for="tracker in trackers" :key="tracker.key" class="tracker-card panel"
                :class="[`tracker--${tracker.key}`, { 'is-expanded': expanded[tracker.key] }]">

                <div class="card-header" @click="toggle(tracker.key)">
                    <div class="card-title-group">
                        <span class="card-label">{{ tracker.label }}</span>
                        <span class="card-total" :class="{ 'total--bad': tracker.key === 'deaths' }">
                            {{ tracker.format(clanTotal(tracker.key)) }}
                        </span>
                    </div>
                    <div class="card-meta">
                        <span class="card-leader">
                            #1 {{ topPlayer(tracker.key)?.name }}
                            <span class="leader-val">{{ tracker.format(topPlayer(tracker.key)?.[tracker.key] ?? 0)
                                }}</span>
                        </span>
                        <button class="expand-btn" :aria-label="expanded[tracker.key] ? 'Collapse' : 'Expand'">
                            <span class="expand-chevron" :class="{ 'is-open': expanded[tracker.key] }">▾</span>
                        </button>
                    </div>
                </div>

                <Transition name="expand">
                    <div v-if="expanded[tracker.key]" class="leaderboard">
                        <div class="leaderboard-scroll">
                            <div v-for="(player, idx) in sorted(tracker.key)" :key="player.name" class="lb-row"
                                :class="tracker.key === 'leaguePoints' ? getRank(player.leaguePoints)?.cls : ''">
                                <span class="lb-pos">{{ idx + 1 }}</span>
                                <span class="lb-name">{{ player.name }}</span>
                                <span v-if="tracker.key === 'leaguePoints'" class="lb-rank-badge"
                                    :class="getRank(player.leaguePoints)?.cls ?? 'lb-rank-badge--none'">
                                    {{ getRank(player.leaguePoints)?.name ?? '—' }}
                                </span>
                                <div class="lb-bar-wrap">
                                    <div class="lb-bar" :class="{ 'lb-bar--bad': tracker.key === 'deaths' }"
                                        :style="{ width: barWidth(player[tracker.key], tracker.key) + '%' }"></div>
                                </div>
                                <span class="lb-val" :class="{ 'lb-val--bad': tracker.key === 'deaths' }">
                                    {{ tracker.format(player[tracker.key]) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </Transition>

            </div>
        </div>
    </section>
</template>

<script setup>
import { reactive } from 'vue'
import { players } from '@/stores/statsStore.js'

const RANK_TIERS = [
    { min: 60000, name: 'Dragon', cls: 'rank-dragon' },
    { min: 45000, name: 'Rune', cls: 'rank-rune' },
    { min: 30000, name: 'Adamant', cls: 'rank-adamant' },
    { min: 20000, name: 'Mithril', cls: 'rank-mithril' },
    { min: 10000, name: 'Steel', cls: 'rank-steel' },
    { min: 4000, name: 'Iron', cls: 'rank-iron' },
    { min: 2000, name: 'Bronze', cls: 'rank-bronze' },
]

function getRank(points) { return RANK_TIERS.find(t => points >= t.min) ?? null }

const expanded = reactive({})
function toggle(key) { expanded[key] = !expanded[key] }

function fmtNum(v) {
    if (v >= 1_000_000_000) return `${parseFloat((v / 1_000_000_000).toFixed(2))}B`
    if (v >= 1_000_000) return `${parseFloat((v / 1_000_000).toFixed(1))}M`
    if (v >= 1_000) return `${parseFloat((v / 1_000).toFixed(1))}K`
    return `${v}`
}

const trackers = [
    { key: 'gpEarned', label: 'GP Earned', format: fmtNum },
    { key: 'itemsReceived', label: 'Items Received', format: fmtNum },
    { key: 'levelsEarned', label: 'Levels Earned', format: fmtNum },
    { key: 'petsEarned', label: 'Pets Earned', format: fmtNum },
    { key: 'deaths', label: 'Deaths', format: fmtNum },
    { key: 'clogsEarned', label: 'Clog Slots', format: fmtNum },
    { key: 'combatTasks', label: 'Combat Tasks', format: fmtNum },
    { key: 'clueScrolls', label: 'Clue Scrolls', format: fmtNum },
    { key: 'killCount', label: 'Kill Count', format: fmtNum },
    { key: 'leagueTasks', label: 'League Tasks', format: fmtNum },
    { key: 'leaguePoints', label: 'League Points', format: fmtNum },
]

function sorted(key) { return [...players.value].sort((a, b) => b[key] - a[key]) }
function topN(key, n) { return sorted(key).slice(0, n) }
function restN(key, n) { return sorted(key).slice(n) }
function topPlayer(key) { return sorted(key)[0] }
function clanTotal(key) { return players.value.reduce((s, p) => s + p[key], 0) }
function barWidth(val, key) {
    const max = Math.max(...players.value.map(p => p[key]))
    return max === 0 ? 0 : Math.round((val / max) * 100)
}


</script>

<style scoped>
.stat-trackers {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.section-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.section-title {
    font-family: 'Cinzel Decorative', 'Cinzel', serif;
    font-size: 29px;
    font-weight: 700;
    color: #ffd070;
    letter-spacing: 2px;
    text-shadow: 0 0 12px rgba(255, 179, 71, 0.4);
}

.section-subtitle {
    font-size: 21px;
    color: #c8c0b8;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-style: italic;
}

.trackers-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.tracker-card {
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
}

.tracker-card:hover {
    box-shadow: 0 0 0 1px rgba(139, 0, 0, 0.45) inset, 0 0 22px rgba(160, 8, 8, 0.2), 0 4px 24px rgba(0, 0, 0, 0.65);
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 16px 11px;
    cursor: pointer;
    user-select: none;
    gap: 12px;
    border-bottom: 1px solid rgba(139, 0, 0, 0.15);
    transition: background 0.15s;
}

.card-header:hover {
    background: rgba(139, 0, 0, 0.06);
}

.is-expanded .card-header {
    border-bottom-color: rgba(139, 0, 0, 0.3);
}

.card-title-group {
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
}

.card-label {
    font-family: 'Cinzel', serif;
    font-size: 19px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #c8c0b8;
    white-space: nowrap;
}

.card-total {
    font-family: 'Cinzel', serif;
    font-size: 24px;
    font-weight: 700;
    color: #ffd070;
    line-height: 1;
    text-shadow: 0 0 8px rgba(255, 179, 71, 0.3);
    white-space: nowrap;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
}

.card-leader {
    font-family: 'Cinzel', serif;
    font-size: 19px;
    color: #c8c0b8;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    min-width: 0;
}

.leader-val {
    color: #ff6b35;
    font-weight: 600;
}

.expand-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: border-color 0.15s, background 0.15s;
}

.expand-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.4);
}

.expand-chevron {
    color: #c8c0b8;
    font-size: 19px;
    line-height: 1;
    transition: transform 0.25s ease;
    display: block;
}

.expand-chevron.is-open {
    transform: rotate(180deg);
}

.leaderboard {
    padding: 8px 16px 12px;
}

.leaderboard-scroll {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #8b0000 transparent;
    padding-right: 12px;
}

.leaderboard--rest {
    padding-top: 0;
    border-top: 1px dashed rgba(139, 0, 0, 0.2);
}

.lb-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 0;
}


.lb-pos {
    font-family: 'Cinzel', serif;
    font-size: 19px;
    color: #c8c0b8;
    width: 18px;
    text-align: right;
    flex-shrink: 0;
}


.lb-name {
    font-family: 'Cinzel', serif;
    font-size: 21px;
    width: 130px;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.lb-bar-wrap {
    flex: 1;
    height: 6px;
    background: rgba(139, 0, 0, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.lb-bar {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #8b0000, #c0392b);
    transition: width 0.9s ease;
}


.lb-bar--bad {
    background: linear-gradient(90deg, #5a0000, #c0392b);
}

.lb-bar--rest {
    background: rgba(139, 0, 0, 0.35);
}

.lb-val {
    font-family: 'Cinzel', serif;
    font-size: 21px;
    font-weight: 600;
    color: #ffd070;
    flex-shrink: 0;
    min-width: 44px;
    text-align: right;
}

.lb-val--bad {
    color: #c0392b;
}

.lb-val--dim {
    color: #c8c0b8;
    font-weight: 400;
}

/* ── League Points rank badges ── */
.lb-rank-badge {
    font-family: 'Cinzel', serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid currentColor;
    flex-shrink: 0;
    opacity: 0.9;
}

.lb-rank-badge--none {
    color: #c8c0b8;
    border-color: transparent;
    opacity: 0.3;
}

.rank-dragon {
    --rank-color: #e03030;
}

.rank-rune {
    --rank-color: #00cece;
}

.rank-adamant {
    --rank-color: #4caf50;
}

.rank-mithril {
    --rank-color: #8080e0;
}

.rank-steel {
    --rank-color: #a8b8c8;
}

.rank-iron {
    --rank-color: #909090;
}

.rank-bronze {
    --rank-color: #cd7f32;
}

.lb-row.rank-dragon .lb-name,
.lb-row.rank-dragon .lb-val {
    color: #e03030;
}

.lb-row.rank-rune .lb-name,
.lb-row.rank-rune .lb-val {
    color: #00cece;
}

.lb-row.rank-adamant .lb-name,
.lb-row.rank-adamant .lb-val {
    color: #4caf50;
}

.lb-row.rank-mithril .lb-name,
.lb-row.rank-mithril .lb-val {
    color: #8080e0;
}

.lb-row.rank-steel .lb-name,
.lb-row.rank-steel .lb-val {
    color: #a8b8c8;
}

.lb-row.rank-iron .lb-name,
.lb-row.rank-iron .lb-val {
    color: #909090;
}

.lb-row.rank-bronze .lb-name,
.lb-row.rank-bronze .lb-val {
    color: #cd7f32;
}

.lb-rank-badge.rank-dragon {
    color: #e03030;
}

.lb-rank-badge.rank-rune {
    color: #00cece;
}

.lb-rank-badge.rank-adamant {
    color: #4caf50;
}

.lb-rank-badge.rank-mithril {
    color: #8080e0;
}

.lb-rank-badge.rank-steel {
    color: #a8b8c8;
}

.lb-rank-badge.rank-iron {
    color: #909090;
}

.lb-rank-badge.rank-bronze {
    color: #cd7f32;
}

.expand-divider {
    padding: 6px 0 4px;
}

.expand-divider span {
    font-size: 18px;
    color: rgba(122, 106, 90, 0.45);
    font-style: italic;
    letter-spacing: 1px;
}

.expand-enter-active,
.expand-leave-active {
    transition: opacity 0.25s ease, max-height 0.3s ease;
    max-height: 300px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>