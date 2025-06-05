import { observer } from 'mobx-react-lite'
import { Box, Typography } from '@mui/material'
import { useDroppable } from '@dnd-kit/core'
import { inventoryStore } from '../stores/InventoryStore'
import EnhancedDraggableItem from './EnhancedDraggableItem'

const EnhancedInventory = observer(() => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'inventory-area',
    data: {
      type: 'inventory-area',
    },
  })

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Inventory ({inventoryStore.inventory.length}/20)
      </Typography>
      
      <Box 
        ref={setNodeRef}
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: 1,
          minHeight: 200,
          p: 2,
          border: isOver ? '2px solid #4ade80' : '2px dashed rgba(139, 69, 19, 0.5)',
          borderRadius: 2,
          background: isOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
        }}
      >
        {inventoryStore.inventory.map((item, index) => (
          <InventorySlot key={`${item.id}-${index}-${inventoryStore.inventory.length}`} item={item} index={index} />
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 20 - inventoryStore.inventory.length) }).map((_, index) => (
          <EmptySlot 
            key={`empty-${index}`} 
            index={inventoryStore.inventory.length + index}
          />
        ))}
      </Box>
      
      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
        💡 Drag items to equipment slots, stash, or reorder
      </Typography>
    </Box>
  )
})

const InventorySlot = observer(({ item, index }: { item: any, index: number }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `inventory-slot-${index}`,
    data: {
      type: 'inventory-slot',
      index: index,
    },
  })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        border: isOver ? '2px solid #4ade80' : 'none',
        borderRadius: 1,
        background: isOver ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <EnhancedDraggableItem
        item={item}
        sourceType="inventory"
        sourceIndex={index}
        size={64}
      />
    </Box>
  )
})

const EmptySlot = ({ index }: { index: number }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `inventory-empty-${index}`,
    data: {
      type: 'inventory-slot',
      index: index,
    },
  })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 64,
        height: 64,
        border: isOver ? '2px solid #4ade80' : '2px dashed rgba(139, 69, 19, 0.3)',
        borderRadius: 1,
        background: isOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
    />
  )
}

export default EnhancedInventory