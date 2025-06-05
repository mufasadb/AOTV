import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography,
  Button,
  IconButton,
  Divider,
  Chip
} from '@mui/material'
import { Close, Build, ArrowDownward } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { inventoryStore } from '../stores/InventoryStore'
import { materialsStore } from '../stores/MaterialsStore'
import type { Item } from '../stores/InventoryStore'
import EnhancedDraggableItem from './EnhancedDraggableItem'
import RpgItemSlot from './RpgItemSlot'

interface DeconstructionOverlayProps {
  open: boolean
  onClose: () => void
}

const DeconstructionOverlay = observer(({ open, onClose }: DeconstructionOverlayProps) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isBreakingDown, setIsBreakingDown] = useState(false)
  const [breakdownResults, setBreakdownResults] = useState<{ material: string, quantity: number }[]>([])

  const handleItemDrop = (item: Item) => {
    // Only allow magic or rare items to be broken down
    if (item.rarity === 'common') {
      return
    }
    setSelectedItem(item)
    setBreakdownResults([])
  }

  const handleBreakdown = () => {
    if (!selectedItem) return

    setIsBreakingDown(true)
    
    // Simulate breakdown animation
    setTimeout(() => {
      // Calculate materials based on item rarity
      const materialsToAdd: { [materialId: string]: number } = {}
      const results: { material: string, quantity: number }[] = []
      
      switch (selectedItem.rarity) {
        case 'uncommon':
          const magicDustQty = Math.floor(Math.random() * 3) + 1
          materialsToAdd['magic_dust'] = magicDustQty
          results.push({ material: 'Magic Dust', quantity: magicDustQty })
          break
        case 'rare':
          const rareDustQty = Math.floor(Math.random() * 3) + 2
          const essenceQty = Math.floor(Math.random() * 2) + 1
          materialsToAdd['magic_dust'] = rareDustQty
          materialsToAdd['essence_fragments'] = essenceQty
          results.push({ material: 'Magic Dust', quantity: rareDustQty })
          results.push({ material: 'Essence Fragments', quantity: essenceQty })
          break
        case 'epic':
          const epicDustQty = Math.floor(Math.random() * 4) + 3
          const epicEssenceQty = Math.floor(Math.random() * 3) + 2
          const chaosQty = 1
          materialsToAdd['magic_dust'] = epicDustQty
          materialsToAdd['essence_fragments'] = epicEssenceQty
          materialsToAdd['chaos_shards'] = chaosQty
          results.push({ material: 'Magic Dust', quantity: epicDustQty })
          results.push({ material: 'Essence Fragments', quantity: epicEssenceQty })
          results.push({ material: 'Chaos Shards', quantity: chaosQty })
          break
      }

      // Add materials to the materials store
      materialsStore.addMaterials(materialsToAdd)
      
      setBreakdownResults(results)
      
      // Remove item from inventory
      inventoryStore.removeItem(selectedItem)
      
      setIsBreakingDown(false)
      setSelectedItem(null)
    }, 1500)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
      case 'normal':
        return '#9e9e9e'
      case 'uncommon':
      case 'magic':
        return '#2196f3'
      case 'rare':
        return '#ffc107'
      case 'epic':
        return '#9c27b0'
      default:
        return '#9e9e9e'
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Build />
          <Typography variant="h6">Item Deconstruction</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ minHeight: 400, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Instructions */}
          <Typography variant="body2" color="text.secondary">
            Break down magic and rare items to obtain crafting materials. Higher rarity items yield better materials.
          </Typography>

          {/* Deconstruction Slot */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2">Place Item to Deconstruct</Typography>
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RpgItemSlot
                slotType="deconstruct"
                item={selectedItem || undefined}
                onDrop={handleItemDrop}
                alt="deconstruct slot"
                sx={{
                  width: 120,
                  height: 120,
                  border: selectedItem ? `2px solid ${getRarityColor(selectedItem.rarity)}` : '2px dashed',
                  borderColor: selectedItem ? undefined : 'divider',
                  boxShadow: selectedItem ? `0 0 20px ${getRarityColor(selectedItem.rarity)}40` : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              {selectedItem && (
                <Box sx={{ position: 'absolute', top: -8, right: -8 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedItem(null)
                      setBreakdownResults([])
                    }}
                    sx={{ 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'error.dark'
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            {selectedItem && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: getRarityColor(selectedItem.rarity) }}>
                  {selectedItem.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)} {selectedItem.type}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Arrow */}
          {selectedItem && !breakdownResults.length && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ArrowDownward sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          )}

          {/* Results */}
          {breakdownResults.length > 0 && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" gutterBottom>Materials Obtained:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {breakdownResults.map((result, index) => (
                  <Chip
                    key={index}
                    label={`${result.material} x${result.quantity}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Action Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
            <Button
              variant="contained"
              onClick={handleBreakdown}
              disabled={!selectedItem || isBreakingDown}
              startIcon={<Build />}
              sx={{ minWidth: 200 }}
            >
              {isBreakingDown ? 'Breaking Down...' : 'Break Down Item'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Inventory Items */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Available Items (Magic or Higher)
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)', 
              gap: 1,
              p: 1,
              bgcolor: 'background.default',
              borderRadius: 1,
              minHeight: 100
            }}>
              {inventoryStore.backpack
                .filter(item => item && ['uncommon', 'rare', 'epic'].includes(item.rarity))
                .map((item, index) => (
                  <EnhancedDraggableItem
                    key={item.id}
                    item={item}
                    dragType="backpack"
                  />
                ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
})

export default DeconstructionOverlay