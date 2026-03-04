# Game Framework & Architecture Plan
## 2D Pokemon-Style Evolution Battle Game

> **Stack:** Phaser.js 3 + Vanilla JavaScript (ES Modules) + HTML5 + CSS3
> **Deployment:** GitHub Pages (fully static, no server required)
> **Data:** JSON flat files for game data + LocalStorage for save states

---

## 1. Why This Stack

### Phaser.js 3 (Game Engine)

Phaser is the right engine for this project for several reasons:

- **Built-in scene management** — perfect for switching between overworld, battles, menus, and evolution sequences without building your own state machine from scratch
- **Sprite & animation system** — handles spritesheets, frame-based animation, tweens, and particle effects natively, which you'll need heavily for battle animations and evolution sequences
- **Tilemap support** — loads Tiled map editor exports directly, which is how you'll build the overworld
- **Input handling** — keyboard, mouse, touch, and gamepad support out of the box
- **Audio engine** — Web Audio API with fallbacks, handles music loops and SFX layering
- **Physics (Arcade)** — lightweight collision detection for overworld movement (wall collisions, NPC triggers, encounter zones)
- **100% client-side** — runs entirely in the browser, perfect for GitHub Pages
- **Massive community** — extensive examples, tutorials, and plugins available

### Data Strategy: JSON + LocalStorage

Since GitHub Pages is static (no database, no server logic), the architecture splits data into two concerns:

- **Game definitions (read-only):** Monster stats, move databases, evolution rules, map layouts, dialogue — all stored as `.json` files loaded at startup. These are version-controlled in the repo and shared by all players.
- **Player save state (read-write):** Current team, inventory, progress flags, position — stored in the browser's `LocalStorage`. This keeps saves between sessions without needing a server. The save system serializes the full player state to a JSON string.

LocalStorage wins over IndexedDB here because save data is small (a few KB), the API is synchronous and simple, and it avoids the complexity of async database operations for something that doesn't need it.

---

## 2. Libraries & Tools

### Core (loaded via CDN for GitHub Pages compatibility)

| Library | Version | Purpose |
|---------|---------|---------|
| **Phaser** | 3.80+ | Game engine — rendering, scenes, physics, audio, input |

Load via CDN in `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
```

### Development Tools (not deployed, used locally)

| Tool | Purpose |
|------|---------|
| **Tiled Map Editor** | Build overworld and interior maps as `.tmj` (Tiled JSON) files |
| **Aseprite or LibreSprite** | Create/edit pixel art spritesheets |
| **TexturePacker (free tier)** | Combine sprites into optimized atlas sheets |
| **http-server or live-server** | Local development server (`npx http-server .`) |

### Optional Libraries (add only if needed)

| Library | When to Add |
|---------|-------------|
| **Howler.js** | Only if Phaser's audio proves insufficient for complex layering |
| **seedrandom** | If you want deterministic RNG for damage calculations |

### What You Do NOT Need

- No React, Vue, or Angular — Phaser manages its own rendering
- No Webpack or bundler — ES modules with `<script type="module">` work on GitHub Pages
- No Node.js server — everything is client-side
- No database — LocalStorage handles saves

---

## 3. File Structure

```
project-root/
│
├── index.html                    # Entry point — loads Phaser + boots the game
├── style.css                     # Minimal CSS (canvas sizing, loading screen)
├── claude.md                     # Claude Code workflow rules
├── README.md                     # Project overview & setup instructions
├── .gitignore                    # node_modules, .DS_Store, .env, etc.
│
├── src/                          # ← ALL GAME CODE LIVES HERE
│   ├── main.js                   # Phaser.Game config & initialization
│   │
│   ├── scenes/                   # Phaser scenes (each is a game "screen")
│   │   ├── BootScene.js          # Loads minimal assets, shows splash
│   │   ├── PreloadScene.js       # Loads ALL assets with progress bar
│   │   ├── TitleScene.js         # Main menu (New Game, Continue, Options)
│   │   ├── OverworldScene.js     # Map exploration, NPCs, encounter zones
│   │   ├── BattleScene.js        # Turn-based combat UI & logic
│   │   ├── EvolutionScene.js     # Evolution animation sequence
│   │   ├── MenuScene.js          # In-game pause menu (team, inventory, save)
│   │   └── DialogScene.js        # Overlay scene for NPC dialogue boxes
│   │
│   ├── systems/                  # Core game logic (engine-agnostic where possible)
│   │   ├── BattleSystem.js       # Damage calc, turn order, type effectiveness
│   │   ├── EvolutionSystem.js    # Evolution conditions, triggers, transformations
│   │   ├── EncounterSystem.js    # Wild encounter rates, zone-based tables
│   │   ├── MovementSystem.js     # Grid-based or free movement + collisions
│   │   ├── DialogSystem.js       # Typewriter text, branching dialogue
│   │   └── SaveSystem.js         # Serialize/deserialize to LocalStorage
│   │
│   ├── entities/                 # Game object classes
│   │   ├── Monster.js            # Monster instance (stats, moves, XP, evolution state)
│   │   ├── Player.js             # Player state (team, inventory, position, progress)
│   │   ├── NPC.js                # NPC behavior, dialogue triggers
│   │   └── Trainer.js            # Enemy trainer (extends NPC with a monster team)
│   │
│   ├── ui/                       # Reusable UI components
│   │   ├── HealthBar.js          # Animated HP bar for battles
│   │   ├── TextBox.js            # Dialogue box with typewriter effect
│   │   ├── BattleMenu.js         # Action selection menu during combat
│   │   ├── PartyDisplay.js       # Team overview screen
│   │   └── EvolutionAnim.js      # Visual effects for evolution sequence
│   │
│   ├── utils/                    # Shared helpers
│   │   ├── constants.js          # Type enums, stat caps, key bindings
│   │   ├── typeChart.js          # Type effectiveness multiplier table
│   │   ├── mathHelpers.js        # Clamp, random range, general math utilities
│   │   └── assetKeys.js          # Centralized registry of asset string keys
│   │
│   └── config/                   # Game balance & settings
│       ├── gameConfig.js         # Phaser config object (dimensions, physics, etc.)
│       └── balanceConfig.js      # XP curves, stat scaling, tunable values
│
├── assets/                       # ← ALL GAME ASSETS (art, audio, data)
│   ├── sprites/
│   │   ├── monsters/             # Monster spritesheets (idle, attack, hurt, evolve)
│   │   ├── player/               # Player walk cycle (up, down, left, right)
│   │   ├── npcs/                 # NPC character sprites
│   │   ├── effects/              # Battle VFX (elemental effects, hit flash, etc.)
│   │   └── ui/                   # Buttons, menu backgrounds, borders
│   │
│   ├── tilemaps/
│   │   ├── tilesets/             # Tileset images (.png) + Tiled data (.tsj)
│   │   └── maps/                 # Tiled JSON map exports (.tmj)
│   │
│   ├── audio/
│   │   ├── music/                # Background tracks (OGG + MP3 for compatibility)
│   │   └── sfx/                  # Sound effects
│   │
│   └── data/                     # Game definition files (JSON databases)
│       ├── monsters.json         # All monster species: base stats, types, learnsets
│       ├── moves.json            # All moves: power, accuracy, type, effects
│       ├── evolutions.json       # Evolution rules (conditions TBD by design team)
│       ├── encounters.json       # Per-area encounter tables + rates
│       ├── trainers.json         # Trainer teams, AI behavior, dialogue
│       └── items.json            # Item definitions and effects
│
└── docs/                         # Project documentation
    ├── GAME_DESIGN.md            # Game design document (features, story, mechanics)
    ├── ART_GUIDE.md              # Sprite dimensions, palette, naming conventions
    ├── CONTRIBUTING.md           # How to contribute (for team members)
    └── ARCHITECTURE.md           # Technical deep-dive (this document, expanded)
```

---

## 4. Architecture Overview

### Scene Flow

```
BootScene → PreloadScene → TitleScene → OverworldScene ⇄ BattleScene
                                              ↕               ↕
                                          MenuScene     EvolutionScene
                                              ↕
                                        DialogScene (overlay)
```

Scenes are Phaser's way of organizing game states. Each scene has its own `preload()`, `create()`, and `update()` lifecycle. Key points:

- **OverworldScene** is the hub — it stays alive while DialogScene overlays on top
- **BattleScene** launches when an encounter triggers, and returns to OverworldScene on completion
- **EvolutionScene** can trigger at end of battle or from other contexts — it's a standalone animation sequence that receives a monster and returns the transformed result
- **MenuScene** pauses the overworld and overlays the party/inventory/save screen

### Data Flow

```
JSON files (assets/data/)          LocalStorage
       │                                │
       ▼                                ▼
  GameDataManager ◄──────────► SaveSystem
       │                                │
       ▼                                ▼
  Monster definitions            Player state
  Move lookups                   Team composition
  Type calculations              Progress flags
  Encounter tables               Position & map
```

Game data is loaded once during PreloadScene and held in memory. Player state is loaded from LocalStorage on "Continue" or created fresh on "New Game", and serialized back on every save.

---

## 5. Core Systems (High Level)

Each system below lives in its own file under `src/systems/`. The specifics of formulas, conditions, and balance numbers will be defined in the game design phase — what matters now is that each system is **isolated and configurable**.

### BattleSystem.js
Manages the full flow of a turn-based combat encounter. Responsible for turn order, action execution, applying damage and effects, and determining when a battle ends. All balance values (damage formulas, multipliers, stat weights) should be pulled from `balanceConfig.js` so designers can tune without touching the battle logic.

### EvolutionSystem.js
Handles checking whether a monster meets its evolution conditions and executing the transformation. **The conditions themselves are intentionally left open** — the system should be designed to support multiple condition types that the design team defines by reading rules from `evolutions.json`. This file is a lightweight rules engine, not a hard-coded checklist.

### EncounterSystem.js
Determines when and what the player encounters while exploring. Reads zone-based encounter tables from `encounters.json` and rolls against a configurable encounter rate. Should support different encounter contexts (tall grass, caves, water, scripted events).

### MovementSystem.js
Controls player navigation in the overworld. Grid-based movement is recommended for a classic Pokemon feel, but the system should be built so it could be swapped for free movement later. Handles collision against the tilemap, trigger zone detection, and map transitions.

### DialogSystem.js
Renders NPC and event dialogue in a typewriter-style text box. Should support basic branching (yes/no choices) and be able to trigger game events (give items, set progress flags, start battles) at the end of dialogue sequences.

### SaveSystem.js
Serializes the full player state (team, inventory, position, progress flags) to a JSON string in LocalStorage. Loads it back on continue. The save format should include a version number so you can write migration logic if the schema changes during development.

---

## 6. Data File Conventions

All game data lives in `assets/data/` as JSON files. The exact schemas will be defined as game design solidifies, but here are the guiding principles:

- **Each file is a flat dictionary** keyed by a unique string ID (e.g., `"fireling"`, `"ember"`, `"route01"`)
- **IDs are lowercase with underscores** — these are used as lookup keys throughout the codebase
- **No logic in data files** — JSON holds only values. All formulas and conditions are interpreted by the corresponding system in `src/systems/`
- **Keep files focused** — monsters in `monsters.json`, moves in `moves.json`, evolution rules in `evolutions.json`. Don't merge everything into one giant file
- **Document your schemas** — when a data file's structure is finalized, add its schema to `docs/ARCHITECTURE.md` so the whole team knows the format

This approach lets non-coders on the team edit game balance directly by changing numbers in JSON files, without touching any JavaScript.

---

## 7. Development Phases

### Phase 1 — Foundation
- [ ] Project setup: repo, `index.html`, Phaser config, scene skeleton
- [ ] BootScene + PreloadScene with loading bar
- [ ] TitleScene with New Game / Continue buttons
- [ ] SaveSystem: write to / read from LocalStorage
- [ ] Asset pipeline: load one test spritesheet + one test tilemap

### Phase 2 — Overworld
- [ ] OverworldScene with tilemap rendering
- [ ] Player movement (grid-based, 4-directional)
- [ ] Collision detection against wall tiles
- [ ] Camera follow player
- [ ] Map transitions (doors, route connections)
- [ ] NPC placement + dialogue triggers
- [ ] DialogScene overlay with typewriter text

### Phase 3 — Battle Core
- [ ] BattleScene layout (monster sprites, HP bars, text box, action menu)
- [ ] Turn-based action selection
- [ ] Damage calculation with type effectiveness
- [ ] Monster fainting, XP award, level up
- [ ] Wild encounter system (encounter zone triggers)
- [ ] Basic battle animations (attack, hurt, faint)

### Phase 4 — Evolution & Progression
- [ ] EvolutionScene animation sequence
- [ ] Evolution trigger system (reads conditions from data files)
- [ ] Stat and sprite transformation on evolution
- [ ] Move learning on level up
- [ ] Multiple monster team management
- [ ] Trainer battles (scripted teams + basic AI)

### Phase 5 — Polish & Content
- [ ] Full monster roster (sprites, stats, learnsets)
- [ ] Multiple routes and towns with unique encounters
- [ ] Item system (healing, evolution items, key items)
- [ ] Audio (background music + sound effects)
- [ ] Menu polish (party screen, bag, save confirmation)
- [ ] Balancing pass (XP curves, encounter rates, difficulty)
- [ ] Mobile touch controls
- [ ] Bug testing + GitHub Pages deployment

---

## 8. Starter Code

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Monster Evolution Battle</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

### style.css
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden;
}
#game-container {
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16 / 9;
}
canvas { display: block; width: 100% !important; height: auto !important; }
```

### src/main.js
```javascript
import { gameConfig } from './config/gameConfig.js';
const game = new Phaser.Game(gameConfig);
```

### src/config/gameConfig.js
```javascript
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { TitleScene } from '../scenes/TitleScene.js';
import { OverworldScene } from '../scenes/OverworldScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { EvolutionScene } from '../scenes/EvolutionScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { DialogScene } from '../scenes/DialogScene.js';

export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 450,
    pixelArt: true,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [
        BootScene, PreloadScene, TitleScene,
        OverworldScene, BattleScene, EvolutionScene,
        MenuScene, DialogScene
    ]
};
```

---

## 9. Team Workflow Notes

### For Non-Technical Team Members
- **Artists:** Drop sprite PNGs into `assets/sprites/` in the correct subfolder. Use the naming convention in `docs/ART_GUIDE.md`. A developer or Claude Code will wire them into the game.
- **Designers:** Edit JSON files in `assets/data/` to tweak stats, encounters, and dialogue. These are plain text and don't require coding knowledge.
- **Writers:** Dialogue goes in the trainer/NPC JSON files or a dedicated dialogue data file. Keep lines short (fit in a text box roughly 40 characters wide).

### For Claude Code
- Follow all rules in `claude.md` for Git workflow
- When adding a new scene, register it in `gameConfig.js`
- When adding a new monster, update the relevant data JSON files and add sprites
- Test in browser before every push (`npx http-server .` or open `index.html`)
- Keep each system in its own file — don't let any single scene file become a monolith

---

## 10. GitHub Pages Deployment Checklist

- [ ] `main` branch has the latest reviewed code from `develop`
- [ ] `index.html` is in the repository root (not in a subfolder)
- [ ] All asset paths are relative (no absolute `/` paths — use `assets/sprites/...`)
- [ ] Phaser is loaded via CDN (no `node_modules` dependency)
- [ ] No server-side code (no Express, no Node, no PHP)
- [ ] GitHub Pages is configured: Settings → Pages → Source: `main` branch, `/ (root)`
- [ ] Test the deployed URL after every merge to `main`
