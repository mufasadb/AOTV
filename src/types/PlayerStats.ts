/**
 * Centralized Player Stats System
 * 
 * This file defines the complete player stats structure and source tracking
 * system to replace the fragmented stat calculations found in the current system.
 */

import type { DamageType } from './ItemTypes'

// Complete player stats interface
export interface PlayerStats {
  // === VITALS ===
  maxHp: number
  maxMp: number
  maxEs: number
  hpRegen: number
  mpRegen: number
  esRegen: number
  
  // === OFFENSE ===
  attack: number
  spellPower: number
  attackSpeed: number
  castSpeed: number
  critChance: number
  critMultiplier: number
  
  // === ELEMENTAL DAMAGE (for weapons) ===
  fireDamage: number
  lightningDamage: number
  iceDamage: number
  darkDamage: number
  chaosDamage: number
  
  // === DEFENSE ===
  armor: number
  evasion: number
  dodge: number
  block: number
  blockReduction: number
  
  // === RESISTANCES ===
  fireRes: number
  lightningRes: number
  iceRes: number
  darkRes: number
  chaosRes: number
  
  // === UTILITY ===
  movementSpeed: number
  itemRarity: number
  itemQuantity: number
  experienceGain: number
  
  // === LEGACY SUPPORT ===
  speed: number // Maps to movementSpeed for backward compatibility
}

// Current player vitals (separate from max values)
export interface PlayerVitals {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  es: number
  maxEs: number
}

// Source tracking for stat calculations
export interface StatSource {
  sourceId: string
  sourceType: 'base' | 'equipment' | 'buff' | 'passive' | 'temporary'
  sourceName: string // For debugging/display
  stats: Partial<PlayerStats>
  priority: number // Higher priority sources override lower ones
  duration?: number // For temporary sources (in seconds)
  isMultiplicative?: boolean // If true, applied as multiplier rather than addition
}

// Base player information
export interface PlayerInfo {
  name: string
  level: number
  experience: number
  gold: number
  keys: number
  craftingMats: number
}

// Combat-specific stats interface (for combat system)
export interface CombatStats {
  // Current vitals
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  es: number
  maxEs: number
  
  // Combat stats
  armor: number
  fireRes: number
  lightningRes: number
  iceRes: number
  darkRes: number
  chaosRes: number
  dodge: number
  block: number
  critChance: number
  critMultiplier: number
  damage: number // Maps from attack
  damageType: DamageType
}

// Default base stats for a new character
export const DEFAULT_BASE_STATS: PlayerStats = {
  // Vitals
  maxHp: 100,
  maxMp: 50,
  maxEs: 0,
  hpRegen: 1,
  mpRegen: 1,
  esRegen: 0,
  
  // Offense
  attack: 10,
  spellPower: 10,
  attackSpeed: 100, // Base 100% attack speed
  castSpeed: 100,   // Base 100% cast speed
  critChance: 5,    // Base 5% crit chance
  critMultiplier: 1.5, // Base 1.5x crit multiplier
  
  // Elemental damage
  fireDamage: 0,
  lightningDamage: 0,
  iceDamage: 0,
  darkDamage: 0,
  chaosDamage: 0,
  
  // Defense
  armor: 0,
  evasion: 0,
  dodge: 5, // Base 5% dodge
  block: 0,
  blockReduction: 0,
  
  // Resistances
  fireRes: 0,
  lightningRes: 0,
  iceRes: 0,
  darkRes: 0,
  chaosRes: 0,
  
  // Utility
  movementSpeed: 100, // Base 100% movement speed
  itemRarity: 0,
  itemQuantity: 0,
  experienceGain: 100, // Base 100% experience gain
  
  // Legacy
  speed: 10 // Legacy speed stat
}

// Stat calculation mode
export const StatCalculationMode = {
  ADDITIVE: 'additive',       // Simple addition
  MULTIPLICATIVE: 'multiplicative', // Percentage multiplier
  MORE_MULTIPLIER: 'more',    // Multiplicative with other 'more' modifiers
  INCREASED: 'increased',     // Additive with other 'increased' modifiers, then multiplicative
  MAX: 'max',                // Take maximum value
  MIN: 'min',                // Take minimum value
  OVERRIDE: 'override'        // Override all other values
} as const

export type StatCalculationMode = typeof StatCalculationMode[keyof typeof StatCalculationMode]

// Enhanced stat source with calculation mode
export interface EnhancedStatSource extends StatSource {
  calculationMode?: { [statName: string]: StatCalculationMode }
}

// Helper functions for stat calculations
export function createBaseStatSource(playerLevel: number): StatSource {
  const stats = { ...DEFAULT_BASE_STATS }
  
  // Scale base stats with level
  stats.maxHp += (playerLevel - 1) * 5
  stats.maxMp += (playerLevel - 1) * 2
  stats.attack += Math.floor((playerLevel - 1) * 0.5)
  
  return {
    sourceId: 'base',
    sourceType: 'base',
    sourceName: 'Base Character Stats',
    stats,
    priority: 0, // Lowest priority
    isMultiplicative: false
  }
}

export function createEquipmentStatSource(itemId: string, itemName: string, itemStats: Partial<PlayerStats>): StatSource {
  return {
    sourceId: `equipment_${itemId}`,
    sourceType: 'equipment',
    sourceName: itemName,
    stats: itemStats,
    priority: 100, // Medium priority
    isMultiplicative: false
  }
}

export function createBuffStatSource(buffId: string, buffName: string, stats: Partial<PlayerStats>, duration?: number): StatSource {
  return {
    sourceId: `buff_${buffId}`,
    sourceType: 'buff',
    sourceName: buffName,
    stats,
    priority: 200, // Higher priority
    duration,
    isMultiplicative: false
  }
}

// Validation functions
export function isValidStatValue(statName: keyof PlayerStats, value: number): boolean {
  // Resistances are capped at 85% (85)
  if (statName.endsWith('Res') && value > 85) return false
  
  // Percentages (crit chance, dodge, etc.) are capped at 95% (95)
  if (['critChance', 'dodge', 'block'].includes(statName) && value > 95) return false
  
  // Speed modifiers should be reasonable (10% to 1000%)
  if (['attackSpeed', 'castSpeed', 'movementSpeed'].includes(statName)) {
    return value >= 10 && value <= 1000
  }
  
  // No negative vitals or damage
  if (['maxHp', 'maxMp', 'maxEs', 'attack', 'spellPower'].includes(statName) && value < 0) {
    return false
  }
  
  return true
}

export function clampStatValue(statName: keyof PlayerStats, value: number): number {
  // Apply the same caps as validation but return clamped value
  if (statName.endsWith('Res')) return Math.min(85, value)
  if (['critChance', 'dodge', 'block'].includes(statName)) return Math.min(95, value)
  if (['attackSpeed', 'castSpeed', 'movementSpeed'].includes(statName)) {
    return Math.max(10, Math.min(1000, value))
  }
  if (['maxHp', 'maxMp', 'maxEs', 'attack', 'spellPower'].includes(statName)) {
    return Math.max(0, value)
  }
  
  return value
}

// Event types for stats updates
export interface StatsUpdateEvent {
  type: 'stats_changed' | 'source_added' | 'source_removed'
  statsChanged: (keyof PlayerStats)[]
  oldStats: PlayerStats
  newStats: PlayerStats
  timestamp: number
}

export type StatsUpdateHandler = (event: StatsUpdateEvent) => void