import { describe, it, expect } from 'vitest'
import { lootEngine } from '../systems/LootEngine'
import { enemySystem } from '../systems/EnemySystem'
import type { AnyItem } from '../types/ItemTypes'

describe('Loot System Integration', () => {
  it('should generate valid items with proper icons', () => {
    const config = {
      enemyTier: 2,
      playerLevel: 10,
      guaranteedRarity: 'uncommon' as const
    }
    
    const lootResult = lootEngine.generateEnemyLoot(config)
    
    if (lootResult.items.length > 0) {
      const firstItem = lootResult.items[0].item
      
      // Check basic item structure
      expect(firstItem).toHaveProperty('id')
      expect(firstItem).toHaveProperty('name')
      expect(firstItem).toHaveProperty('icon')
      expect(firstItem).toHaveProperty('type')
      
      // Check icon path is valid
      expect(firstItem.icon).toMatch(/^\/5000FantasyIcons\//)
      expect(firstItem.icon).toMatch(/\.(png|jpg|jpeg|gif)$/i)
      expect(firstItem.icon).not.toMatch(/broken/i)
      
      // Check that equipment items have proper rarity
      if (firstItem.type === 'equipment') {
        expect(firstItem.rarity).toBeTruthy()
        expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(firstItem.rarity)
      }
    }
  })

  it('should generate enemy loot through the EnemySystem', () => {
    const playerLevel = 15
    const enemyId = 'goblin_warrior' // Assuming this exists in enemies.json
    
    const loot = enemySystem.generateEnemyLoot(enemyId, playerLevel)
    
    expect(loot).toHaveProperty('gold')
    expect(loot).toHaveProperty('items')
    expect(typeof loot.gold).toBe('number')
    expect(Array.isArray(loot.items)).toBe(true)
    
    // Check that items have proper structure for display
    loot.items.forEach((item: AnyItem) => {
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('icon')
      expect(item.icon).toMatch(/^\/5000FantasyIcons\//)
      expect(item.icon).not.toMatch(/broken/i)
    })
  })

  it('should work with RewardModal interface', () => {
    // Simulate what CombatStore would do
    const mockFightRewards = {
      gold: 50,
      items: [] as AnyItem[]
    }
    
    // Generate some loot
    const lootResult = lootEngine.generateEnemyLoot({
      enemyTier: 1,
      playerLevel: 5,
      guaranteedRarity: 'common'
    })
    
    // Add items to rewards
    mockFightRewards.items.push(...lootResult.items.map(drop => drop.item))
    
    // Verify the structure works with RewardModal
    expect(mockFightRewards.gold).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(mockFightRewards.items)).toBe(true)
    
    // Check that each item can be displayed
    mockFightRewards.items.forEach(item => {
      expect(typeof item).toBe('object')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('icon')
      
      // Test the properties that RewardModal will use
      const displayItem = {
        name: item.name,
        icon: item.icon,
        rarity: item.type === 'equipment' ? item.rarity : 'common'
      }
      
      expect(displayItem.name).toBeTruthy()
      expect(displayItem.icon).toMatch(/^\/5000FantasyIcons\//)
      expect(displayItem.rarity).toBeTruthy()
    })
  })
})