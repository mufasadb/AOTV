import { describe, it, expect, beforeEach } from 'vitest'
import { LootEngine, LootGenerationConfig } from './LootEngine'
import { ItemRarity, EquipmentItem } from '../types/ItemTypes'

describe('LootEngine', () => {
  let lootEngine: LootEngine
  let baseConfig: LootGenerationConfig

  beforeEach(() => {
    lootEngine = new LootEngine()
    baseConfig = {
      enemyTier: 1,
      playerLevel: 10
    }
  })

  describe('Basic Loot Generation', () => {
    it('should generate gold within expected ranges for each tier', () => {
      // Test multiple generations to ensure range compliance
      for (let tier = 1; tier <= 3; tier++) {
        const results = []
        for (let i = 0; i < 50; i++) {
          const config = { ...baseConfig, enemyTier: tier }
          const loot = lootEngine.generateEnemyLoot(config)
          results.push(loot.gold)
        }

        const min = Math.min(...results)
        const max = Math.max(...results)

        // Verify gold ranges by tier
        if (tier === 1) {
          expect(min).toBeGreaterThanOrEqual(2)
          expect(max).toBeLessThanOrEqual(10)
        } else if (tier === 2) {
          expect(min).toBeGreaterThanOrEqual(10)
          expect(max).toBeLessThanOrEqual(30)
        } else if (tier === 3) {
          expect(min).toBeGreaterThanOrEqual(50)
          expect(max).toBeLessThanOrEqual(120)
        }
      }
    })

    it('should have appropriate drop rates per tier', () => {
      const sampleSize = 1000
      
      for (let tier = 1; tier <= 3; tier++) {
        let itemDrops = 0
        
        for (let i = 0; i < sampleSize; i++) {
          const config = { ...baseConfig, enemyTier: tier }
          const loot = lootEngine.generateEnemyLoot(config)
          if (loot.items.length > 0) {
            itemDrops++
          }
        }

        const dropRate = itemDrops / sampleSize
        const expectedDropRate = 0.15 * tier
        
        // Allow some variance in drop rates (±0.05)
        expect(dropRate).toBeGreaterThan(expectedDropRate - 0.05)
        expect(dropRate).toBeLessThan(expectedDropRate + 0.10) // Higher tolerance for upper bound
      }
    })
  })

  describe('Rarity Distribution', () => {
    it('should respect rarity distribution weights for tier 1', () => {
      const sampleSize = 2000
      const tier1Config = { ...baseConfig, enemyTier: 1 }
      const rarityCount: { [key: string]: number } = {
        common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0
      }

      // Generate large sample
      let totalItems = 0
      for (let i = 0; i < sampleSize; i++) {
        const loot = lootEngine.generateEnemyLoot(tier1Config)
        loot.items.forEach(drop => {
          if (drop.item.type === 'equipment') {
            rarityCount[(drop.item as EquipmentItem).rarity]++
            totalItems++
          }
        })
      }

      if (totalItems === 0) return // No items generated, skip test

      // Calculate percentages
      const percentages = Object.keys(rarityCount).reduce((acc, rarity) => {
        acc[rarity] = (rarityCount[rarity] / totalItems) * 100
        return acc
      }, {} as { [key: string]: number })

      // Expected ranges for tier 1 (with tolerance)
      expect(percentages.common).toBeGreaterThan(55) // 60% ±5%
      expect(percentages.common).toBeLessThan(65)
      
      expect(percentages.uncommon).toBeGreaterThan(20) // 25% ±5%
      expect(percentages.uncommon).toBeLessThan(30)
      
      expect(percentages.rare).toBeGreaterThan(7) // 10% ±3%
      expect(percentages.rare).toBeLessThan(13)
      
      expect(percentages.epic).toBeGreaterThan(1) // 4% ±3%
      expect(percentages.epic).toBeLessThan(7)
      
      expect(percentages.legendary).toBeGreaterThanOrEqual(0) // 1% (very rare)
      expect(percentages.legendary).toBeLessThan(4)
    })

    it('should have better rarity distribution for higher tiers', () => {
      const sampleSize = 1000
      const results: { [tier: number]: { [rarity: string]: number } } = {}

      // Test tiers 1 and 3
      for (const tier of [1, 3]) {
        const config = { ...baseConfig, enemyTier: tier }
        const rarityCount: { [key: string]: number } = {
          common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0
        }

        let totalItems = 0
        for (let i = 0; i < sampleSize; i++) {
          const loot = lootEngine.generateEnemyLoot(config)
          loot.items.forEach(drop => {
            if (drop.item.type === 'equipment') {
              rarityCount[(drop.item as EquipmentItem).rarity]++
              totalItems++
            }
          })
        }

        if (totalItems > 0) {
          results[tier] = Object.keys(rarityCount).reduce((acc, rarity) => {
            acc[rarity] = (rarityCount[rarity] / totalItems) * 100
            return acc
          }, {} as { [key: string]: number })
        }
      }

      // Tier 3 should have better rates than tier 1
      if (results[1] && results[3]) {
        expect(results[3].common).toBeLessThan(results[1].common) // Less common items
        expect(results[3].rare + results[3].epic + results[3].legendary)
          .toBeGreaterThan(results[1].rare + results[1].epic + results[1].legendary) // More high-tier items
      }
    })
  })

  describe('Item Generation Quality', () => {
    it('should generate valid equipment items with required properties', () => {
      const config = { ...baseConfig, guaranteedRarity: 'rare' as ItemRarity }
      
      for (let i = 0; i < 50; i++) {
        const loot = lootEngine.generateEnemyLoot(config)
        
        loot.items.forEach(drop => {
          const item = drop.item
          
          // Basic item properties
          expect(item.id).toBeDefined()
          expect(item.definitionId).toBeDefined()
          expect(item.name).toBeDefined()
          expect(item.icon).toBeDefined()
          
          if (item.type === 'equipment') {
            const equipItem = item as EquipmentItem
            
            // Equipment-specific properties
            expect(equipItem.rarity).toBeDefined()
            expect(equipItem.itemLevel).toBeGreaterThan(0)
            expect(equipItem.slotType).toBeDefined()
            expect(equipItem.baseStats).toBeDefined()
            expect(equipItem.stats).toBeDefined()
            
            // Final stats should include base stats
            expect(Object.keys(equipItem.stats).length).toBeGreaterThan(0)
            
            // Power level should be calculated
            expect(drop.powerLevel).toBeGreaterThan(0)
          }
        })
      }
    })

    it('should apply affixes correctly based on rarity', () => {
      const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
      
      rarities.forEach(rarity => {
        const config = { ...baseConfig, guaranteedRarity: rarity, playerLevel: 30 }
        
        // Generate multiple items to test affix application
        for (let i = 0; i < 20; i++) {
          const loot = lootEngine.generateEnemyLoot(config)
          
          loot.items.forEach(drop => {
            if (drop.item.type === 'equipment') {
              const item = drop.item as EquipmentItem
              
              const totalAffixes = item.prefixes.length + item.suffixes.length
              
              // Verify affix counts match rarity expectations
              if (rarity === 'common') {
                expect(totalAffixes).toBe(0)
              } else if (rarity === 'uncommon') {
                expect(totalAffixes).toBeGreaterThanOrEqual(0)
                expect(totalAffixes).toBeLessThanOrEqual(2)
              } else if (rarity === 'rare') {
                expect(totalAffixes).toBeGreaterThanOrEqual(2)
                expect(totalAffixes).toBeLessThanOrEqual(4)
              } else if (rarity === 'epic' || rarity === 'legendary') {
                expect(totalAffixes).toBeGreaterThanOrEqual(4)
                expect(totalAffixes).toBeLessThanOrEqual(6)
              }
              
              // Verify affix properties
              [...item.prefixes, ...item.suffixes].forEach(affix => {
                expect(affix.id).toBeDefined()
                expect(affix.name).toBeDefined()
                expect(affix.tier).toBeGreaterThanOrEqual(1)
                expect(affix.tier).toBeLessThanOrEqual(5)
                expect(Object.keys(affix.stats).length).toBeGreaterThan(0)
              })
            }
          })
        }
      })
    })

    it('should respect player level for affix tier selection', () => {
      const lowLevelConfig = { ...baseConfig, playerLevel: 5, guaranteedRarity: 'rare' as ItemRarity }
      const highLevelConfig = { ...baseConfig, playerLevel: 45, guaranteedRarity: 'rare' as ItemRarity }
      
      const lowLevelTiers: number[] = []
      const highLevelTiers: number[] = []
      
      // Generate items at different player levels
      for (let i = 0; i < 30; i++) {
        const lowLoot = lootEngine.generateEnemyLoot(lowLevelConfig)
        const highLoot = lootEngine.generateEnemyLoot(highLevelConfig)
        
        lowLoot.items.forEach(drop => {
          if (drop.item.type === 'equipment') {
            const item = drop.item as EquipmentItem
            ;[...item.prefixes, ...item.suffixes].forEach(affix => {
              lowLevelTiers.push(affix.tier)
            })
          }
        })
        
        highLoot.items.forEach(drop => {
          if (drop.item.type === 'equipment') {
            const item = drop.item as EquipmentItem
            ;[...item.prefixes, ...item.suffixes].forEach(affix => {
              highLevelTiers.push(affix.tier)
            })
          }
        })
      }
      
      if (lowLevelTiers.length > 0 && highLevelTiers.length > 0) {
        const lowAvgTier = lowLevelTiers.reduce((sum, tier) => sum + tier, 0) / lowLevelTiers.length
        const highAvgTier = highLevelTiers.reduce((sum, tier) => sum + tier, 0) / highLevelTiers.length
        
        // Higher level players should get higher tier affixes on average
        expect(highAvgTier).toBeGreaterThan(lowAvgTier)
      }
    })
  })

  describe('Power Level Calculation', () => {
    it('should calculate reasonable power levels', () => {
      const config = { ...baseConfig, guaranteedRarity: 'rare' as ItemRarity }
      
      const powerLevels: number[] = []
      for (let i = 0; i < 50; i++) {
        const loot = lootEngine.generateEnemyLoot(config)
        loot.items.forEach(drop => {
          powerLevels.push(drop.powerLevel)
        })
      }
      
      if (powerLevels.length > 0) {
        const minPower = Math.min(...powerLevels)
        const maxPower = Math.max(...powerLevels)
        const avgPower = powerLevels.reduce((sum, power) => sum + power, 0) / powerLevels.length
        
        // Power levels should be positive and reasonable
        expect(minPower).toBeGreaterThan(0)
        expect(maxPower).toBeLessThan(10000) // Sanity check
        expect(avgPower).toBeGreaterThan(10) // Should have meaningful power
      }
    })

    it('should have higher power levels for better rarities', () => {
      const rarities: ItemRarity[] = ['common', 'rare', 'legendary']
      const powerByRarity: { [rarity: string]: number[] } = {}
      
      rarities.forEach(rarity => {
        const config = { ...baseConfig, guaranteedRarity: rarity }
        powerByRarity[rarity] = []
        
        for (let i = 0; i < 30; i++) {
          const loot = lootEngine.generateEnemyLoot(config)
          loot.items.forEach(drop => {
            powerByRarity[rarity].push(drop.powerLevel)
          })
        }
      })
      
      // Calculate average power levels
      const avgPowers = Object.keys(powerByRarity).reduce((acc, rarity) => {
        const powers = powerByRarity[rarity]
        if (powers.length > 0) {
          acc[rarity] = powers.reduce((sum, power) => sum + power, 0) / powers.length
        }
        return acc
      }, {} as { [rarity: string]: number })
      
      // Higher rarity should have higher average power
      if (avgPowers.common && avgPowers.rare && avgPowers.legendary) {
        expect(avgPowers.rare).toBeGreaterThan(avgPowers.common)
        expect(avgPowers.legendary).toBeGreaterThan(avgPowers.rare)
      }
    })
  })

  describe('Configuration Options', () => {
    it('should respect guaranteed rarity settings', () => {
      const guaranteedRarity: ItemRarity = 'epic'
      const config = { ...baseConfig, guaranteedRarity }
      
      for (let i = 0; i < 50; i++) {
        const loot = lootEngine.generateEnemyLoot(config)
        loot.items.forEach(drop => {
          if (drop.item.type === 'equipment') {
            expect((drop.item as EquipmentItem).rarity).toBe(guaranteedRarity)
          }
        })
      }
    })

    it('should apply bonus rarity chance correctly', () => {
      const normalConfig = { ...baseConfig, enemyTier: 1 }
      const bonusConfig = { ...baseConfig, enemyTier: 1, bonusRarityChance: 50 }
      
      const normalRarities: string[] = []
      const bonusRarities: string[] = []
      
      // Generate samples
      for (let i = 0; i < 500; i++) {
        const normalLoot = lootEngine.generateEnemyLoot(normalConfig)
        const bonusLoot = lootEngine.generateEnemyLoot(bonusConfig)
        
        normalLoot.items.forEach(drop => {
          if (drop.item.type === 'equipment') {
            normalRarities.push((drop.item as EquipmentItem).rarity)
          }
        })
        
        bonusLoot.items.forEach(drop => {
          if (drop.item.type === 'equipment') {
            bonusRarities.push((drop.item as EquipmentItem).rarity)
          }
        })
      }
      
      if (normalRarities.length > 0 && bonusRarities.length > 0) {
        // Count high-tier items (rare, epic, legendary)
        const normalHighTier = normalRarities.filter(r => ['rare', 'epic', 'legendary'].includes(r)).length
        const bonusHighTier = bonusRarities.filter(r => ['rare', 'epic', 'legendary'].includes(r)).length
        
        const normalHighTierRate = normalHighTier / normalRarities.length
        const bonusHighTierRate = bonusHighTier / bonusRarities.length
        
        // Bonus should increase high-tier rates
        expect(bonusHighTierRate).toBeGreaterThan(normalHighTierRate)
      }
    })
  })
})