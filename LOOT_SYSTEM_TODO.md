# Loot System Enhancement TODO

## **Overview**
Comprehensive plan to transform the current static item drops into a dynamic, procedurally-generated loot system with proper balance testing and distribution analysis.

## **Current System Analysis** ✅ COMPLETED

### **Modifier Tier System** (5 Tiers)
- **Tier 1**: Level 1, Weight 100 (most common)
- **Tier 2**: Level 10, Weight 80  
- **Tier 3**: Level 20, Weight 60
- **Tier 4**: Level 30, Weight 40
- **Tier 5**: Level 40-50, Weight 20-10 (rarest)

### **Crafting Orb Coverage**
**Available Orbs:**
- ✅ **Normal → Magic** (Essence of Enchantment) - 1-2 affixes
- ✅ **Normal → Rare** (Essence of Empowerment) - 3-4 affixes  
- ✅ **Magic Reroll** (Shard of Flux) - reroll magic item affixes
- ✅ **Rare Reroll** (Crystal of Chaos) - reroll rare item affixes
- ✅ **Magic → Rare** (Rune of Ascension) - upgrade while preserving affixes

**Missing Coverage:**
- ❌ **Epic tier orbs** - no way to create/reroll epic items
- ❌ **Legendary tier orbs** - no way to create/reroll legendary items  

**Decision**: Keep current system (epic/legendary remain drop-only for exclusivity)

---

## **Phase 1: Core Generation + Distribution Testing** 🎯

### **1.1 Enhanced Loot Generation Engine** ✅ COMPLETED
- [x] Create `src/systems/LootEngine.ts` - Main procedural generation system
- [x] Implement dynamic base item generation with stat variance
- [x] Integrate 5-tier affix system using existing modifiers.json
- [x] Add level-appropriate affix tier selection
- [x] Implement quality variance within rarity tiers

**Key Features:**
- Items have min/max stat ranges instead of fixed values
- Affixes applied based on item rarity and player level
- Context-aware generation (enemy tier influences drops)

### **1.2 Smart Rarity Distribution** *(No Pity System)*
- [ ] Implement context-aware drops based on enemy tier
- [ ] Add boss bonuses for guaranteed minimum rarity
- [ ] Create player level influence on available affix tiers
- [ ] Design natural rarity progression through gameplay

**Target Distribution:**
- Common: 60%
- Uncommon: 25% 
- Rare: 10%
- Epic: 4%
- Legendary: 1%

### **1.3 Distribution Testing Framework** 🧪
- [ ] Create `src/systems/LootDistributionTester.ts`
- [ ] Create `src/tests/LootDistribution.test.ts`
- [ ] Implement large sample statistical analysis

**Testing Components:**
```typescript
class LootDistributionTester {
  generateSampleLoot(enemyTier: number, playerLevel: number, sampleSize: number)
  analyzeRarityDistribution(samples: ItemDrop[])
  analyzeAffixTierDistribution(samples: ItemDrop[])
  analyzePowerLevel(samples: ItemDrop[])
  validateExpectedRanges(samples: ItemDrop[], expectedDistribution: DistributionConfig)
}
```

**Distribution Tests:**
- [ ] Rarity distribution validation
- [ ] Affix tier distribution per player level
- [ ] Power level analysis and stat budget validation
- [ ] Edge case testing (very low/high levels)
- [ ] Progression validation (items improve with level/tier)

### **1.4 Balance Prediction System** 📈
- [ ] Create `src/systems/LootBalancePredictor.ts`
- [ ] Implement predictive analysis system

```typescript
interface DistributionMetrics {
  rarityBreakdown: { [rarity: string]: number }
  averagePowerLevel: number
  affixTierDistribution: { [tier: number]: number }
  expectedUpgradeRate: number
  economicValue: number
}
```

**Predictive Features:**
- [ ] Model expected player progression curves
- [ ] Identify potential balance issues before gameplay impact
- [ ] Adjust generation weights based on simulation results
- [ ] Validate loot feels rewarding at different progression stages

---

## **Phase 2: Advanced Item Properties** ⚡

### **2.1 Stat Variance & Scaling**
- [ ] Implement stat ranges for each item (min/max instead of fixed)
- [ ] Add perfect roll system (rare chance for maximum stats)
- [ ] Create scaling formulas (stats scale with item level and enemy tier)
- [ ] Support hybrid properties (multiple damage types, resist combinations)

### **2.2 Affix System Integration**
- [ ] Create `src/utils/AffixGenerator.ts`
- [ ] Implement tiered affix application using existing modifier system
- [ ] Add rarity-based affix count logic:
  - Magic: 1-2 affixes
  - Rare: 3-4 affixes  
  - Epic: 4-5 affixes
  - Legendary: 5-6 affixes + special properties
- [ ] Implement synergistic affix combinations with bonus effects

### **2.3 Special Item Types**
- [ ] Design set item system (multi-piece equipment with set bonuses)
- [ ] Create unique item definitions (hand-crafted items with special mechanics)
- [ ] Integrate crafting orb drops into loot generation
- [ ] Implement material scaling (better materials from higher tier enemies)

---

## **Phase 3: Intelligent Loot Distribution** 🧠

### **3.1 Player-Aware Generation**
- [ ] Implement current gear analysis (compare drops to equipped items)
- [ ] Add playstyle detection (prefer items matching player's build)
- [ ] Create progression gap detection (higher chance for outdated equipment slots)
- [ ] Implement anti-duplication system (reduce similar recent items)

### **3.2 Dungeon & Enemy Context**
- [ ] Design thematic drops (fire dungeons drop fire-related items)
- [ ] Create enemy-specific loot tables
- [ ] Implement tier scaling (each dungeon tier has distinct item level ranges)
- [ ] Add regional specialization (different zones emphasize different item types)

### **3.3 Economic Balance**
- [ ] Define power curves (items follow predictable progression)
- [ ] Maintain rarity economics (legendary items remain valuable)
- [ ] Implement stat budgets (total item power follows constraints)
- [ ] Balance trade values in generation logic

---

## **Phase 4: Enhanced User Experience** ✨

### **4.1 Rich Reward Display**
- [ ] Update `src/components/RewardModal.tsx` with detailed item cards
- [ ] Show all stats, affixes, and properties in reward modal
- [ ] Add comparison tooltips (compare to currently equipped gear)
- [ ] Implement rarity animations (special effects for higher rarity drops)
- [ ] Add drop notifications (floating text for notable items during combat)

### **4.2 Item Identification & Discovery**
- [ ] Implement unidentified items (require identification to reveal properties)
- [ ] Add item history tracking (when/where items were obtained)
- [ ] Create discovery log (record new item types found)
- [ ] Add stat explanations (tooltips explaining each stat)

---

## **Implementation Strategy** 🛠️

### **Priority Order:**
1. **✅ Phase 1.1** - Core Generation (Essential functionality)
2. **✅ Phase 1.3** - Distribution Testing (Validation framework)
3. **Phase 2.2** - Affix Integration (High impact, existing system)
4. **Phase 3.1** - Smart Distribution (Quality of life improvement)  
5. **Phase 4.1** - UI Enhancement (Player experience)
6. **Remaining phases** - Polish and depth

### **Key Files to Create/Modify:**
- `src/systems/LootEngine.ts` - Main loot generation logic
- `src/systems/LootDistributionTester.ts` - Testing framework
- `src/systems/LootBalancePredictor.ts` - Balance analysis
- `src/utils/AffixGenerator.ts` - Procedural affix generation
- `src/tests/LootDistribution.test.ts` - Automated distribution tests
- `src/systems/EnemySystem.ts` - Update existing loot generation
- `src/systems/ItemSystem.ts` - Enhanced item creation utilities
- `src/components/RewardModal.tsx` - Enhanced item display

### **Integration Points:**
- Use existing `modifiers.json` for affixes
- Leverage `ItemRegistry.ts` for item tracking
- Connect to `PlayerStore.ts` for player-aware generation
- Enhance `CombatStore.ts` loot collection with rich item data

### **Success Metrics** 📊
- [ ] Items feel unique and meaningful (no duplicate boring drops)
- [ ] Clear progression path through item improvements
- [ ] Player excitement when seeing loot drops
- [ ] Balanced economy with appropriate rarity distribution
- [ ] Smooth integration with existing systems
- [ ] Distribution tests pass with expected statistical ranges
- [ ] Balance predictions align with actual gameplay experience

---

## **Current Status**
- **Combat System Refactor**: ✅ COMPLETED - Fixed enemy death state resets and loot reward modal
- **Phase 1.1 Enhanced Loot Generation Engine**: ✅ COMPLETED - Full procedural generation with affixes
- **Next Priority**: Phase 1.3 - Distribution Testing Framework

## **Notes**
- No pity system implemented (by design choice)
- Epic/Legendary remain drop-only to maintain exclusivity
- Focus on statistical validation through testing framework
- Emphasis on player experience and meaningful progression