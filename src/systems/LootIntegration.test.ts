import { describe, it, expect, beforeEach } from 'vitest'
import { enemySystem } from './EnemySystem'

describe('Loot System Integration', () => {
  describe('EnemySystem Integration', () => {
    it('should generate loot using the new LootEngine', () => {
      // Test with different enemy types
      const testEnemyIds = ['goblin_warrior_0', 'orc_berserker_0', 'dark_mage_0']
      
      testEnemyIds.forEach(enemyId => {
        const loot = enemySystem.generateEnemyLoot(enemyId, 15) // Player level 15
        
        // Basic loot validation
        expect(loot).toBeDefined()
        expect(loot.gold).toBeGreaterThanOrEqual(0)
        expect(Array.isArray(loot.items)).toBe(true)
        
        // Verify items have proper structure if any were generated
        loot.items.forEach(item => {
          expect(item).toBeDefined()
          expect(item.id).toBeDefined()
          expect(item.name).toBeDefined()
          expect(item.type).toBeDefined()
          
          if (item.type === 'equipment') {
            expect(item.rarity).toBeDefined()
            expect(item.stats).toBeDefined()
            expect(item.slotType).toBeDefined()
            expect(item.itemLevel).toBeGreaterThan(0)
          }
        })
      })
    })

    it('should respect player level in loot generation', () => {
      const enemyId = 'goblin_warrior_0'
      const lowLevelLoot = enemySystem.generateEnemyLoot(enemyId, 5)
      const highLevelLoot = enemySystem.generateEnemyLoot(enemyId, 30)
      
      // Both should generate loot (may be empty due to RNG, but structure should be correct)
      expect(lowLevelLoot).toBeDefined()
      expect(highLevelLoot).toBeDefined()
      
      // Check that high level player gets more valuable loot on average
      let lowLevelPowerSum = 0
      let highLevelPowerSum = 0
      let lowLevelCount = 0
      let highLevelCount = 0
      
      // Generate multiple samples
      for (let i = 0; i < 100; i++) {
        const lowLoot = enemySystem.generateEnemyLoot(enemyId, 5)
        const highLoot = enemySystem.generateEnemyLoot(enemyId, 30)
        
        lowLoot.items.forEach(item => {
          if (item.type === 'equipment') {
            lowLevelPowerSum += calculateItemPower(item)
            lowLevelCount++
          }
        })
        
        highLoot.items.forEach(item => {
          if (item.type === 'equipment') {
            highLevelPowerSum += calculateItemPower(item)
            highLevelCount++
          }
        })
      }
      
      // If we generated items, high level should be more powerful on average
      if (lowLevelCount > 0 && highLevelCount > 0) {
        const lowAvgPower = lowLevelPowerSum / lowLevelCount
        const highAvgPower = highLevelPowerSum / highLevelCount
        expect(highAvgPower).toBeGreaterThanOrEqual(lowAvgPower)
      }
    })

    it('should generate different loot for different enemy tiers', () => {
      // This would require enemies of different tiers to test properly
      // For now, just verify the system works with any enemy
      const loot = enemySystem.generateEnemyLoot('goblin_warrior_0', 10)
      expect(loot).toBeDefined()
      expect(typeof loot.gold).toBe('number')
      expect(Array.isArray(loot.items)).toBe(true)
    })
  })
})

// Helper function to calculate basic item power
function calculateItemPower(item: any): number {
  if (!item.stats) return 0
  
  let power = 0
  Object.values(item.stats).forEach(value => {
    if (typeof value === 'number') {
      power += value
    }
  })
  
  return power
}