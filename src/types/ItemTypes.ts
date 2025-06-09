/**
 * Unified Item Type System
 * 
 * This file defines the complete item type hierarchy with proper inheritance,
 * addressing the type fragmentation found in the current system.
 */

// Base types and enums
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type DamageType = 'physical' | 'fire' | 'lightning' | 'ice' | 'dark' | 'chaos'
export type EquipmentSlot = 'melee' | 'shield' | 'head' | 'chest' | 'boots' | 'gloves' | 'pants' | 'shoulder'
export type MaterialType = 'essence' | 'dust' | 'fragment' | 'shard' | 'crystal' | 'rune' | 'orb'

// Item requirements
export interface ItemRequirements {
  level?: number
  strength?: number
  intelligence?: number
  dexterity?: number
}

// Base stats that can appear on items
export interface ItemStats {
  // Vitals
  maxHp?: number
  maxMp?: number
  maxEs?: number
  hpRegen?: number
  mpRegen?: number
  esRegen?: number
  
  // Offense
  attack?: number
  spellPower?: number
  attackSpeed?: number
  castSpeed?: number
  critChance?: number
  critMultiplier?: number
  
  // Damage (for weapons)
  fireDamage?: number
  lightningDamage?: number
  iceDamage?: number
  darkDamage?: number
  chaosDamage?: number
  
  // Defense  
  armor?: number
  evasion?: number
  dodge?: number
  block?: number
  blockReduction?: number
  
  // Resistances
  fireRes?: number
  lightningRes?: number
  iceRes?: number
  darkRes?: number
  chaosRes?: number
  
  // Utility
  movementSpeed?: number
  itemRarity?: number
  itemQuantity?: number
  experienceGain?: number
  
  // Special properties
  speed?: number // Legacy support for existing items
}

// Socket information for items
export interface SocketInfo {
  socketCount: number
  socketedGems?: string[] // Array of gem IDs
}

// Affix system for crafting
export interface AffixInstance {
  id: string
  name: string
  description: string
  stats: ItemStats
  tier: number
  weight: number
}

// Dungeon modifiers for keys
export interface DungeonModifier {
  id: string
  name: string
  description: string
  effect: string
  value: number
}

// Base item interface - all items inherit from this
export interface BaseItem {
  // Core identity
  id: string              // Unique instance ID
  definitionId: string    // Reference to ItemDefinition
  name: string
  description: string
  icon: string
  
  // Stacking information
  stackSize?: number      // Max stack size (undefined = not stackable)
  currentStack?: number   // Current stack size (defaults to 1)
}

// Equipment items with full crafting support
export interface EquipmentItem extends BaseItem {
  type: 'equipment'
  slotType: EquipmentSlot
  rarity: ItemRarity
  itemLevel: number
  requirements?: ItemRequirements
  
  // Base stats from item definition
  baseStats: ItemStats
  
  // Crafting system integration
  prefixes: AffixInstance[]    // Max 3 prefixes
  suffixes: AffixInstance[]    // Max 3 suffixes
  implicit?: AffixInstance     // Inherent to base type
  
  // Calculated final stats (base + affixes)
  stats: ItemStats
  
  // Optional crafting metadata
  craftingTier?: number        // Quality tier (1-5)
  isCorrupted?: boolean        // Cannot be modified further
  sockets?: SocketInfo         // Socket information
  
  // Damage type for weapons
  damageType?: DamageType
}

// Dungeon keys for accessing content
export interface DungeonKeyItem extends BaseItem {
  type: 'key'
  dungeonId: string
  dungeonLevel: number
  dungeonType?: string         // e.g., 'boss', 'treasure', 'challenge'
  usesRemaining?: number       // For consumable keys (undefined = permanent)
  modifiers?: DungeonModifier[] // Special dungeon properties
}

// Crafting materials for the crafting system
export interface CraftingMaterialItem extends BaseItem {
  type: 'material'
  materialType: MaterialType
  tier: number                 // Quality/power tier (1-10)
  craftingValue: number        // Base crafting value
  tags: string[]              // For crafting recipe matching
  
  // Stackable by default
  stackSize: number           // Always defined for materials
  currentStack: number        // Current amount in stack
}

// Consumable items (potions, scrolls, etc.)
export interface ConsumableItem extends BaseItem {
  type: 'consumable'
  effectType: 'heal' | 'mana' | 'buff' | 'utility'
  effects: { [key: string]: any } // Flexible effect system
  duration?: number            // For temporary effects (in seconds)
  
  // Stackable by default
  stackSize: number
  currentStack: number
}

// Union type for all item types
export type AnyItem = EquipmentItem | DungeonKeyItem | CraftingMaterialItem | ConsumableItem

// Item location tracking
export interface ItemLocation {
  type: 'inventory' | 'stash' | 'equipment' | 'trade' | 'crafting' | 'temporary'
  slotIndex?: number          // For inventory/stash
  equipmentSlot?: EquipmentSlot // For equipment
  containerId?: string        // For nested containers
}

// Inventory slot reference (stores ID only)
export interface InventorySlot {
  itemId: string | null
  quantity?: number           // For stackable items
}

// Item definition (from JSON data) - kept separate from instances
export interface ItemDefinition {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'key'
  category: string            // Subcategory within type
  slotType?: EquipmentSlot
  rarity: ItemRarity
  description: string
  icon: string
  
  // Base properties
  itemLevel?: number
  baseStats?: ItemStats
  damageType?: DamageType
  requirements?: ItemRequirements
  effects?: { [key: string]: any }
  
  // Stacking and economy
  stackSize?: number
  craftingValue?: number
  enchantingValue?: number
  vendorValue?: number
  
  // Dungeon-specific
  dungeonTier?: number
  dungeonType?: string
  
  // Crafting-specific  
  materialType?: MaterialType
  tier?: number
  tags?: string[]
  
  // Modifiers for affix generation
  availablePrefixes?: string[] // Available prefix IDs
  availableSuffixes?: string[] // Available suffix IDs
  implicitAffix?: string       // Implicit affix ID
}

// Type guard functions will be implemented in next phase
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

export function getMaxStackSize(item: BaseItem): number {
  return item.stackSize || 1
}

export function getCurrentStackSize(item: BaseItem): number {
  return item.currentStack || 1
}