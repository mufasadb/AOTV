/**
 * Unit Tests for Item Type System
 * 
 * Tests the new unified item type hierarchy, type guards, and utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type {
  BaseItem,
  EquipmentItem,
  DungeonKeyItem,
  CraftingMaterialItem,
  ConsumableItem,
  ItemStats,
  AffixInstance
} from './ItemTypes'
import {
  isEquipmentItem,
  isDungeonKeyItem,
  isCraftingMaterialItem,
  isConsumableItem,
  isStackableItem,
  getMaxStackSize,
  getCurrentStackSize
} from './ItemTypes'

describe('Item Type Guards', () => {
  let equipmentItem: EquipmentItem
  let dungeonKey: DungeonKeyItem
  let craftingMaterial: CraftingMaterialItem
  let consumable: ConsumableItem

  beforeEach(() => {
    equipmentItem = {
      id: 'sword_001',
      definitionId: 'iron_sword',
      name: 'Iron Sword',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      type: 'equipment',
      slotType: 'melee',
      rarity: 'common',
      itemLevel: 5,
      baseStats: { attack: 10 },
      prefixes: [],
      suffixes: [],
      stats: { attack: 10 }
    }

    dungeonKey = {
      id: 'key_001',
      definitionId: 'forest_key',
      name: 'Forest Dungeon Key',
      description: 'Opens the forest dungeon',
      icon: '/icons/key.png',
      type: 'key',
      dungeonId: 'forest_dungeon',
      dungeonLevel: 1
    }

    craftingMaterial = {
      id: 'mat_001',
      definitionId: 'iron_ore',
      name: 'Iron Ore',
      description: 'Raw iron ore for crafting',
      icon: '/icons/ore.png',
      type: 'material',
      materialType: 'essence',
      tier: 1,
      craftingValue: 5,
      tags: ['metal', 'basic'],
      stackSize: 100,
      currentStack: 10
    }

    consumable = {
      id: 'pot_001',
      definitionId: 'health_potion',
      name: 'Health Potion',
      description: 'Restores health',
      icon: '/icons/potion.png',
      type: 'consumable',
      effectType: 'heal',
      effects: { healAmount: 50 },
      stackSize: 10,
      currentStack: 3
    }
  })

  describe('isEquipmentItem', () => {
    it('should return true for equipment items', () => {
      expect(isEquipmentItem(equipmentItem)).toBe(true)
    })

    it('should return false for non-equipment items', () => {
      expect(isEquipmentItem(dungeonKey)).toBe(false)
      expect(isEquipmentItem(craftingMaterial)).toBe(false)
      expect(isEquipmentItem(consumable)).toBe(false)
    })
  })

  describe('isDungeonKeyItem', () => {
    it('should return true for dungeon key items', () => {
      expect(isDungeonKeyItem(dungeonKey)).toBe(true)
    })

    it('should return false for non-key items', () => {
      expect(isDungeonKeyItem(equipmentItem)).toBe(false)
      expect(isDungeonKeyItem(craftingMaterial)).toBe(false)
      expect(isDungeonKeyItem(consumable)).toBe(false)
    })
  })

  describe('isCraftingMaterialItem', () => {
    it('should return true for crafting material items', () => {
      expect(isCraftingMaterialItem(craftingMaterial)).toBe(true)
    })

    it('should return false for non-material items', () => {
      expect(isCraftingMaterialItem(equipmentItem)).toBe(false)
      expect(isCraftingMaterialItem(dungeonKey)).toBe(false)
      expect(isCraftingMaterialItem(consumable)).toBe(false)
    })
  })

  describe('isConsumableItem', () => {
    it('should return true for consumable items', () => {
      expect(isConsumableItem(consumable)).toBe(true)
    })

    it('should return false for non-consumable items', () => {
      expect(isConsumableItem(equipmentItem)).toBe(false)
      expect(isConsumableItem(dungeonKey)).toBe(false)
      expect(isConsumableItem(craftingMaterial)).toBe(false)
    })
  })

  describe('isStackableItem', () => {
    it('should return true for items with stackSize > 1', () => {
      expect(isStackableItem(craftingMaterial)).toBe(true)
      expect(isStackableItem(consumable)).toBe(true)
    })

    it('should return false for items without stackSize or stackSize = 1', () => {
      expect(isStackableItem(equipmentItem)).toBe(false)
      expect(isStackableItem(dungeonKey)).toBe(false)
    })

    it('should return false for items with stackSize = 1', () => {
      const nonStackable = { ...craftingMaterial, stackSize: 1 }
      expect(isStackableItem(nonStackable)).toBe(false)
    })
  })
})

describe('Stack Utility Functions', () => {
  let stackableItem: CraftingMaterialItem
  let nonStackableItem: EquipmentItem

  beforeEach(() => {
    stackableItem = {
      id: 'mat_001',
      definitionId: 'iron_ore',
      name: 'Iron Ore',
      description: 'Raw iron ore for crafting',
      icon: '/icons/ore.png',
      type: 'material',
      materialType: 'essence',
      tier: 1,
      craftingValue: 5,
      tags: ['metal'],
      stackSize: 100,
      currentStack: 25
    }

    nonStackableItem = {
      id: 'sword_001',
      definitionId: 'iron_sword',
      name: 'Iron Sword',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      type: 'equipment',
      slotType: 'melee',
      rarity: 'common',
      itemLevel: 5,
      baseStats: { attack: 10 },
      prefixes: [],
      suffixes: [],
      stats: { attack: 10 }
    }
  })

  describe('getMaxStackSize', () => {
    it('should return stackSize for stackable items', () => {
      expect(getMaxStackSize(stackableItem)).toBe(100)
    })

    it('should return 1 for non-stackable items', () => {
      expect(getMaxStackSize(nonStackableItem)).toBe(1)
    })

    it('should return 1 for items without stackSize', () => {
      const item = { ...stackableItem }
      delete item.stackSize
      expect(getMaxStackSize(item)).toBe(1)
    })
  })

  describe('getCurrentStackSize', () => {
    it('should return currentStack for items with currentStack', () => {
      expect(getCurrentStackSize(stackableItem)).toBe(25)
    })

    it('should return 1 for items without currentStack', () => {
      expect(getCurrentStackSize(nonStackableItem)).toBe(1)
    })

    it('should return 1 for items with undefined currentStack', () => {
      const item = { ...stackableItem }
      delete item.currentStack
      expect(getCurrentStackSize(item)).toBe(1)
    })
  })
})

describe('Equipment Item Properties', () => {
  let basicEquipment: EquipmentItem
  let enhancedEquipment: EquipmentItem

  beforeEach(() => {
    basicEquipment = {
      id: 'sword_001',
      definitionId: 'iron_sword',
      name: 'Iron Sword',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      type: 'equipment',
      slotType: 'melee',
      rarity: 'common',
      itemLevel: 5,
      baseStats: { attack: 10, speed: 5 },
      prefixes: [],
      suffixes: [],
      stats: { attack: 10, speed: 5 }
    }

    const prefix: AffixInstance = {
      id: 'sharp_prefix',
      name: 'Sharp',
      description: 'Increases attack',
      stats: { attack: 5 },
      tier: 1,
      weight: 100
    }

    const suffix: AffixInstance = {
      id: 'speed_suffix',
      name: 'of Swiftness',
      description: 'Increases speed',
      stats: { speed: 3 },
      tier: 1,
      weight: 100
    }

    enhancedEquipment = {
      ...basicEquipment,
      id: 'sword_002',
      name: 'Sharp Iron Sword of Swiftness',
      prefixes: [prefix],
      suffixes: [suffix],
      stats: { attack: 15, speed: 8 } // base + affixes
    }
  })

  it('should have required equipment properties', () => {
    expect(basicEquipment.type).toBe('equipment')
    expect(basicEquipment.slotType).toBe('melee')
    expect(basicEquipment.rarity).toBe('common')
    expect(basicEquipment.itemLevel).toBe(5)
    expect(basicEquipment.baseStats).toEqual({ attack: 10, speed: 5 })
    expect(basicEquipment.stats).toEqual({ attack: 10, speed: 5 })
  })

  it('should support prefixes and suffixes', () => {
    expect(enhancedEquipment.prefixes).toHaveLength(1)
    expect(enhancedEquipment.suffixes).toHaveLength(1)
    expect(enhancedEquipment.prefixes[0].name).toBe('Sharp')
    expect(enhancedEquipment.suffixes[0].name).toBe('of Swiftness')
  })

  it('should have calculated final stats', () => {
    expect(enhancedEquipment.stats.attack).toBe(15) // 10 base + 5 from prefix
    expect(enhancedEquipment.stats.speed).toBe(8)   // 5 base + 3 from suffix
  })
})

describe('Dungeon Key Properties', () => {
  let basicKey: DungeonKeyItem
  let enhancedKey: DungeonKeyItem

  beforeEach(() => {
    basicKey = {
      id: 'key_001',
      definitionId: 'forest_key',
      name: 'Forest Dungeon Key',
      description: 'Opens the forest dungeon',
      icon: '/icons/key.png',
      type: 'key',
      dungeonId: 'forest_dungeon',
      dungeonLevel: 1
    }

    enhancedKey = {
      ...basicKey,
      id: 'key_002',
      dungeonType: 'boss',
      usesRemaining: 5,
      modifiers: [{
        id: 'increased_loot',
        name: 'Increased Loot',
        description: 'More items drop',
        effect: 'loot_multiplier',
        value: 1.5
      }]
    }
  })

  it('should have required dungeon key properties', () => {
    expect(basicKey.type).toBe('key')
    expect(basicKey.dungeonId).toBe('forest_dungeon')
    expect(basicKey.dungeonLevel).toBe(1)
  })

  it('should support optional properties', () => {
    expect(enhancedKey.dungeonType).toBe('boss')
    expect(enhancedKey.usesRemaining).toBe(5)
    expect(enhancedKey.modifiers).toHaveLength(1)
    expect(enhancedKey.modifiers![0].name).toBe('Increased Loot')
  })
})

describe('Crafting Material Properties', () => {
  let material: CraftingMaterialItem

  beforeEach(() => {
    material = {
      id: 'mat_001',
      definitionId: 'iron_ore',
      name: 'Iron Ore',
      description: 'Raw iron ore for crafting',
      icon: '/icons/ore.png',
      type: 'material',
      materialType: 'essence',
      tier: 3,
      craftingValue: 15,
      tags: ['metal', 'basic', 'tier3'],
      stackSize: 100,
      currentStack: 50
    }
  })

  it('should have required crafting material properties', () => {
    expect(material.type).toBe('material')
    expect(material.materialType).toBe('essence')
    expect(material.tier).toBe(3)
    expect(material.craftingValue).toBe(15)
    expect(material.tags).toEqual(['metal', 'basic', 'tier3'])
  })

  it('should be stackable by default', () => {
    expect(material.stackSize).toBe(100)
    expect(material.currentStack).toBe(50)
    expect(isStackableItem(material)).toBe(true)
  })
})

describe('Consumable Properties', () => {
  let healingPotion: ConsumableItem
  let buffPotion: ConsumableItem

  beforeEach(() => {
    healingPotion = {
      id: 'pot_001',
      definitionId: 'health_potion',
      name: 'Health Potion',
      description: 'Restores health',
      icon: '/icons/potion.png',
      type: 'consumable',
      effectType: 'heal',
      effects: { healAmount: 50 },
      stackSize: 10,
      currentStack: 3
    }

    buffPotion = {
      id: 'pot_002',
      definitionId: 'strength_potion',
      name: 'Strength Potion',
      description: 'Temporarily increases attack',
      icon: '/icons/buff_potion.png',
      type: 'consumable',
      effectType: 'buff',
      effects: { statBonus: { attack: 10 } },
      duration: 300, // 5 minutes
      stackSize: 5,
      currentStack: 1
    }
  })

  it('should have required consumable properties', () => {
    expect(healingPotion.type).toBe('consumable')
    expect(healingPotion.effectType).toBe('heal')
    expect(healingPotion.effects).toEqual({ healAmount: 50 })
  })

  it('should support temporary effects with duration', () => {
    expect(buffPotion.effectType).toBe('buff')
    expect(buffPotion.duration).toBe(300)
    expect(buffPotion.effects).toEqual({ statBonus: { attack: 10 } })
  })

  it('should be stackable by default', () => {
    expect(healingPotion.stackSize).toBe(10)
    expect(healingPotion.currentStack).toBe(3)
    expect(isStackableItem(healingPotion)).toBe(true)
  })
})

describe('Base Item Properties', () => {
  it('should enforce required base properties', () => {
    const baseItem: BaseItem = {
      id: 'item_001',
      definitionId: 'test_item',
      name: 'Test Item',
      description: 'A test item',
      icon: '/icons/test.png'
    }

    expect(baseItem.id).toBe('item_001')
    expect(baseItem.definitionId).toBe('test_item')
    expect(baseItem.name).toBe('Test Item')
    expect(baseItem.description).toBe('A test item')
    expect(baseItem.icon).toBe('/icons/test.png')
  })

  it('should support optional stacking properties', () => {
    const stackableBase: BaseItem = {
      id: 'item_002',
      definitionId: 'stackable_test',
      name: 'Stackable Test Item',
      description: 'A stackable test item',
      icon: '/icons/test.png',
      stackSize: 50,
      currentStack: 20
    }

    expect(stackableBase.stackSize).toBe(50)
    expect(stackableBase.currentStack).toBe(20)
    expect(isStackableItem(stackableBase)).toBe(true)
  })
})