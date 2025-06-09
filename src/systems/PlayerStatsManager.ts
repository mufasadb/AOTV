/**
 * PlayerStatsManager - Centralized Player Stats System
 * 
 * This system provides centralized stat calculation and management,
 * replacing the scattered stat calculations with a single source of truth
 * that tracks all stat sources and efficiently calculates totals.
 */

import { makeAutoObservable } from 'mobx'
import type {
  PlayerStats,
  StatSource,
  CombatStats,
  PlayerVitals,
  DEFAULT_BASE_STATS,
  createBaseStatSource
} from '../types/PlayerStats'
import type { DamageType } from '../types/ItemTypes'

export interface StatsUpdateEvent {
  type: 'source_added' | 'source_removed' | 'source_updated' | 'stats_recalculated'
  sourceId?: string
  oldStats?: PlayerStats
  newStats?: PlayerStats
}

export type StatsUpdateHandler = (event: StatsUpdateEvent) => void

/**
 * Central manager for all player stats with source tracking and caching
 */
class PlayerStatsManager {
  private statSources: Map<string, StatSource> = new Map()
  private cachedTotalStats: PlayerStats | null = null
  private updateHandlers: StatsUpdateHandler[] = []
  
  // Current vitals (separate from max values which are calculated)
  private currentVitals: PlayerVitals = {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    es: 0,
    maxEs: 0
  }

  constructor() {
    makeAutoObservable(this)
    this.initializeBaseStats()
  }

  // =====================================
  // STAT SOURCE MANAGEMENT
  // =====================================

  /**
   * Initialize with base character stats
   */
  private initializeBaseStats(): void {
    // This will be called with actual player level when integrated
    const baseSource = this.createBaseStatSource(1)
    this.registerStatSource(baseSource)
  }

  /**
   * Create base stat source for given player level
   */
  private createBaseStatSource(playerLevel: number): StatSource {
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

  /**
   * Register a new stat source
   */
  registerStatSource(source: StatSource): void {
    if (this.statSources.has(source.sourceId)) {
      console.warn(`Stat source ${source.sourceId} already exists, updating instead`)
      this.updateStatSource(source.sourceId, source.stats)
      return
    }

    this.statSources.set(source.sourceId, source)
    this.invalidateCache()

    this.notifyUpdateHandlers({
      type: 'source_added',
      sourceId: source.sourceId
    })
  }

  /**
   * Remove a stat source
   */
  unregisterStatSource(sourceId: string): boolean {
    const removed = this.statSources.delete(sourceId)
    
    if (removed) {
      this.invalidateCache()
      this.notifyUpdateHandlers({
        type: 'source_removed',
        sourceId
      })
    }

    return removed
  }

  /**
   * Update an existing stat source
   */
  updateStatSource(sourceId: string, newStats: Partial<PlayerStats>): boolean {
    const source = this.statSources.get(sourceId)
    if (!source) return false

    const oldStats = { ...source.stats }
    source.stats = { ...source.stats, ...newStats }
    
    this.invalidateCache()
    this.notifyUpdateHandlers({
      type: 'source_updated',
      sourceId,
      oldStats: oldStats as PlayerStats,
      newStats: source.stats as PlayerStats
    })

    return true
  }

  /**
   * Get a specific stat source
   */
  getStatSource(sourceId: string): StatSource | undefined {
    return this.statSources.get(sourceId)
  }

  /**
   * Get all stat sources
   */
  getAllStatSources(): StatSource[] {
    return Array.from(this.statSources.values())
  }

  // =====================================
  // STAT CALCULATION
  // =====================================

  /**
   * Get total calculated stats (cached for performance)
   */
  getTotalStats(): PlayerStats {
    if (!this.cachedTotalStats) {
      this.cachedTotalStats = this.calculateTotalStats()
      this.notifyUpdateHandlers({
        type: 'stats_recalculated',
        newStats: this.cachedTotalStats
      })
    }
    return this.cachedTotalStats
  }

  /**
   * Force recalculation of stats (bypasses cache)
   */
  recalculateStats(): PlayerStats {
    this.invalidateCache()
    return this.getTotalStats()
  }

  /**
   * Calculate a specific stat total
   */
  calculateStat(statName: keyof PlayerStats): number {
    const allStats = this.getTotalStats()
    return allStats[statName] || 0
  }

  /**
   * Internal stat calculation with proper priority and modifier handling
   */
  private calculateTotalStats(): PlayerStats {
    // Start with default stats (all zeros)
    const totalStats: PlayerStats = {
      maxHp: 0, maxMp: 0, maxEs: 0, hpRegen: 0, mpRegen: 0, esRegen: 0,
      attack: 0, spellPower: 0, attackSpeed: 0, castSpeed: 0, critChance: 0, critMultiplier: 0,
      fireDamage: 0, lightningDamage: 0, iceDamage: 0, darkDamage: 0, chaosDamage: 0,
      armor: 0, evasion: 0, dodge: 0, block: 0, blockReduction: 0,
      fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0, chaosRes: 0,
      movementSpeed: 0, itemRarity: 0, itemQuantity: 0, experienceGain: 0,
      speed: 0
    }

    // Sort sources by priority (higher priority = applied later)
    const sortedSources = Array.from(this.statSources.values())
      .sort((a, b) => a.priority - b.priority)

    // Apply additive sources first
    for (const source of sortedSources.filter(s => !s.isMultiplicative)) {
      this.addStatsToTotal(totalStats, source.stats)
    }

    // Apply multiplicative sources second
    for (const source of sortedSources.filter(s => s.isMultiplicative)) {
      this.multiplyStatsToTotal(totalStats, source.stats)
    }

    // Apply stat caps and validation
    this.applyStatCaps(totalStats)

    return totalStats
  }

  /**
   * Add stats from source to total (additive)
   */
  private addStatsToTotal(total: PlayerStats, source: Partial<PlayerStats>): void {
    for (const [statName, value] of Object.entries(source)) {
      if (typeof value === 'number') {
        const currentValue = total[statName as keyof PlayerStats] || 0
        total[statName as keyof PlayerStats] = currentValue + value
      }
    }
  }

  /**
   * Apply multiplicative modifiers to stats
   */
  private multiplyStatsToTotal(total: PlayerStats, source: Partial<PlayerStats>): void {
    for (const [statName, value] of Object.entries(source)) {
      if (typeof value === 'number') {
        const currentValue = total[statName as keyof PlayerStats] || 0
        // Convert percentage to multiplier (e.g., 50 = +50% = 1.5x)
        const multiplier = 1 + (value / 100)
        total[statName as keyof PlayerStats] = currentValue * multiplier
      }
    }
  }

  /**
   * Apply stat caps and validation
   */
  private applyStatCaps(stats: PlayerStats): void {
    // Resistance caps (85%)
    stats.fireRes = Math.min(85, Math.max(-100, stats.fireRes))
    stats.lightningRes = Math.min(85, Math.max(-100, stats.lightningRes))
    stats.iceRes = Math.min(85, Math.max(-100, stats.iceRes))
    stats.darkRes = Math.min(85, Math.max(-100, stats.darkRes))
    stats.chaosRes = Math.min(85, Math.max(-100, stats.chaosRes))

    // Percentage caps (95%)
    stats.critChance = Math.min(95, Math.max(0, stats.critChance))
    stats.dodge = Math.min(95, Math.max(0, stats.dodge))
    stats.block = Math.min(95, Math.max(0, stats.block))

    // Speed caps (10% minimum, 1000% maximum)
    stats.attackSpeed = Math.min(1000, Math.max(10, stats.attackSpeed))
    stats.castSpeed = Math.min(1000, Math.max(10, stats.castSpeed))
    stats.movementSpeed = Math.min(1000, Math.max(10, stats.movementSpeed))

    // Positive value requirements
    stats.maxHp = Math.max(1, stats.maxHp)
    stats.maxMp = Math.max(1, stats.maxMp)
    stats.maxEs = Math.max(0, stats.maxEs)
    stats.attack = Math.max(0, stats.attack)
    stats.spellPower = Math.max(0, stats.spellPower)
  }

  /**
   * Invalidate cached stats (triggers recalculation on next access)
   */
  private invalidateCache(): void {
    this.cachedTotalStats = null
  }

  // =====================================
  // COMBAT INTEGRATION
  // =====================================

  /**
   * Get stats formatted for combat system
   */
  getCombatStats(): CombatStats {
    const totalStats = this.getTotalStats()
    
    return {
      hp: this.currentVitals.hp,
      maxHp: totalStats.maxHp,
      mp: this.currentVitals.mp,
      maxMp: totalStats.maxMp,
      es: this.currentVitals.es,
      maxEs: totalStats.maxEs,
      armor: totalStats.armor,
      fireRes: totalStats.fireRes,
      lightningRes: totalStats.lightningRes,
      iceRes: totalStats.iceRes,
      darkRes: totalStats.darkRes,
      chaosRes: totalStats.chaosRes,
      dodge: totalStats.dodge,
      block: totalStats.block,
      critChance: totalStats.critChance,
      critMultiplier: totalStats.critMultiplier,
      damage: totalStats.attack, // Map attack to damage for combat
      damageType: this.getDominantDamageType(totalStats)
    }
  }

  /**
   * Determine primary damage type based on highest elemental damage
   */
  private getDominantDamageType(stats: PlayerStats): DamageType {
    const elementalDamages = [
      { type: 'fire' as DamageType, value: stats.fireDamage },
      { type: 'lightning' as DamageType, value: stats.lightningDamage },
      { type: 'ice' as DamageType, value: stats.iceDamage },
      { type: 'dark' as DamageType, value: stats.darkDamage },
      { type: 'chaos' as DamageType, value: stats.chaosDamage }
    ]

    const highest = elementalDamages.reduce((max, current) => 
      current.value > max.value ? current : max
    )

    return highest.value > 0 ? highest.type : 'physical'
  }

  // =====================================
  // VITALS MANAGEMENT
  // =====================================

  /**
   * Get current vitals
   */
  getVitals(): PlayerVitals {
    const totalStats = this.getTotalStats()
    return {
      ...this.currentVitals,
      maxHp: totalStats.maxHp,
      maxMp: totalStats.maxMp,
      maxEs: totalStats.maxEs
    }
  }

  /**
   * Update current vitals
   */
  updateVitals(changes: Partial<PlayerVitals>): void {
    Object.assign(this.currentVitals, changes)
    
    // Ensure vitals don't exceed calculated maximums
    const totalStats = this.getTotalStats()
    this.currentVitals.hp = Math.min(this.currentVitals.hp, totalStats.maxHp)
    this.currentVitals.mp = Math.min(this.currentVitals.mp, totalStats.maxMp)
    this.currentVitals.es = Math.min(this.currentVitals.es, totalStats.maxEs)
  }

  /**
   * Restore vitals to maximum
   */
  fullHeal(): void {
    const totalStats = this.getTotalStats()
    this.currentVitals.hp = totalStats.maxHp
    this.currentVitals.mp = totalStats.maxMp
    this.currentVitals.es = totalStats.maxEs
  }

  // =====================================
  // EQUIPMENT INTEGRATION
  // =====================================

  /**
   * Add equipment stats (convenience method)
   */
  addEquipmentStats(itemId: string, itemName: string, stats: Partial<PlayerStats>): void {
    const source: StatSource = {
      sourceId: `equipment_${itemId}`,
      sourceType: 'equipment',
      sourceName: itemName,
      stats,
      priority: 100, // Standard equipment priority
      isMultiplicative: false
    }
    
    this.registerStatSource(source)
  }

  /**
   * Remove equipment stats (convenience method)
   */
  removeEquipmentStats(itemId: string): boolean {
    return this.unregisterStatSource(`equipment_${itemId}`)
  }

  /**
   * Update equipment stats (convenience method)
   */
  updateEquipmentStats(itemId: string, stats: Partial<PlayerStats>): boolean {
    return this.updateStatSource(`equipment_${itemId}`, stats)
  }

  // =====================================
  // EVENT SYSTEM
  // =====================================

  /**
   * Subscribe to stats update events
   */
  addEventListener(handler: StatsUpdateHandler): void {
    this.updateHandlers.push(handler)
  }

  /**
   * Unsubscribe from stats update events
   */
  removeEventListener(handler: StatsUpdateHandler): void {
    const index = this.updateHandlers.indexOf(handler)
    if (index !== -1) {
      this.updateHandlers.splice(index, 1)
    }
  }

  private notifyUpdateHandlers(event: StatsUpdateEvent): void {
    for (const handler of this.updateHandlers) {
      try {
        handler(event)
      } catch (error) {
        console.error('Error in stats update handler:', error)
      }
    }
  }

  // =====================================
  // DEBUGGING AND UTILITIES
  // =====================================

  /**
   * Get detailed breakdown of a specific stat
   */
  getStatBreakdown(statName: keyof PlayerStats): { source: string; value: number }[] {
    const breakdown: { source: string; value: number }[] = []
    
    for (const [sourceId, source] of this.statSources.entries()) {
      const value = source.stats[statName]
      if (value !== undefined && value !== 0) {
        breakdown.push({
          source: source.sourceName || sourceId,
          value
        })
      }
    }
    
    return breakdown
  }

  /**
   * Clear all stat sources except base
   */
  reset(): void {
    const baseSource = this.statSources.get('base')
    this.statSources.clear()
    
    if (baseSource) {
      this.statSources.set('base', baseSource)
    }
    
    this.invalidateCache()
  }
}

// Singleton instance
export const playerStatsManager = new PlayerStatsManager()

// Export class for testing
export { PlayerStatsManager }