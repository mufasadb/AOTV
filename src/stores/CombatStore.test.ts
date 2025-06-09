import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CombatStore } from './CombatStore'
import type { CombatStats } from './CombatStore'

// Helper to create mock enemies
const createMockEnemies = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `test_enemy_${i + 1}`,
    name: `Test Enemy ${i + 1}`,
    stats: {
      hp: 50, maxHp: 50, mp: 0, maxMp: 0, es: 0, maxEs: 0,
      armor: 5, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 10, block: 0, critChance: 5, critMultiplier: 1.5,
      damage: 15, damageType: 'physical' as const
    },
    isBlocking: false,
    intent: 'attack',
    abilities: []
  }))
}

// Mock the enemy system to return the expected number of enemies
vi.mock('../systems/EnemySystem', () => ({
  enemySystem: {
    generateEnemyEncounter: vi.fn((options: { enemyCount?: number }) => {
      const count = options?.enemyCount || 1
      return createMockEnemies(count)
    })
  }
}))

describe('CombatStore Enemy Count Scaling', () => {
  let combatStore: CombatStore
  let mockPlayerStats: CombatStats

  beforeEach(() => {
    combatStore = new CombatStore()
    mockPlayerStats = {
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 15, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 25, damageType: 'physical'
    }
  })

  it('should generate appropriate enemy counts for tier 1', () => {
    // Test multiple times to verify probability distribution
    const enemyCounts: number[] = []
    
    for (let i = 0; i < 100; i++) {
      combatStore.generateFightForTier(1)
      enemyCounts.push(combatStore.enemies.length)
    }
    
    // For tier 1, we should mostly see 1 enemy (85%) with some 2 enemies (15%)
    const countOf1 = enemyCounts.filter(count => count === 1).length
    const countOf2 = enemyCounts.filter(count => count === 2).length
    const countOf3Plus = enemyCounts.filter(count => count >= 3).length
    
    // Should have more 1s than 2s, and no 3+
    expect(countOf1).toBeGreaterThan(countOf2)
    expect(countOf3Plus).toBe(0)
    
    // Rough probability check (with some tolerance for randomness)
    expect(countOf1).toBeGreaterThan(70) // Should be around 85
    expect(countOf2).toBeLessThan(30) // Should be around 15
  })

  it('should generate appropriate enemy counts for tier 2', () => {
    const enemyCounts: number[] = []
    
    for (let i = 0; i < 100; i++) {
      combatStore.generateFightForTier(2)
      enemyCounts.push(combatStore.enemies.length)
    }
    
    const countOf1 = enemyCounts.filter(count => count === 1).length
    const countOf2 = enemyCounts.filter(count => count === 2).length
    const countOf3 = enemyCounts.filter(count => count === 3).length
    const countOf4Plus = enemyCounts.filter(count => count >= 4).length
    
    // For tier 2: 40% 1 enemy, 50% 2 enemies, 10% 3 enemies
    expect(countOf2).toBeGreaterThan(countOf1) // 2 should be most common
    expect(countOf2).toBeGreaterThan(countOf3) // 2 should be more than 3
    expect(countOf4Plus).toBe(0) // No 4+ enemies
    
    // Rough probability checks
    expect(countOf1).toBeGreaterThan(25) // Should be around 40
    expect(countOf1).toBeLessThan(55)
    expect(countOf2).toBeGreaterThan(35) // Should be around 50
    expect(countOf2).toBeLessThan(65)
    expect(countOf3).toBeLessThan(20) // Should be around 10
  })

  it('should generate appropriate enemy counts for tier 3', () => {
    const enemyCounts: number[] = []
    
    for (let i = 0; i < 100; i++) {
      combatStore.generateFightForTier(3)
      enemyCounts.push(combatStore.enemies.length)
    }
    
    const countOf1 = enemyCounts.filter(count => count === 1).length
    const countOf2 = enemyCounts.filter(count => count === 2).length
    const countOf3 = enemyCounts.filter(count => count === 3).length
    const countOf4 = enemyCounts.filter(count => count === 4).length
    const countOf5Plus = enemyCounts.filter(count => count >= 5).length
    
    // For tier 3: 20% 2 enemies, 60% 3 enemies, 20% 4 enemies
    expect(countOf1).toBe(0) // No 1 enemy fights
    expect(countOf3).toBeGreaterThan(countOf2) // 3 should be most common
    expect(countOf3).toBeGreaterThan(countOf4) // 3 should be more than 4
    expect(countOf5Plus).toBe(0) // No 5+ enemies
    
    // Rough probability checks
    expect(countOf2).toBeGreaterThan(10) // Should be around 20
    expect(countOf2).toBeLessThan(35)
    expect(countOf3).toBeGreaterThan(45) // Should be around 60
    expect(countOf3).toBeLessThan(75)
    expect(countOf4).toBeGreaterThan(10) // Should be around 20
    expect(countOf4).toBeLessThan(35)
  })

  it('should initialize dungeon with tier 1 by default', () => {
    combatStore.initializeDungeon(mockPlayerStats)
    
    expect(combatStore.isInCombat).toBe(true)
    expect(combatStore.currentFight).toBe(1)
    expect(combatStore.totalFights).toBe(5)
    expect(combatStore.player).toBeDefined()
    expect(combatStore.enemies.length).toBeGreaterThan(0)
    expect(combatStore.enemies.length).toBeLessThanOrEqual(2) // Tier 1 max
  })

  it('should initialize dungeon with specified tier', () => {
    combatStore.initializeDungeon(mockPlayerStats, 3)
    
    expect(combatStore.isInCombat).toBe(true)
    expect(combatStore.enemies.length).toBeGreaterThanOrEqual(2) // Tier 3 min
    expect(combatStore.enemies.length).toBeLessThanOrEqual(4) // Tier 3 max
  })

  it('should handle invalid tier gracefully', () => {
    combatStore.generateFightForTier(99)
    
    // Should default to 1 enemy for invalid tiers
    expect(combatStore.enemies.length).toBe(1)
  })
})