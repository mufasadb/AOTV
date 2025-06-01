import { observer } from 'mobx-react-lite'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  IconButton 
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useDroppable } from '@dnd-kit/core'
import { inventoryStore } from '../stores/InventoryStore'
import EnhancedDraggableItem from './EnhancedDraggableItem'
import { getRpgFrame } from '../utils/iconHelper'

interface StashOverlayProps {
  open: boolean
  onClose: () => void
}

const StashOverlay = observer(({ open, onClose }: StashOverlayProps) => {
  const { setNodeRef: setStashRef, isOver: isStashOver } = useDroppable({
    id: 'stash-area',
    data: {
      type: 'stash-area',
    },
  })

  const { setNodeRef: setInventoryRef, isOver: isInventoryOver } = useDroppable({
    id: 'inventory-preview',
    data: {
      type: 'inventory-area',
    },
  })

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `url(${getRpgFrame('Paper_01.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px',
        }
      }}
    >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontFamily: 'Cinzel, serif',
          fontSize: '1.5rem',
          color: '#8B4513',
        }}>
          Adventurer's Stash
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Stash Area */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>
                Stored Items ({inventoryStore.stash.length})
              </Typography>
              
              <Box 
                ref={setStashRef}
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(6, 1fr)', 
                  gap: 1,
                  minHeight: 300,
                  p: 2,
                  border: isStashOver ? '3px solid #4ade80' : '3px solid #8B4513',
                  borderRadius: 2,
                  background: isStashOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(139, 69, 19, 0.1)',
                  backgroundImage: `url(${getRpgFrame('pattern.png')})`,
                  backgroundSize: '50px',
                  backgroundOpacity: 0.1,
                  transition: 'all 0.2s ease',
                }}
              >
                {inventoryStore.stash.map((item, index) => (
                  <EnhancedDraggableItem
                    key={item.id}
                    item={item}
                    sourceType="stash"
                    sourceIndex={index}
                    size={64}
                  />
                ))}
                
                {/* Empty stash slots */}
                {Array.from({ length: Math.max(0, 30 - inventoryStore.stash.length) }).map((_, index) => (
                  <Box
                    key={`stash-empty-${index}`}
                    sx={{
                      width: 64,
                      height: 64,
                      border: '2px dashed rgba(139, 69, 19, 0.3)',
                      borderRadius: 1,
                      background: 'rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </Box>
              
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                💡 Click items to move back to inventory
              </Typography>
            </Box>

            {/* Inventory Preview */}
            <Box sx={{ width: 200 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>
                Inventory
              </Typography>
              
              <Box 
                ref={setInventoryRef}
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 1,
                  p: 2,
                  border: isInventoryOver ? '3px solid #4ade80' : '2px solid #8B4513',
                  borderRadius: 2,
                  background: isInventoryOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(139, 69, 19, 0.05)',
                  maxHeight: 300,
                  overflow: 'auto',
                  transition: 'all 0.2s ease',
                }}
              >
                {inventoryStore.inventory.slice(0, 12).map((item, index) => (
                  <EnhancedDraggableItem
                    key={item.id}
                    item={item}
                    sourceType="inventory"
                    sourceIndex={index}
                    size={48}
                  />
                ))}
              </Box>
              
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Click to move to stash
              </Typography>
            </Box>
          </Box>
        </DialogContent>

    </Dialog>
  )
})

export default StashOverlay