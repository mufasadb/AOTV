/**
 * Unit Tests for PlayerStatsManager System
 * 
 * Tests centralized stat calculation, source tracking, and combat integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PlayerStatsManager } from './PlayerStatsManager'
import type { 
  StatSource, 
  PlayerStats, 
  StatsUpdateEvent,
  StatsUpdateHandler
} from '../types/PlayerStats'

describe('PlayerStatsManager', () => {
  let statsManager: PlayerStatsManager
  let eventHandler: StatsUpdateHandler

  beforeEach(() => {
    statsManager = new PlayerStatsManager()
    eventHandler = vi.fn()
  })

  describe('Initialization', () => {
    it('should initialize with base stats', () => {
      const baseSource = statsManager.getStatSource('base')
      
      expect(baseSource).toBeDefined()
      expect(baseSource!.sourceType).toBe('base')
      expect(baseSource!.priority).toBe(0)
      expect(baseSource!.stats.maxHp).toBe(100) // Default base HP
      expect(baseSource!.stats.attack).toBe(10) // Default base attack
    })

    it('should have valid total stats on initialization', () => {
      const totalStats = statsManager.getTotalStats()
      
      expect(totalStats.maxHp).toBe(100)
      expect(totalStats.maxMp).toBe(50)
      expect(totalStats.attack).toBe(10)
      expect(totalStats.critChance).toBe(5)
      expect(totalStats.dodge).toBe(5)
    })
  })

  describe('Stat Source Management', () => {
    let equipmentSource: StatSource

    beforeEach(() => {
      equipmentSource = {
        sourceId: 'sword_001',
        sourceType: 'equipment',
        sourceName: 'Iron Sword',
        stats: { attack: 15, critChance: 10 },
        priority: 100,
        isMultiplicative: false
      }
    })

    it('should register stat source successfully', () => {
      statsManager.registerStatSource(equipmentSource)
      
      const source = statsManager.getStatSource('sword_001')
      expect(source).toBe(equipmentSource)
      expect(statsManager.getAllStatSources()).toContain(equipmentSource)
    })

    it('should update existing source when registering duplicate ID', () => {
      statsManager.registerStatSource(equipmentSource)
      
      const updatedSource = { ...equipmentSource, stats: { attack: 20 } }
      statsManager.registerStatSource(updatedSource)
      
      const totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(30) // 10 base + 20 updated
    })

    it('should unregister stat source successfully', () => {
      statsManager.registerStatSource(equipmentSource)
      const result = statsManager.unregisterStatSource('sword_001')
      
      expect(result).toBe(true)
      expect(statsManager.getStatSource('sword_001')).toBeUndefined()
    })

    it('should return false when unregistering non-existent source', () => {
      const result = statsManager.unregisterStatSource('nonexistent')
      expect(result).toBe(false)
    })

    it('should update stat source successfully', () => {
      statsManager.registerStatSource(equipmentSource)
      const result = statsManager.updateStatSource('sword_001', { attack: 25, speed: 10 })
      
      expect(result).toBe(true)
      const source = statsManager.getStatSource('sword_001')
      expect(source!.stats.attack).toBe(25)
      expect(source!.stats.speed).toBe(10)
    })

    it('should return false when updating non-existent source', () => {
      const result = statsManager.updateStatSource('nonexistent', { attack: 10 })
      expect(result).toBe(false)
    })
  })

  describe('Stat Calculation', () => {
    beforeEach(() => {
      // Clear base stats for predictable testing
      statsManager.reset()
      
      // Add known base stats
      const baseSource: StatSource = {
        sourceId: 'base',
        sourceType: 'base',
        sourceName: 'Base Stats',
        stats: { maxHp: 100, attack: 10, critChance: 5 },
        priority: 0,
        isMultiplicative: false
      }
      statsManager.registerStatSource(baseSource)
    })

    it('should calculate additive stats correctly', () => {
      const weaponSource: StatSource = {
        sourceId: 'weapon',
        sourceType: 'equipment',
        sourceName: 'Iron Sword',
        stats: { attack: 15, critChance: 8 },
        priority: 100,
        isMultiplicative: false
      }
      
      const armorSource: StatSource = {
        sourceId: 'armor',
        sourceType: 'equipment',
        sourceName: 'Leather Armor',
        stats: { maxHp: 25, attack: 2 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(weaponSource)
      statsManager.registerStatSource(armorSource)
      
      const totalStats = statsManager.getTotalStats()
      expect(totalStats.maxHp).toBe(125) // 100 + 25
      expect(totalStats.attack).toBe(27)  // 10 + 15 + 2
      expect(totalStats.critChance).toBe(13) // 5 + 8
    })

    it('should handle multiplicative sources correctly', () => {
      const additiveSource: StatSource = {
        sourceId: 'additive',
        sourceType: 'equipment',
        sourceName: 'Base Equipment',
        stats: { attack: 20 },
        priority: 100,
        isMultiplicative: false
      }
      
      const multiplicativeSource: StatSource = {
        sourceId: 'multiplicative',
        sourceType: 'buff',
        sourceName: 'Attack Buff',
        stats: { attack: 50 }, // +50%
        priority: 200,
        isMultiplicative: true
      }
      
      statsManager.registerStatSource(additiveSource)
      statsManager.registerStatSource(multiplicativeSource)
      
      const totalStats = statsManager.getTotalStats()
      // (10 base + 20 additive) * 1.5 = 45
      expect(totalStats.attack).toBe(45)
    })

    it('should apply priority ordering correctly', () => {
      const lowPrioritySource: StatSource = {
        sourceId: 'low',
        sourceType: 'equipment',
        sourceName: 'Low Priority',
        stats: { attack: 10 },
        priority: 50,
        isMultiplicative: false
      }
      
      const highPrioritySource: StatSource = {
        sourceId: 'high',
        sourceType: 'buff',
        sourceName: 'High Priority',
        stats: { attack: 5 },
        priority: 200,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(lowPrioritySource)
      statsManager.registerStatSource(highPrioritySource)
      
      // Both should contribute to final total
      const totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(25) // 10 base + 10 low + 5 high
    })

    it('should apply stat caps correctly', () => {
      const extremeSource: StatSource = {
        sourceId: 'extreme',
        sourceType: 'equipment',
        sourceName: 'Extreme Stats',
        stats: { 
          fireRes: 150,      // Should cap at 85
          critChance: 120,   // Should cap at 95
          dodge: 200,        // Should cap at 95
          attackSpeed: 5,    // Should cap at 10 (minimum)
          movementSpeed: 2000 // Should cap at 1000
        },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(extremeSource)
      
      const totalStats = statsManager.getTotalStats()
      expect(totalStats.fireRes).toBe(85)
      expect(totalStats.critChance).toBe(95)
      expect(totalStats.dodge).toBe(95)
      expect(totalStats.attackSpeed).toBe(10)
      expect(totalStats.movementSpeed).toBe(1000)
    })

    it('should cache calculated stats for performance', () => {
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(source)
      
      // First call should calculate
      const stats1 = statsManager.getTotalStats()
      // Second call should use cache
      const stats2 = statsManager.getTotalStats()
      
      expect(stats1).toBe(stats2) // Same object reference = cached
    })

    it('should invalidate cache when sources change', () => {
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      const stats1 = statsManager.getTotalStats()
      
      statsManager.registerStatSource(source)
      const stats2 = statsManager.getTotalStats()
      
      expect(stats1).not.toBe(stats2) // Different objects = cache invalidated
      expect(stats2.attack).toBe(20) // 10 base + 10 from source
    })
  })

  describe('Equipment Integration', () => {
    it('should add equipment stats correctly', () => {
      statsManager.addEquipmentStats('sword_001', 'Iron Sword', { 
        attack: 15, 
        critChance: 10 
      })
      
      const totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(25) // 10 base + 15 equipment
      expect(totalStats.critChance).toBe(15) // 5 base + 10 equipment
      
      const source = statsManager.getStatSource('equipment_sword_001')
      expect(source).toBeDefined()
      expect(source!.sourceName).toBe('Iron Sword')
    })

    it('should remove equipment stats correctly', () => {
      statsManager.addEquipmentStats('sword_001', 'Iron Sword', { attack: 15 })
      
      let totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(25) // 10 base + 15 equipment
      
      const result = statsManager.removeEquipmentStats('sword_001')
      expect(result).toBe(true)
      
      totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(10) // Back to base only
    })

    it('should update equipment stats correctly', () => {
      statsManager.addEquipmentStats('sword_001', 'Iron Sword', { attack: 15 })
      
      let totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(25) // 10 base + 15 equipment
      
      const result = statsManager.updateEquipmentStats('sword_001', { attack: 20, speed: 5 })
      expect(result).toBe(true)
      
      totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(30) // 10 base + 20 updated
      expect(totalStats.speed).toBe(5)   // 0 base + 5 updated
    })
  })

  describe('Combat Integration', () => {
    beforeEach(() => {
      // Set up some equipment for realistic combat stats
      statsManager.addEquipmentStats('weapon', 'Iron Sword', {
        attack: 15,
        critChance: 10,
        fireDamage: 5
      })
      
      statsManager.addEquipmentStats('armor', 'Leather Armor', {
        maxHp: 25,
        armor: 10,
        fireRes: 15
      })
    })

    it('should provide combat stats correctly', () => {
      const combatStats = statsManager.getCombatStats()
      
      expect(combatStats.maxHp).toBe(125) // 100 base + 25 armor
      expect(combatStats.maxMp).toBe(50)  // 50 base
      expect(combatStats.damage).toBe(25) // 10 base + 15 weapon (mapped from attack)
      expect(combatStats.armor).toBe(10)  // 0 base + 10 armor
      expect(combatStats.fireRes).toBe(15) // 0 base + 15 armor
      expect(combatStats.critChance).toBe(15) // 5 base + 10 weapon
    })

    it('should determine dominant damage type correctly', () => {
      // No elemental damage = physical
      let combatStats = statsManager.getCombatStats()
      expect(combatStats.damageType).toBe('physical')
      
      // Add fire damage
      statsManager.updateEquipmentStats('weapon', { fireDamage: 20 })
      combatStats = statsManager.getCombatStats()
      expect(combatStats.damageType).toBe('fire')
      
      // Add higher lightning damage
      statsManager.updateEquipmentStats('weapon', { lightningDamage: 25 })
      combatStats = statsManager.getCombatStats()
      expect(combatStats.damageType).toBe('lightning')
    })

    it('should include current vitals in combat stats', () => {
      statsManager.updateVitals({ hp: 80, mp: 30, es: 15 })
      
      const combatStats = statsManager.getCombatStats()
      expect(combatStats.hp).toBe(80)
      expect(combatStats.mp).toBe(30)
      expect(combatStats.es).toBe(15)
    })
  })

  describe('Vitals Management', () => {
    beforeEach(() => {
      // Add some equipment to increase max vitals
      statsManager.addEquipmentStats('armor', 'Heavy Armor', {
        maxHp: 50,
        maxMp: 20,
        maxEs: 25
      })
    })

    it('should get vitals with calculated maximums', () => {
      const vitals = statsManager.getVitals()
      
      expect(vitals.maxHp).toBe(150) // 100 base + 50 equipment
      expect(vitals.maxMp).toBe(70)  // 50 base + 20 equipment
      expect(vitals.maxEs).toBe(25)  // 0 base + 25 equipment
    })

    it('should update vitals within limits', () => {
      statsManager.updateVitals({ hp: 200, mp: 100, es: 50 })
      
      const vitals = statsManager.getVitals()
      expect(vitals.hp).toBe(150) // Capped at maxHp
      expect(vitals.mp).toBe(70)  // Capped at maxMp
      expect(vitals.es).toBe(25)  // Capped at maxEs
    })

    it('should allow partial vital updates', () => {
      statsManager.updateVitals({ hp: 75, mp: 40, es: 10 })
      statsManager.updateVitals({ hp: 100 }) // Only update HP
      
      const vitals = statsManager.getVitals()
      expect(vitals.hp).toBe(100)
      expect(vitals.mp).toBe(40) // Unchanged
      expect(vitals.es).toBe(10) // Unchanged
    })

    it('should restore vitals to maximum on full heal', () => {
      statsManager.updateVitals({ hp: 50, mp: 20, es: 5 })
      statsManager.fullHeal()
      
      const vitals = statsManager.getVitals()
      expect(vitals.hp).toBe(150) // maxHp
      expect(vitals.mp).toBe(70)  // maxMp
      expect(vitals.es).toBe(25)  // maxEs
    })
  })

  describe('Event System', () => {
    it('should emit events for source registration', () => {
      statsManager.addEventListener(eventHandler)
      
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(source)
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'source_added',
        sourceId: 'test'
      })
    })

    it('should emit events for source removal', () => {
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(source)
      statsManager.addEventListener(eventHandler)
      
      statsManager.unregisterStatSource('test')
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'source_removed',
        sourceId: 'test'
      })
    })

    it('should emit events for source updates', () => {
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(source)
      statsManager.addEventListener(eventHandler)
      
      statsManager.updateStatSource('test', { attack: 15 })
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'source_updated',
        sourceId: 'test',
        oldStats: { attack: 10 },
        newStats: expect.objectContaining({ attack: 15 })
      })
    })

    it('should emit events for stat recalculation', () => {
      statsManager.addEventListener(eventHandler)
      
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(source)
      statsManager.getTotalStats() // Trigger calculation
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'stats_recalculated',
        newStats: expect.objectContaining({ attack: 20 }) // 10 base + 10 source
      })
    })

    it('should handle event listener removal', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      statsManager.addEventListener(handler1)
      statsManager.addEventListener(handler2)
      
      const source: StatSource = {
        sourceId: 'test',
        sourceType: 'equipment',
        sourceName: 'Test Item',
        stats: { attack: 10 },
        priority: 100,
        isMultiplicative: false
      }
      
      statsManager.registerStatSource(source)
      
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
      
      statsManager.removeEventListener(handler1)
      statsManager.unregisterStatSource('test')
      
      expect(handler1).toHaveBeenCalledTimes(1) // Not called again
      expect(handler2).toHaveBeenCalledTimes(2) // Called again
    })
  })

  describe('Debugging and Utilities', () => {
    beforeEach(() => {
      statsManager.addEquipmentStats('weapon', 'Iron Sword', { attack: 15 })
      statsManager.addEquipmentStats('armor', 'Leather Armor', { attack: 5 })
      statsManager.registerStatSource({
        sourceId: 'buff',
        sourceType: 'buff',
        sourceName: 'Strength Potion',
        stats: { attack: 10 },
        priority: 200,
        isMultiplicative: false
      })
    })

    it('should provide stat breakdown for debugging', () => {
      const breakdown = statsManager.getStatBreakdown('attack')
      
      expect(breakdown).toHaveLength(4) // base + weapon + armor + buff
      expect(breakdown.find(b => b.source.includes('Base'))).toEqual({
        source: 'Base Character Stats',
        value: 10
      })
      expect(breakdown.find(b => b.source === 'Iron Sword')).toEqual({
        source: 'Iron Sword',
        value: 15
      })
    })

    it('should reset to base stats only', () => {
      let totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(40) // 10 base + 15 weapon + 5 armor + 10 buff
      
      statsManager.reset()
      totalStats = statsManager.getTotalStats()
      expect(totalStats.attack).toBe(10) // Only base stats remain
      
      const allSources = statsManager.getAllStatSources()
      expect(allSources).toHaveLength(1) // Only base source
      expect(allSources[0].sourceId).toBe('base')
    })

    it('should calculate individual stats correctly', () => {
      expect(statsManager.calculateStat('attack')).toBe(40)
      expect(statsManager.calculateStat('maxHp')).toBe(100)
      expect(statsManager.calculateStat('critChance')).toBe(5)
    })

    it('should force recalculation', () => {
      statsManager.addEventListener(eventHandler)
      
      // First calculation
      statsManager.getTotalStats()
      
      // Force recalculation
      const recalculated = statsManager.recalculateStats()
      
      expect(recalculated.attack).toBe(40)
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'stats_recalculated',
        newStats: expect.objectContaining({ attack: 40 })
      })
    })
  })
})