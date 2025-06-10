import { 
  Box, 
  Typography,
  IconButton,
  Chip,
  Tabs,
  Tab
} from '@mui/material'
import { Close, Store, Refresh, LocalAtm } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { playerStore } from '../stores/PlayerStore'
import { inventoryStore } from '../stores/InventoryStore'
import { getLootIcon } from '../utils/iconHelper'
import RpgButton from './RpgButton'
import RpgItemSlot from './RpgItemSlot'
import type { Item } from '../stores/InventoryStore'

interface ShopOverlayProps {
  open: boolean
  onClose: () => void
}

interface ShopItem {
  item: Item
  price: number
  category: 'equipment' | 'materials' | 'consumables'
}

const ShopOverlay = observer(({ open, onClose }: ShopOverlayProps) => {
  const [shopInventory, setShopInventory] = useState<ShopItem[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [refreshCost, setRefreshCost] = useState(50)

  const generateShopInventory = () => {
    const playerLevel = playerStore.playerInfo.level
    const newInventory: ShopItem[] = []

    // Generate 12-16 items total across categories
    const totalItems = 12 + Math.floor(Math.random() * 5)
    
    // Equipment (40% of inventory)
    const equipmentCount = Math.floor(totalItems * 0.4)
    for (let i = 0; i < equipmentCount; i++) {
      const item = generateEquipmentItem(playerLevel)
      if (item) {
        newInventory.push({
          item,
          price: calculateItemPrice(item, playerLevel),
          category: 'equipment'
        })
      }
    }

    // Materials (30% of inventory)
    const materialsCount = Math.floor(totalItems * 0.3)
    for (let i = 0; i < materialsCount; i++) {
      const item = generateMaterialItem(playerLevel)
      if (item) {
        newInventory.push({
          item,
          price: calculateItemPrice(item, playerLevel),
          category: 'materials'
        })
      }
    }

    // Consumables (30% of inventory)
    const consumablesCount = totalItems - equipmentCount - materialsCount
    for (let i = 0; i < consumablesCount; i++) {
      const item = generateConsumableItem(playerLevel)
      if (item) {
        newInventory.push({
          item,
          price: calculateItemPrice(item, playerLevel),
          category: 'consumables'
        })
      }
    }

    setShopInventory(newInventory)
  }

  const generateEquipmentItem = (playerLevel: number): Item | null => {
    // Generate equipment 1-3 levels around player level
    const itemLevel = Math.max(1, playerLevel - 2 + Math.floor(Math.random() * 5))
    
    // Get random equipment type
    const equipmentTypes = ['weapon', 'armor'] as const
    const selectedType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]
    
    // For now, return a basic equipment item
    // TODO: Use actual item generation from LootEngine
    return {
      id: `shop_${Date.now()}_${Math.random()}`,
      name: `${getRandomPrefix()} ${getRandomEquipmentBase(selectedType)}`,
      type: selectedType,
      rarity: getRandomRarity(playerLevel) as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
      slotType: getRandomSlotType() as 'melee' | 'shield' | 'head' | 'chest' | 'boots' | 'gloves' | 'pants' | 'shoulder',
      icon: getLootIcon(Math.floor(Math.random() * 100) + 1),
      stats: generateBasicStats(itemLevel)
    }
  }

  const generateMaterialItem = (_playerLevel: number): Item | null => {
    const materials = [
      { name: 'Iron Ore', icon: getLootIcon(45), rarity: 'common' },
      { name: 'Magic Dust', icon: getLootIcon(67), rarity: 'uncommon' },
      { name: 'Essence Fragment', icon: getLootIcon(89), rarity: 'rare' },
      { name: 'Crystal Shard', icon: getLootIcon(23), rarity: 'rare' },
      { name: 'Mythril Ore', icon: getLootIcon(78), rarity: 'epic' }
    ]

    const material = materials[Math.floor(Math.random() * materials.length)]
    const quantity = 1 + Math.floor(Math.random() * 5)

    return {
      id: `shop_mat_${Date.now()}_${Math.random()}`,
      name: quantity > 1 ? `${material.name} x${quantity}` : material.name,
      type: 'material',
      rarity: material.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
      icon: material.icon
    }
  }

  const generateConsumableItem = (_playerLevel: number): Item | null => {
    const consumables = [
      { name: 'Health Potion', icon: getLootIcon(34) },
      { name: 'Mana Potion', icon: getLootIcon(56) },
      { name: 'Scroll of Town Portal', icon: getLootIcon(12) },
      { name: 'Strength Elixir', icon: getLootIcon(78) },
      { name: 'Antidote', icon: getLootIcon(90) }
    ]

    const consumable = consumables[Math.floor(Math.random() * consumables.length)]
    const quantity = 1 + Math.floor(Math.random() * 3)

    return {
      id: `shop_consumable_${Date.now()}_${Math.random()}`,
      name: quantity > 1 ? `${consumable.name} x${quantity}` : consumable.name,
      type: 'consumable',
      rarity: 'common',
      icon: consumable.icon
    }
  }

  const calculateItemPrice = (item: Item, _playerLevel: number): number => {
    let basePrice = 10
    
    // Price based on item type
    switch (item.type) {
      case 'weapon':
      case 'armor':
        basePrice = 50 + 15 // Base equipment price
        break
      case 'material':
        basePrice = 25
        break
      case 'consumable':
        basePrice = 15
        break
    }

    // Rarity multiplier
    const rarityMultipliers = {
      common: 1,
      uncommon: 1.5,
      rare: 2.5,
      epic: 4,
      legendary: 8
    }

    const multiplier = rarityMultipliers[item.rarity] || 1
    
    return Math.floor(basePrice * multiplier)
  }

  const getRandomPrefix = (): string => {
    const prefixes = ['Simple', 'Sturdy', 'Fine', 'Superior', 'Masterwork', 'Enchanted']
    return prefixes[Math.floor(Math.random() * prefixes.length)]
  }

  const getRandomEquipmentBase = (type: string): string => {
    const bases = {
      weapon: ['Sword', 'Axe', 'Mace', 'Dagger', 'Staff', 'Bow'],
      armor: ['Helm', 'Chestplate', 'Boots', 'Gloves', 'Shield'],
      accessory: ['Ring', 'Amulet', 'Belt', 'Cloak']
    }
    const options = bases[type as keyof typeof bases] || ['Item']
    return options[Math.floor(Math.random() * options.length)]
  }

  const getRandomSlotType = (): string => {
    const slots = ['head', 'chest', 'boots', 'gloves', 'melee', 'shield', 'ring', 'neck']
    return slots[Math.floor(Math.random() * slots.length)]
  }

  const getRandomRarity = (playerLevel: number): string => {
    // Higher level players see better items more often
    const rand = Math.random()
    const levelBonus = Math.min(playerLevel / 10, 0.3)
    
    if (rand < 0.5 - levelBonus) return 'common'
    if (rand < 0.8 - levelBonus) return 'uncommon'
    if (rand < 0.95 - levelBonus) return 'rare'
    return 'epic'
  }

  const generateBasicStats = (level: number) => {
    return {
      attack: level * 2 + Math.floor(Math.random() * level),
      armor: level + Math.floor(Math.random() * level),
      dodge: Math.floor(Math.random() * 5),
      critChance: Math.floor(Math.random() * 3)
    }
  }

  const handlePurchase = (shopItem: ShopItem) => {
    if (playerStore.spendGold(shopItem.price)) {
      // Add item to inventory
      inventoryStore.addItem(shopItem.item)
      
      // Remove from shop
      setShopInventory(prev => prev.filter(item => item !== shopItem))
      
      console.log(`Purchased ${shopItem.item.name} for ${shopItem.price} gold`)
    }
  }

  const handleRefreshInventory = () => {
    if (playerStore.spendGold(refreshCost)) {
      generateShopInventory()
      setRefreshCost(refreshCost + 25) // Increase cost each time
      console.log(`Refreshed shop inventory for ${refreshCost} gold`)
    }
  }

  const getFilteredItems = () => {
    const categories = ['equipment', 'materials', 'consumables']
    const selectedCategory = categories[activeTab]
    return shopInventory.filter(item => item.category === selectedCategory)
  }

  // Initialize shop when opening
  useEffect(() => {
    if (open && shopInventory.length === 0) {
      generateShopInventory()
    }
  }, [open, shopInventory.length])

  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 60,
        right: 60,
        width: 600,
        height: 'calc(100vh - 120px)',
        zIndex: 1200,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        backgroundImage: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(205, 133, 63, 0.05) 100%)'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(139, 69, 19, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main' }}>
            Trader's Caravan
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<LocalAtm />} 
            label={`${playerStore.playerInfo.gold} Gold`} 
            color="warning"
            size="small"
          />
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Shop Actions */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Fresh goods from distant lands • Level-appropriate items
          </Typography>
          <RpgButton
            size="small"
            variant="secondary"
            startIcon={<Refresh />}
            onClick={handleRefreshInventory}
            disabled={playerStore.playerInfo.gold < refreshCost}
          >
            Refresh ({refreshCost}g)
          </RpgButton>
        </Box>
      </Box>
      
      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Equipment" />
          <Tab label="Materials" />
          <Tab label="Consumables" />
        </Tabs>
      </Box>

      {/* Shop Items Grid */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: 2 
        }}>
          {getFilteredItems().map((shopItem, index) => (
            <Box key={index} sx={{ 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(212, 175, 55, 0.1)'
              }
            }}>
              <RpgItemSlot
                item={shopItem.item}
                size={48}
                showTooltip={true}
              />
              
              <Typography variant="caption" sx={{ 
                mt: 1, 
                mb: 1, 
                fontSize: '0.7rem',
                lineHeight: 1.2,
                height: 28,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {shopItem.item.name}
              </Typography>
              
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {shopItem.price}g
                </Typography>
                
                <RpgButton
                  size="small"
                  variant="primary"
                  fullWidth
                  onClick={() => handlePurchase(shopItem)}
                  disabled={playerStore.playerInfo.gold < shopItem.price}
                >
                  Buy
                </RpgButton>
              </Box>
            </Box>
          ))}
        </Box>

        {getFilteredItems().length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            color: 'text.secondary' 
          }}>
            <Typography variant="body2">
              No {['equipment', 'materials', 'consumables'][activeTab]} available
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
})

export default ShopOverlay