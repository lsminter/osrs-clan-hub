# TEA Clan — Leagues Dashboard

A live tracking dashboard for TEA clan members participating in the **Demonic Pacts** OSRS Leagues event. Displays real-time clan stats, milestone progress, league info, and a hall of fame — all in a hellfire gothic aesthetic.

---

## Features

- **Live Feed** — Real-time SSE event stream of drops, kills, levels, pets, collection log slots, clue scrolls, combat tasks, and kill counts. Two tabs: *Live* (rolling feed) and *Latest Actions* (most recent event per type). Hover loot/clue/collection entries to see item details.
- **Stat Trackers** — Expandable per-player leaderboards for GP, items, levels, pets, deaths, clog slots, combat tasks, clue scrolls, kill count, league tasks, and league points. Expanded rows scroll independently — handles large rosters cleanly. League point rows show rank-tier badge coloring (Bronze → Dragon).
- **Milestones** — Clan-wide progress bars toward configurable goals with live percentage and remaining count. Bright orange-to-gold gradient bars with glow.
- **League Info** — Live panel showing each player's unlocked relics, areas, and combat mastery tiers fetched from `/getLeagueStats`. Filter by region or search by player name with smart cross-constraints. Refresh button re-fetches on demand.
- **Hall of Fame** — Painting-frame grid of clan achievements. Completed entries show a screenshot; click to open a fullscreen lightbox with title and description.
- **Dink Setup Guide** — In-feed modal explaining how to connect the Dink RuneLite plugin. Config URL is click-to-copy.

---

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- A running instance of the TEA backend

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Type-check + production build
npm run build

# Preview the production build locally
npm run preview

# Format source files with Prettier
npm run format
```

---

## Backend Connection

The frontend expects a backend at `http://localhost:3000` by default. Override with:

```bash
# .env.local
VITE_API_BASE_URL=http://your-backend-host:3000
```

Endpoints consumed:

| Endpoint | Type | Description |
|---|---|---|
| `GET /getTeams` | REST | Returns all teams and their player rosters |
| `GET /getPlayerStats` | REST | Returns full player stat snapshots |
| `GET /getStatsStream` | SSE | Streams `history` and `stats` events with live clan data |
| `GET /getActionStream` | SSE | Streams live feed events (drops, kills, levels, etc.) |
| `GET /getLeagueStats` | REST | Returns per-player relics, areas, and combat mastery |

---

## Project Structure

```
src/
├── App.vue                    # Root layout — two side panels over a video background
├── main.js                    # App entry, mounts Vue
├── assets/
│   └── main.css               # Global theme: CSS variables, panel styles, typography
├── components/
│   ├── LiveFeed.vue            # Real-time event feed with Live / Latest Actions tabs
│   ├── StatTrackers.vue        # Expandable scrollable per-player stat leaderboards
│   ├── Milestones.vue          # Clan goal progress bars
│   ├── LeagueInfoPanel.vue     # Live league info: relics, areas, combat mastery
│   ├── HallOfFamePanel.vue     # Painting-frame grid with lightbox
│   └── DinkFAQ.vue             # Dink plugin setup modal (opened from Live Feed header)
├── data/
│   └── hallOfFame.json         # Hall of Fame entries (id, title, description, imageUrl, completed)
├── services/
│   └── apiService.js           # Fetch/SSE wrappers for all backend endpoints
└── stores/
    └── statsStore.js           # Global reactive state: player list, SSE connection
```

---

## Configuration

### Milestone Goals

All targets are defined in a single `GOALS` object at the top of `Milestones.vue`:

```js
const GOALS = {
    gpEarned:      10_000_000_000,
    itemsReceived: 10_000_000,
    levelsEarned:  10_000,
    petsEarned:    10,
    clogsEarned:   10_000,
    combatTasks:   1_000,
    clueScrolls:   10_000,
    killCount:     10_000,
    leagueTasks:   10_000,
    leaguePoints:  500_000,
}
```

Change a value and the label, bar, and remaining count update automatically.

### League Point Rank Tiers

Thresholds and colors are defined in `RANK_TIERS` in `StatTrackers.vue`:

```js
const RANK_TIERS = [
    { min: 60000, name: 'Dragon',  cls: 'rank-dragon'  },
    { min: 45000, name: 'Rune',    cls: 'rank-rune'    },
    { min: 30000, name: 'Adamant', cls: 'rank-adamant' },
    { min: 20000, name: 'Mithril', cls: 'rank-mithril' },
    { min: 10000, name: 'Steel',   cls: 'rank-steel'   },
    { min:  4000, name: 'Iron',    cls: 'rank-iron'    },
    { min:  2000, name: 'Bronze',  cls: 'rank-bronze'  },
]
```

### Hall of Fame Entries

Add or edit entries in `src/data/hallOfFame.json`. Set `completed: true` and provide an `imageUrl` to display a painting — otherwise the frame shows a locked placeholder.

---

## Theme

All colors are CSS variables defined in `src/assets/main.css`:

| Variable      | Hex       | Use                        |
|---------------|-----------|----------------------------|
| `--blood-red` | `#8b0000` | Borders, accents           |
| `--crimson`   | `#c0392b` | Bars, highlights           |
| `--ember`     | `#ff6b35` | Active elements, glow      |
| `--sulfur`    | `#ffd700` | Gold values, complete bars |
| `--soul-gold` | `#ffb347` | Section headings           |
| `--bone`      | `#d4c5a9` | Body text                  |
| `--ash`       | `#8a8070` | Muted / secondary text     |
