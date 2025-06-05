import { describe, it, expect, beforeEach } from 'vitest'
import { playerStore } from './PlayerStore'
import { inventoryStore } from './InventoryStore'

describe('PlayerStore', () => {
  beforeEach(() => {
    // Reset player store to defaults
    playerStore.vitals = {
      hp: 85,
      maxHp: 100,
      mp: 25,
      maxMp: 50,
      es: 15,
      maxEs: 20
    }
    
    // Clear all equipped items
    Object.keys(inventoryStore.equipped).forEach(slot => {
      inventoryStore.equipped[slot] = null
    })
  })

  it('should calculate base stats correctly', () => {
    expect(playerStore.calculateTotalStat('attack')).toBe(10) // Base attack
    expect(playerStore.calculateTotalStat('maxHp')).toBe(100) // Base maxHp
    expect(playerStore.calculateTotalStat('dodge')).toBe(5) // Base dodge
  })

  it('should calculate equipment bonuses correctly', () => {
    // Mock equipping an item with stats
    const testSword = {
      id: 'test_sword',
      name: 'Test Sword',
      icon: 'test.png',
      rarity: 'common' as const,
      type: 'weapon' as const,
      slotType: 'melee' as const,
      stats: {
        attack: 15,
        critChance: 8
      }
    }
    
    inventoryStore.equipped.melee = testSword
    
    expect(playerStore.calculateTotalStat('attack')).toBe(25) // 10 base + 15 weapon
    expect(playerStore.calculateTotalStat('critChance')).toBe(13) // 5 base + 8 weapon
  })

  it('should generate correct combat stats', () => {
    const combatStats = playerStore.combatStats
    
    expect(combatStats.hp).toBe(85)
    expect(combatStats.maxHp).toBe(100)
    expect(combatStats.damage).toBe(10) // Base attack mapped to damage
    expect(combatStats.damageType).toBe('physical')
  })

  it('should handle damage correctly', () => {
    const initialHp = playerStore.vitals.hp
    const damage = playerStore.takeDamage(20, 'physical')
    
    expect(damage).toBe(20)
    expect(playerStore.vitals.hp).toBeLessThan(initialHp)
  })

  it('should handle energy shield absorption', () => {
    playerStore.vitals.es = 10
    playerStore.vitals.hp = 100
    
    playerStore.takeDamage(15, 'physical')
    
    expect(playerStore.vitals.es).toBe(0) // Shield absorbed 10 damage
    expect(playerStore.vitals.hp).toBeLessThan(100) // Remaining 5 damage to HP
  })

  it('should calculate health percentage correctly', () => {
    playerStore.vitals.hp = 75
    expect(playerStore.healthPercentage).toBe(75)
  })

  it('should handle mana spending', () => {
    const success = playerStore.spendMana(10)
    expect(success).toBe(true)
    expect(playerStore.vitals.mp).toBe(15)
    
    const failure = playerStore.spendMana(100)
    expect(failure).toBe(false)
    expect(playerStore.vitals.mp).toBe(15) // Unchanged
  })

  it('should handle gold transactions', () => {
    const initialGold = playerStore.playerInfo.gold
    
    playerStore.addGold(100)
    expect(playerStore.playerInfo.gold).toBe(initialGold + 100)
    
    const success = playerStore.spendGold(50)
    expect(success).toBe(true)
    expect(playerStore.playerInfo.gold).toBe(initialGold + 50)
    
    const failure = playerStore.spendGold(10000)
    expect(failure).toBe(false)
  })
})