# Elmwood Warrior — Game Specification

## Overview

**Genre:** 2D Pixel RPG / Turn-Based Battle Game (Pokémon-style)  
**Tone:** Gritty, edgy, street-level  
**Setting:** Elmwood Park  
**Protagonist:** The Elmwood Warrior  
**Objective:** Walk through Elmwood Park, locate and defeat four villains in turn-based combat, culminating in a climactic boss fight against Tweaker T.

---

## Technology Stack (Suggested)

- **Engine:** Phaser 3 (HTML5 2D game framework)
- **Language:** JavaScript
- **Art:** Pixel art sprites and backgrounds (provided during coding phase)
- **Audio:** Chiptune / lo-fi beat soundtrack per level

---

## Game Structure

### Overworld
- Top-down 2D pixel map of Elmwood Park
- Elmwood Warrior is player-controlled and walks around the map
- Each villain occupies a specific zone/location in the park
- Approaching a villain within trigger range initiates a pre-fight taunt cutscene, then transitions to battle screen
- Villains must be defeated in order (Level 1 → 4); later zones are locked until prior villain is defeated
- A **Training Zone** is accessible at all times from the overworld (see Training Mode section)
- After each victory, Elmwood Warrior **fully restores HP and Stamina**

### Level Progression
| Level | Villain | Location in Park |
|-------|---------|-----------------|
| 1 | Alchemist A | Park Entrance / Open Field |
| 2 | Junky J | Back Alley / Park Benches |
| 3 | Dopey D | Basketball Court |
| 4 (Boss) | Tweaker T | Center of the Park / Main Grounds |

---

## Battle System

### Turn-Based Combat (Pokémon-style)
- Player and villain alternate turns
- On the player's turn, a battle menu appears with 4 options:
  - **Fight** — choose an attack move
  - **Item** — use a consumable
  - **Taunt** — use a debuff move
  - **Run** — attempt to flee (only available in Training Mode)

### HP System
- Both Elmwood Warrior and villains have an HP bar
- When HP reaches 0, the battle ends
- Elmwood Warrior fully heals after every villain defeat

### Stamina System
- Elmwood Warrior has a **Stamina Bar (0–100)**
- Each attack costs stamina; more powerful attacks cost more
- Stamina regenerates by **+10 per turn** passively
- If stamina is insufficient for a move, it is **greyed out and unselectable**
- Items do not cost stamina
- Stamina is **fully restored** after each villain is defeated

### Experience & Levelling
- Elmwood Warrior earns XP from battles
- **Defeating a villain awards bonus XP** (significantly more than training)
- Levelling up increases Elmwood Warrior's base stats (HP, ATK, Stamina Max)
- XP thresholds scale per level:
  - Level 1 → 2: 100 XP
  - Level 2 → 3: 250 XP
  - Level 3 → 4: 500 XP
  - Level 4 → 5: 900 XP (and so on)

---

## Elmwood Warrior — Full Stats

**Base Stats:**
- HP: 100
- Stamina: 100
- Attack Modifier: scales with level

### Move Set

| Move | Type | Base Damage | Stamina Cost | Effect |
|------|------|-------------|--------------|--------|
| Park Hands | Physical | 12 | 10 | Basic punch/kick combo |
| Elmwood Elbow | Physical | 20 | 20 | Heavy melee strike |
| Warrior's Wrath | Special/Magic | 30 | 35 | Channelled energy blast |
| Dead Leg | Taunt/Debuff | 0 | 15 | Reduces enemy ATK by 15% for 2 turns |
| Ghetto Potion | Item | Heals 25 HP | 0 | Consumable, limited stock (3 per fight) |
| Finishing Fury | Special (Ultimate) | 50 | 60 | Massive finisher, unlocked after Level 1 defeat |

---

## Training Mode

- Accessible from the overworld at any time via a dedicated **Training Zone** location
- Player fights a dummy/sparring partner (no real enemy)
- Awards **smaller XP** than villain fights
- Each of Elmwood Warrior's moves can be **upgraded** in Training Mode using accumulated training points:
  - Upgrades increase damage, reduce stamina cost, or add secondary effects
  - Each move has up to **3 upgrade tiers**
- Training Mode also serves as a tutorial for new players

### Move Upgrade Tiers (Example — Park Hands)
| Tier | Damage | Stamina Cost | Bonus |
|------|--------|--------------|-------|
| Base | 12 | 10 | — |
| Tier 2 | 16 | 9 | Slight bleed effect |
| Tier 3 | 22 | 8 | Always strikes first |

*(All moves follow a similar upgrade structure)*

---

## Villains

---

### Level 1 — Alchemist A

**Location:** Park Entrance / Open Field  
**Difficulty:** Easy  
**Personality:** Cocky, delusional, thinks he's a mystical genius — but his spells frequently backfire  
**Pre-Fight Taunt:** *"You can't touch me — I've mastered the arcane."*

**Stats:**
- HP: 60
- ATK: 8
- Damage Range: Low

**Move Set:**
| Move | Damage | Effect |
|------|--------|--------|
| Potion Splash | 8 | Weak magic damage |
| Smoke Bomb | 5 | 40% chance to make Warrior's next attack miss |
| Alchemist's Folly | 18 | Moderate magic hit — 25% chance to backfire and damage himself |

**Background Image:** Bright daytime open field, park entrance gate visible

---

### Level 2 — Junky J

**Location:** Back Alley / Park Benches  
**Difficulty:** Medium  
**Personality:** Sneaky, dirty fighter, never plays by the rules  
**Pre-Fight Taunt:** *"I don't fight fair, never did."*

**Stats:**
- HP: 90
- ATK: 14
- Damage Range: Medium

**Move Set:**
| Move | Damage | Effect |
|------|--------|--------|
| Sucker Punch | 15 | Physical, goes first regardless of turn order |
| Lowball | 10 | Hits twice in one turn for 10 each |
| J's Scheme | 5 | Debuffs Warrior's ATK by 20% for 3 turns |

**Background Image:** Dim park bench area, graffiti walls, gritty atmosphere

---

### Level 3 — Dopey D

**Location:** Basketball Court  
**Difficulty:** Hard  
**Personality:** Silent. Intimidating. Says nothing. Hits everything.  
**Pre-Fight Taunt:** *"..."* *(cracks knuckles)*

**Stats:**
- HP: 130
- ATK: 22
- Damage Range: High

**Move Set:**
| Move | Damage | Effect |
|------|--------|--------|
| Dopey Smash | 28 | Heavy physical strike |
| Groundshake | 18 | Stuns Warrior for 1 turn (skips their next move) |
| Iron Will | 0 | Dopey D heals 20 HP |

**Background Image:** Nighttime basketball court, chain-link fence, single overhead light

---

### Level 4 (Boss) — Tweaker T

**Location:** Center of the Park / Main Grounds  
**Difficulty:** Boss — Very Hard  
**Personality:** Completely unhinged, erratic, unpredictable. Transitions into a rage state at half HP.  
**Pre-Fight Taunt:** *"You have NO idea what I'm capable of."*

**Stats:**
- Total HP: 200
- Phase 1 HP: 120 | ATK: 25
- Phase 2 HP: 80 | ATK: 38 (rage mode)

#### Phase 1 Move Set
| Move | Damage | Effect |
|------|--------|--------|
| Tweaker Twitch | 20 | Erratic strike, ±5 random damage variance |
| Random Rage | 25 | High damage, 20% chance to miss entirely |
| Paranoia Strike | 15 | Reduces Warrior's stamina by 20 |

#### Phase 2 Move Set (Triggered at 80 HP remaining)
| Move | Damage | Effect |
|------|--------|--------|
| Full Send | 35 | Massive single hit |
| Tweaker Tornado | 12 x3 | Hits 3 times in one turn |
| Park Takeover | 45 | Ultimate move — used once per fight |

**Phase Transition:** Screen flashes red, Tweaker T dialogue triggers: *"You think that hurt?! I'm just getting started!"*

**Background Image:** Dark park center, dramatic lighting, scattered debris

---

## UI Elements

- **HP Bar** — displayed for both Warrior and villain during battle
- **Stamina Bar** — displayed for Elmwood Warrior only; greyed-out moves when stamina is insufficient
- **XP Bar** — visible on overworld HUD
- **Level Indicator** — shown in top corner
- **Battle Menu** — Fight / Item / Taunt / Run (4-option Pokémon-style menu)
- **Dialogue Box** — appears during pre-fight taunts at bottom of screen
- **Phase Transition Overlay** — red flash screen effect for Tweaker T boss transition

---

## Art & Assets

- **Provided during coding phase:** Background images for each level, villain sprites, Elmwood Warrior sprite
- **Pixel art style** throughout — 16-bit aesthetic recommended
- Each level has a **unique background image** corresponding to its park location
- Sprite animations needed: idle, attack, hurt, faint (for both Warrior and each villain)

---

## Audio (Suggested)

| Context | Style |
|---------|-------|
| Overworld | Chill lo-fi park theme |
| Level 1 Battle | Upbeat chiptune |
| Level 2 Battle | Gritty mid-tempo beat |
| Level 3 Battle | Heavy, slow, menacing |
| Boss Fight | Intense, chaotic, multi-layered |
| Victory | Short triumphant jingle |
| Defeat | Somber short clip |

---

## Game Flow Summary

```
START
  └─ Overworld (Elmwood Park)
       ├─ Training Zone (accessible anytime)
       ├─ Trigger Alchemist A → Pre-fight taunt → Battle → Victory → Full Heal + XP
       ├─ Trigger Junky J → Pre-fight taunt → Battle → Victory → Full Heal + XP
       ├─ Trigger Dopey D → Pre-fight taunt → Battle → Victory → Full Heal + XP
       └─ Trigger Tweaker T → Pre-fight taunt → Boss Battle (2 Phases) → Victory → END SCREEN
```

---

## Future / Optional Features

- Sound effects per move
- Animated sprite attacks
- Save/load game state
- Leaderboard or speedrun timer
- Mobile touch controls
