import { combatStore } from '../stores/CombatStore'
import { playerStore } from '../stores/PlayerStore'
import { inventoryStore } from '../stores/InventoryStore'

describe('Damage Debug Test', () => {
  beforeEach(() => {
    inventoryStore.initializeTestItems()
    playerStore.vitals.hp = playerStore.vitals.maxHp
  })

  test('debug damage calculation', () => {
    console.log('=== DAMAGE CALCULATION DEBUG ===')
    
    // Get player combat stats
    const playerStats = playerStore.combatStats
    console.log('Player combat stats:', JSON.stringify(playerStats, null, 2))
    
    // Create a test enemy
    const testEnemy = {
      id: 'test_enemy',
      name: 'Test Enemy',
      stats: {
        hp: 50,
        maxHp: 50,
        mp: 10,
        maxMp: 10,
        es: 0,
        maxEs: 0,
        armor: 0,  // No armor for testing
        fireRes: 0,
        lightningRes: 0,
        iceRes: 0,
        darkRes: 0,
        dodge: 0,  // No dodge for testing
        block: 0,  // No block for testing
        critChance: 5,
        critMultiplier: 1.5,
        damage: 15,
        damageType: 'physical' as const
      },
      intent: 'attack',
      isBlocking: false
    }
    
    console.log('Test enemy stats:', JSON.stringify(testEnemy.stats, null, 2))
    
    // Create player entity for combat
    const playerEntity = {
      id: 'player',
      name: 'Player',
      stats: playerStats,
      intent: undefined,
      isBlocking: false
    }
    
    console.log('Player entity stats:', JSON.stringify(playerEntity.stats, null, 2))
    
    // Test damage calculation
    const damageResult = combatStore.calculateDamage(playerEntity, testEnemy)
    console.log('Damage calculation result:', JSON.stringify(damageResult, null, 2))
    
    // Check if damage is being calculated
    expect(damageResult.damage).toBeGreaterThan(0)
    
    // If dodge/block happened, actualDamage will be 0
    if (damageResult.wasDodged) {
      console.log('❌ Attack was DODGED')
    } else if (damageResult.wasBlocked) {
      console.log('❌ Attack was BLOCKED')
    } else {
      console.log(`✅ Attack HIT for ${damageResult.actualDamage} damage`)
      expect(damageResult.actualDamage).toBeGreaterThan(0)
    }
    
    // Test multiple calculations to see if we ever hit
    let hits = 0
    let dodges = 0
    let blocks = 0
    
    for (let i = 0; i < 100; i++) {
      const result = combatStore.calculateDamage(playerEntity, testEnemy)
      if (result.wasDodged) {
        dodges++
      } else if (result.wasBlocked) {
        blocks++
      } else {
        hits++
      }
    }
    
    console.log(`=== 100 ATTACK SIMULATION ===`)
    console.log(`Hits: ${hits}`)
    console.log(`Dodges: ${dodges}`)
    console.log(`Blocks: ${blocks}`)
    console.log(`Hit rate: ${hits}%`)
    
    // Should have some hits out of 100 attacks
    expect(hits).toBeGreaterThan(0)
  })
  
  test('debug player attack stat calculation', () => {
    console.log('=== PLAYER ATTACK STAT DEBUG ===')
    
    console.log('Base attack stat:', playerStore.baseStats.attack)
    console.log('Calculated total attack:', playerStore.calculateTotalStat('attack'))
    
    // Check equipped weapon
    const weapon = inventoryStore.equipped.melee
    if (weapon) {
      console.log('Equipped weapon:', weapon.name)
      console.log('Weapon stats:', JSON.stringify(weapon.stats, null, 2))
    } else {
      console.log('No weapon equipped - using base attack')
    }
    
    // Check all equipped items for attack bonuses
    Object.entries(inventoryStore.equipped).forEach(([slot, item]) => {
      if (item && item.stats) {
        const attackBonus = item.stats.attack || 0
        if (attackBonus > 0) {
          console.log(`${slot}: ${item.name} provides +${attackBonus} attack`)
        }
      }
    })
    
    const finalAttack = playerStore.calculateTotalStat('attack')
    console.log(`Final calculated attack: ${finalAttack}`)
    
    expect(finalAttack).toBeGreaterThan(0)
  })
})