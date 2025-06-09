/**
 * Item Utility Functions and Type Guards
 * 
 * This file provides comprehensive utility functions for working with the new
 * item type system, including validation, conversion, and manipulation functions.
 */

import type {
  BaseItem,
  AnyItem,
  EquipmentItem,
  DungeonKeyItem,
  CraftingMaterialItem,
  ConsumableItem,
  ItemStats,
  ItemDefinition,
  ItemRarity,
  EquipmentSlot,
  AffixInstance
} from '../types/ItemTypes'

// =====================================
// TYPE GUARDS
// =====================================

export function isEquipmentItem(item: BaseItem): item is EquipmentItem {
  return (item as EquipmentItem).type === 'equipment'
}

export function isDungeonKeyItem(item: BaseItem): item is DungeonKeyItem {
  return (item as DungeonKeyItem).type === 'key'
}

export function isCraftingMaterialItem(item: BaseItem): item is CraftingMaterialItem {
  return (item as CraftingMaterialItem).type === 'material'
}

export function isConsumableItem(item: BaseItem): item is ConsumableItem {
  return (item as ConsumableItem).type === 'consumable'
}

export function isStackableItem(item: BaseItem): boolean {
  return item.stackSize !== undefined && item.stackSize > 1
}

export function hasStats(item: BaseItem): item is EquipmentItem {
  return isEquipmentItem(item) && item.stats !== undefined
}

export function isEquippableItem(item: BaseItem): item is EquipmentItem {
  return isEquipmentItem(item) && item.slotType !== undefined
}

// =====================================
// ITEM CREATION AND CONVERSION
// =====================================

export function generateUniqueItemId(definitionId: string): string {
  return `${definitionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createBaseItemFromDefinition(definition: ItemDefinition): BaseItem {
  return {
    id: generateUniqueItemId(definition.id),
    definitionId: definition.id,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    stackSize: definition.stackSize,
    currentStack: 1 // Default to 1 item
  }
}

export function createEquipmentItemFromDefinition(definition: ItemDefinition): EquipmentItem {
  if (definition.type !== 'weapon' && definition.type !== 'armor') {
    throw new Error(`Cannot create equipment item from definition of type: ${definition.type}`)
  }

  if (!definition.slotType) {
    throw new Error(`Equipment definition ${definition.id} missing slotType`)
  }

  const baseItem = createBaseItemFromDefinition(definition)
  const baseStats = definition.baseStats || {}

  return {
    ...baseItem,
    type: 'equipment',
    slotType: definition.slotType,
    rarity: definition.rarity,
    itemLevel: definition.itemLevel || 1,
    requirements: definition.requirements,
    baseStats,
    prefixes: [], // No affixes by default
    suffixes: [],
    stats: { ...baseStats }, // Start with base stats
    damageType: definition.damageType
  }
}

export function createDungeonKeyFromDefinition(definition: ItemDefinition): DungeonKeyItem {
  if (definition.type !== 'key') {
    throw new Error(`Cannot create dungeon key from definition of type: ${definition.type}`)
  }

  const baseItem = createBaseItemFromDefinition(definition)

  return {
    ...baseItem,
    type: 'key',
    dungeonId: definition.id, // Use definition ID as dungeon ID
    dungeonLevel: definition.dungeonTier || 1,
    dungeonType: definition.dungeonType
  }
}

export function createCraftingMaterialFromDefinition(definition: ItemDefinition): CraftingMaterialItem {
  if (definition.type !== 'material') {
    throw new Error(`Cannot create crafting material from definition of type: ${definition.type}`)
  }

  if (!definition.materialType) {
    throw new Error(`Material definition ${definition.id} missing materialType`)
  }

  const baseItem = createBaseItemFromDefinition(definition)

  return {
    ...baseItem,
    type: 'material',
    materialType: definition.materialType,
    tier: definition.tier || 1,
    craftingValue: definition.craftingValue || 1,
    tags: definition.tags || [],
    stackSize: definition.stackSize || 100, // Default stack size for materials
    currentStack: 1
  }
}

export function createConsumableFromDefinition(definition: ItemDefinition): ConsumableItem {
  if (definition.type !== 'consumable') {
    throw new Error(`Cannot create consumable from definition of type: ${definition.type}`)
  }

  const baseItem = createBaseItemFromDefinition(definition)

  return {
    ...baseItem,
    type: 'consumable',
    effectType: 'heal', // Default effect type
    effects: definition.effects || {},
    stackSize: definition.stackSize || 10, // Default stack size for consumables
    currentStack: 1
  }
}

// Factory function to create any item type from definition
export function createItemFromDefinition(definition: ItemDefinition): AnyItem {
  switch (definition.type) {
    case 'weapon':
    case 'armor':
      return createEquipmentItemFromDefinition(definition)
    case 'key':
      return createDungeonKeyFromDefinition(definition)
    case 'material':
      return createCraftingMaterialFromDefinition(definition)
    case 'consumable':
      return createConsumableFromDefinition(definition)
    default:
      throw new Error(`Unknown item type: ${(definition as any).type}`)
  }
}

// =====================================
// ITEM MANIPULATION
// =====================================

export function cloneItem(item: AnyItem): AnyItem {
  return JSON.parse(JSON.stringify(item)) as AnyItem
}

export function combineItemStacks(item1: AnyItem, item2: AnyItem): AnyItem | null {
  // Can only combine items of the same definition
  if (item1.definitionId !== item2.definitionId) return null
  
  // Must both be stackable
  if (!isStackableItem(item1) || !isStackableItem(item2)) return null
  
  const maxStack = getMaxStackSize(item1)
  const totalAmount = getCurrentStackSize(item1) + getCurrentStackSize(item2)
  
  if (totalAmount <= maxStack) {
    const combined = cloneItem(item1)
    combined.currentStack = totalAmount
    return combined
  }
  
  return null // Cannot combine - would exceed max stack
}

export function splitItemStack(item: AnyItem, amount: number): [AnyItem, AnyItem] | null {
  if (!isStackableItem(item)) return null
  
  const currentAmount = getCurrentStackSize(item)
  if (amount >= currentAmount || amount <= 0) return null
  
  const original = cloneItem(item)
  const split = cloneItem(item)
  
  original.currentStack = currentAmount - amount
  split.currentStack = amount
  split.id = generateUniqueItemId(item.definitionId) // New ID for split item
  
  return [original, split]
}

// =====================================
// ITEM STATS AND AFFIXES
// =====================================

export function calculateFinalStats(item: EquipmentItem): ItemStats {
  const finalStats = { ...item.baseStats }
  
  // Add prefix stats
  for (const prefix of item.prefixes) {
    addStatsToTotal(finalStats, prefix.stats)
  }
  
  // Add suffix stats
  for (const suffix of item.suffixes) {
    addStatsToTotal(finalStats, suffix.stats)
  }
  
  // Add implicit stats
  if (item.implicit) {
    addStatsToTotal(finalStats, item.implicit.stats)
  }
  
  return finalStats
}

export function addStatsToTotal(target: ItemStats, source: ItemStats): void {
  for (const [statName, value] of Object.entries(source)) {
    if (typeof value === 'number') {
      const currentValue = target[statName as keyof ItemStats] || 0
      target[statName as keyof ItemStats] = currentValue + value
    }
  }
}

export function addAffixToItem(item: EquipmentItem, affix: AffixInstance, affixType: 'prefix' | 'suffix'): boolean {
  const maxAffixes = 3
  
  if (affixType === 'prefix') {
    if (item.prefixes.length >= maxAffixes) return false
    item.prefixes.push(affix)
  } else {
    if (item.suffixes.length >= maxAffixes) return false
    item.suffixes.push(affix)
  }
  
  // Recalculate final stats
  item.stats = calculateFinalStats(item)
  return true
}

export function removeAffixFromItem(item: EquipmentItem, affixId: string): boolean {
  const prefixIndex = item.prefixes.findIndex(affix => affix.id === affixId)
  if (prefixIndex !== -1) {
    item.prefixes.splice(prefixIndex, 1)
    item.stats = calculateFinalStats(item)
    return true
  }
  
  const suffixIndex = item.suffixes.findIndex(affix => affix.id === affixId)
  if (suffixIndex !== -1) {
    item.suffixes.splice(suffixIndex, 1)
    item.stats = calculateFinalStats(item)
    return true
  }
  
  return false
}

// =====================================
// ITEM QUERIES AND VALIDATION
// =====================================

export function getMaxStackSize(item: BaseItem): number {
  return item.stackSize || 1
}

export function getCurrentStackSize(item: BaseItem): number {
  return item.currentStack || 1
}

export function canStackWith(item1: BaseItem, item2: BaseItem): boolean {
  return (
    item1.definitionId === item2.definitionId &&
    isStackableItem(item1) &&
    isStackableItem(item2)
  )
}

export function hasSpaceInStack(item: BaseItem, amount: number = 1): boolean {
  if (!isStackableItem(item)) return amount === 0
  
  const current = getCurrentStackSize(item)
  const max = getMaxStackSize(item)
  return (current + amount) <= max
}

export function getStackSpace(item: BaseItem): number {
  if (!isStackableItem(item)) return 0
  return getMaxStackSize(item) - getCurrentStackSize(item)
}

export function isValidEquipmentSlot(slot: string): slot is EquipmentSlot {
  const validSlots: EquipmentSlot[] = [
    'melee', 'shield', 'head', 'chest', 'boots', 'gloves', 'pants', 'shoulder'
  ]
  return validSlots.includes(slot as EquipmentSlot)
}

export function canEquipToSlot(item: BaseItem, slot: EquipmentSlot): boolean {
  return isEquipmentItem(item) && item.slotType === slot
}

export function meetsRequirements(item: EquipmentItem, playerLevel: number, playerStats?: any): boolean {
  if (!item.requirements) return true
  
  if (item.requirements.level && playerLevel < item.requirements.level) {
    return false
  }
  
  // Add additional requirement checks here (strength, intelligence, etc.)
  // when player attributes are implemented
  
  return true
}

// =====================================
// RARITY AND DISPLAY HELPERS
// =====================================

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return '#ffffff'
    case 'uncommon': return '#1eff00'
    case 'rare': return '#0070dd'
    case 'epic': return '#a335ee'
    case 'legendary': return '#ff8000'
    default: return '#ffffff'
  }
}

export function getRarityWeight(rarity: ItemRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 3
    case 'epic': return 4
    case 'legendary': return 5
    default: return 1
  }
}

export function formatItemName(item: BaseItem): string {
  let name = item.name
  
  if (isEquipmentItem(item)) {
    // Add affix names to equipment
    const prefixNames = item.prefixes.map(p => p.name).join(' ')
    const suffixNames = item.suffixes.map(s => s.name).join(' ')
    
    if (prefixNames) name = `${prefixNames} ${name}`
    if (suffixNames) name = `${name} ${suffixNames}`
  }
  
  if (isStackableItem(item) && getCurrentStackSize(item) > 1) {
    name = `${name} (${getCurrentStackSize(item)})`
  }
  
  return name
}

// =====================================
// LEGACY COMPATIBILITY
// =====================================

// Convert old Item interface to new system (for migration)
export function convertLegacyItem(legacyItem: any): AnyItem {
  // This would be used during migration to convert existing items
  // to the new type system - implementation depends on current item structure
  throw new Error('Legacy item conversion not yet implemented')
}