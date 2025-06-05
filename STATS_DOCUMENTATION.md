# Game Stats Documentation

## Character Stats System

This document outlines all available stats in Project Loot & Craft and their effects on gameplay.

### Core Vitals

| Stat | Description | Notes |
|------|-------------|-------|
| `hp` | Current Health Points | When reaches 0, character dies |
| `maxHp` | Maximum Health Points | Determines health pool size |
| `mp` | Current Mana Points | Used for abilities and spells |
| `maxMp` | Maximum Mana Points | Determines mana pool size |
| `es` | Current Energy Shield | Absorbs damage before health |
| `maxEs` | Maximum Energy Shield | Determines shield capacity |

### Combat Stats

| Stat | Description | Range | Notes |
|------|-------------|-------|-------|
| `attack` | Physical damage dealt | 1+ | Base damage for attacks |
| `armor` | Physical damage reduction | 0-95% | Reduces physical damage taken |
| `dodge` | Chance to avoid all damage | 0-95% | Percentage chance to completely avoid attacks |
| `block` | Chance to block physical attacks | 0-95% | Only works with shields, blocks physical damage |
| `speed` | Attack frequency and movement | 1+ | Higher values = faster actions |

### Critical Hit Stats

| Stat | Description | Range | Notes |
|------|-------------|-------|-------|
| `critChance` | Critical hit chance | 0-95% | Percentage chance for critical hits |
| `critMultiplier` | Critical damage multiplier | 1.0+ | Multiplies damage on critical hits |

### Resistance Stats

| Stat | Description | Range | Notes |
|------|-------------|-------|-------|
| `fireRes` | Fire damage resistance | -100% to 95% | Reduces fire damage taken |
| `lightningRes` | Lightning damage resistance | -100% to 95% | Reduces lightning damage taken |
| `iceRes` | Ice damage resistance | -100% to 95% | Reduces ice damage taken |
| `darkRes` | Dark/chaos damage resistance | -100% to 95% | Reduces dark damage taken |

### Damage Types

| Type | Description | Resisted By | Notes |
|------|-------------|-------------|-------|
| `physical` | Standard melee/ranged damage | `armor`, `block` | Can be blocked by shields |
| `fire` | Elemental fire damage | `fireRes` | Often has burning effects |
| `lightning` | Elemental lightning damage | `lightningRes` | Fast, often chain effects |
| `ice` | Elemental ice damage | `iceRes` | Often slows or freezes |
| `dark` | Chaos/shadow damage | `darkRes` | Often has life drain effects |

## Stat Calculation Rules

### Damage Reduction Order
1. **Dodge Check**: Roll for complete avoidance
2. **Block Check**: Roll to block (physical damage only)
3. **Resistance**: Apply appropriate resistance
4. **Energy Shield**: Absorb remaining damage
5. **Health**: Apply any remaining damage

### Blocking Mechanics
- Only physical damage can be blocked
- Shields provide block chance
- When blocking is active (player action), armor is doubled and damage reduced by 25%
- Some attacks cannot be blocked (`cannotBeBlocked: true`)

### Critical Hit Mechanics
- Roll against `critChance` percentage
- On success, multiply damage by `critMultiplier`
- Critical hits bypass some defensive mechanics

### Energy Shield Mechanics
- Absorbs ALL damage types before health
- Regenerates slowly over time (not implemented yet)
- Some abilities can restore energy shield

## Item Stat Ranges

### Weapons
- **Attack**: 5-50 (varies by weapon type and rarity)
- **Speed**: 1-20 (higher = faster attacks)
- **Critical Chance**: 0-25%
- **Critical Multiplier**: 1.0-3.0x

### Armor
- **Armor**: 1-30 per piece
- **Resistances**: 0-20% per piece
- **Dodge**: 0-15% per piece
- **Speed**: -5 to +15 (heavy armor reduces speed)

### Shields
- **Armor**: 2-15
- **Block**: 10-40%
- **Resistances**: 0-15%

## Rarity Effects on Stats

| Rarity | Stat Multiplier | Special Properties |
|--------|----------------|-------------------|
| Common | 0.8x - 1.0x | Basic stats only |
| Uncommon | 1.0x - 1.2x | May have 1 resistance |
| Rare | 1.2x - 1.5x | Multiple stats, resistances |
| Epic | 1.5x - 2.0x | High stats, special effects |
| Legendary | 2.0x - 3.0x | Maximum stats, unique abilities |

## Level Requirements

Items may have level requirements that must be met to equip them:
- **Level 1-5**: Basic gear
- **Level 6-10**: Intermediate gear  
- **Level 11-15**: Advanced gear
- **Level 16+**: Elite gear

## Special Item Properties

### Damage Type Override
Some weapons deal elemental damage instead of physical:
```json
"damageType": "fire"  // Weapon deals fire damage instead of physical
```

### Special Effects (Future Implementation)
- **Life Steal**: Heal for percentage of damage dealt
- **Mana Steal**: Restore mana from damage dealt
- **Aura Effects**: Passive bonuses while equipped
- **Proc Effects**: Chance-based special attacks
- **Set Bonuses**: Bonuses for wearing multiple pieces

## Balance Guidelines

### Diminishing Returns
- Resistances cap at 95% to prevent immunity
- Dodge caps at 95% to maintain challenge
- Block caps at 95% for shields

### Stat Priorities
1. **Survivability**: Health, Armor, Resistances
2. **Damage**: Attack, Critical Stats
3. **Utility**: Speed, Dodge, Block

### Enemy Scaling
- Tier 1: Stats 10-30 range
- Tier 2: Stats 20-60 range  
- Tier 3: Stats 40-100 range

This ensures progression remains meaningful while maintaining challenge at all levels.