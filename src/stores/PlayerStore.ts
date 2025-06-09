import { makeAutoObservable } from 'mobx'
import { inventoryStore } from './InventoryStore'
import type { CombatStats, DamageType } from './CombatStore'

export interface PlayerVitals {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  es: number
  maxEs: number
}

export interface PlayerInfo {
  name: string
  level: number
  experience: number
  gold: number
  keys: number
  craftingMats: number
}

class PlayerStore {
  // Player basic info
  playerInfo: PlayerInfo = {
    name: 'Adventurer',
    level: 12,
    experience: 850,
    gold: 2450,
    keys: 3,
    craftingMats: 18
  }

  // Player current vitals
  vitals: PlayerVitals = {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    es: 0,
    maxEs: 0
  }

  // Base stats before equipment bonuses
  baseStats = {
    maxHp: 100, // Player starts with 100 base health
    maxMp: 50,
    maxEs: 0, // Only from gear
    armor: 0,
    fireRes: 0,
    lightningRes: 0,
    iceRes: 0,
    darkRes: 0,
    dodge: 5, // Base 5% dodge
    block: 0, // Only from shields
    critChance: 5, // Base 5% crit
    critMultiplier: 1.5, // Base 1.5x crit multiplier
    attack: 10, // Base unarmed damage
    speed: 10, // Base speed
    damageType: 'physical' as DamageType
  }

  constructor() {
    makeAutoObservable(this)
    // Ensure player starts with full vitals
    this.fullHeal()
  }

  // Calculate total stat from base + equipment
  calculateTotalStat(statName: string): number {
    const baseStat = this.baseStats[statName as keyof typeof this.baseStats]
    let total = typeof baseStat === 'number' ? baseStat : 0
    
    // Add equipment bonuses
    Object.values(inventoryStore.equipped).forEach(item => {
      if (item && item.stats && item.stats[statName]) {
        const itemStat = item.stats[statName]
        if (typeof itemStat === 'number') {
          total += itemStat
        }
      }
    })
    
    return total
  }

  // Get all combat stats (for combat system)
  get combatStats(): CombatStats {
    return {
      hp: this.vitals.hp,
      maxHp: this.calculateTotalStat('maxHp'),
      mp: this.vitals.mp,
      maxMp: this.calculateTotalStat('maxMp'),
      es: this.vitals.es,
      maxEs: this.calculateTotalStat('maxEs'),
      armor: this.calculateTotalStat('armor'),
      fireRes: this.calculateTotalStat('fireRes'),
      lightningRes: this.calculateTotalStat('lightningRes'),
      iceRes: this.calculateTotalStat('iceRes'),
      darkRes: this.calculateTotalStat('darkRes'),
      dodge: this.calculateTotalStat('dodge'),
      block: this.calculateTotalStat('block'),
      critChance: this.calculateTotalStat('critChance'),
      critMultiplier: this.calculateTotalStat('critMultiplier'),
      damage: this.calculateTotalStat('attack'), // Map attack to damage for combat
      damageType: this.getDominantDamageType()
    }
  }

  // Determine primary damage type based on equipped weapon
  getDominantDamageType(): DamageType {
    const weapon = inventoryStore.equipped.melee
    if (weapon && weapon.stats) {
      // Check for elemental damage stats on weapon
      if (weapon.stats.fireDamage) return 'fire'
      if (weapon.stats.lightningDamage) return 'lightning'
      if (weapon.stats.iceDamage) return 'ice'
      if (weapon.stats.darkDamage) return 'dark'
    }
    return 'physical' // Default
  }

  // Update vitals (used during combat, rest, etc.)
  updateVitals(changes: Partial<PlayerVitals>) {
    Object.assign(this.vitals, changes)
    
    // Ensure vitals don't exceed maximums
    const maxHp = this.calculateTotalStat('maxHp')
    const maxMp = this.calculateTotalStat('maxMp')
    const maxEs = this.calculateTotalStat('maxEs')
    
    this.vitals.hp = Math.min(this.vitals.hp, maxHp)
    this.vitals.mp = Math.min(this.vitals.mp, maxMp)
    this.vitals.es = Math.min(this.vitals.es, maxEs)
  }

  // Set vitals to maximum (full heal)
  fullHeal() {
    this.vitals.hp = this.calculateTotalStat('maxHp')
    this.vitals.mp = this.calculateTotalStat('maxMp')
    this.vitals.es = this.calculateTotalStat('maxEs')
  }

  // Take damage (returns actual damage taken)
  takeDamage(damage: number, damageType: DamageType = 'physical'): number {
    let actualDamage = damage

    // Apply resistances
    switch (damageType) {
      case 'physical':
        actualDamage *= (1 - this.calculateTotalStat('armor') / 100)
        break
      case 'fire':
        actualDamage *= (1 - this.calculateTotalStat('fireRes') / 100)
        break
      case 'lightning':
        actualDamage *= (1 - this.calculateTotalStat('lightningRes') / 100)
        break
      case 'ice':
        actualDamage *= (1 - this.calculateTotalStat('iceRes') / 100)
        break
      case 'dark':
        actualDamage *= (1 - this.calculateTotalStat('darkRes') / 100)
        break
    }

    actualDamage = Math.max(1, Math.floor(actualDamage)) // Minimum 1 damage

    // Energy shield absorbs damage first
    if (this.vitals.es > 0) {
      const shieldDamage = Math.min(this.vitals.es, actualDamage)
      this.vitals.es -= shieldDamage
      actualDamage -= shieldDamage
    }

    // Remaining damage to HP
    if (actualDamage > 0) {
      this.vitals.hp = Math.max(0, this.vitals.hp - actualDamage)
    }

    return damage // Return original damage for display purposes
  }

  // Restore health/mana
  heal(amount: number) {
    this.vitals.hp = Math.min(this.vitals.hp + amount, this.calculateTotalStat('maxHp'))
  }

  restoreMana(amount: number) {
    this.vitals.mp = Math.min(this.vitals.mp + amount, this.calculateTotalStat('maxMp'))
  }

  restoreEnergyShield(amount: number) {
    this.vitals.es = Math.min(this.vitals.es + amount, this.calculateTotalStat('maxEs'))
  }

  // Spend mana (returns true if successful)
  spendMana(amount: number): boolean {
    if (this.vitals.mp >= amount) {
      this.vitals.mp -= amount
      return true
    }
    return false
  }

  // Player info updates
  addGold(amount: number) {
    this.playerInfo.gold += amount
  }

  spendGold(amount: number): boolean {
    if (this.playerInfo.gold >= amount) {
      this.playerInfo.gold -= amount
      return true
    }
    return false
  }

  addKeys(amount: number) {
    this.playerInfo.keys += amount
  }

  useKey(): boolean {
    if (this.playerInfo.keys > 0) {
      this.playerInfo.keys--
      return true
    }
    return false
  }

  addCraftingMaterials(amount: number) {
    this.playerInfo.craftingMats += amount
  }

  useCraftingMaterials(amount: number): boolean {
    if (this.playerInfo.craftingMats >= amount) {
      this.playerInfo.craftingMats -= amount
      return true
    }
    return false
  }

  // Gain experience and handle leveling
  gainExperience(amount: number) {
    this.playerInfo.experience += amount
    this.checkLevelUp()
  }

  private checkLevelUp() {
    const expForNextLevel = this.playerInfo.level * 100 // Simple formula
    if (this.playerInfo.experience >= expForNextLevel) {
      this.playerInfo.level++
      this.playerInfo.experience -= expForNextLevel
      this.onLevelUp()
    }
  }

  private onLevelUp() {
    // Increase base stats on level up
    this.baseStats.maxHp += 5
    this.baseStats.maxMp += 2
    this.baseStats.attack += 1
    
    // Full heal on level up
    this.fullHeal()
  }

  // Check if player is alive
  get isAlive(): boolean {
    return this.vitals.hp > 0
  }

  // Check if player is at full health
  get isFullHealth(): boolean {
    return this.vitals.hp >= this.calculateTotalStat('maxHp')
  }

  // Get health percentage
  get healthPercentage(): number {
    const maxHp = this.calculateTotalStat('maxHp')
    return maxHp > 0 ? (this.vitals.hp / maxHp) * 100 : 0
  }

  // Get mana percentage
  get manaPercentage(): number {
    const maxMp = this.calculateTotalStat('maxMp')
    return maxMp > 0 ? (this.vitals.mp / maxMp) * 100 : 0
  }

  // Get energy shield percentage
  get energyShieldPercentage(): number {
    const maxEs = this.calculateTotalStat('maxEs')
    return maxEs > 0 ? (this.vitals.es / maxEs) * 100 : 0
  }
}

export const playerStore = new PlayerStore()