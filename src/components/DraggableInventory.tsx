import { observer } from 'mobx-react-lite'
import { Box, Typography } from '@mui/material'
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { KeyboardSensor } from '@dnd-kit/core'
import { useState } from 'react'
import { inventoryStore } from '../stores/InventoryStore'
import type { InventoryItem } from '../stores/InventoryStore'
import DraggableItemSlot from './DraggableItemSlot'
import RpgItemSlot from './RpgItemSlot'

const DraggableInventory = observer(() => {
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = inventoryStore.getItemById(active.id as string)
    setActiveItem(item)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    // Handle inventory reordering
    if (over.id === 'inventory-area' || over.data.current?.type === 'inventory-slot') {
      const activeIndex = inventoryStore.inventory.findIndex(item => item.id === active.id)
      const overIndex = inventoryStore.inventory.findIndex(item => item.id === over.id)
      
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        inventoryStore.reorderInventory(activeIndex, overIndex)
      }
    }

    // Handle moving to stash
    if (over.id === 'stash-area') {
      inventoryStore.moveToStash(active.id as string)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Inventory ({inventoryStore.inventory.length}/20)
        </Typography>
        
        <SortableContext 
          items={inventoryStore.inventory.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          <Box 
            id="inventory-area"
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: 1,
              minHeight: 200,
              p: 2,
              border: '2px dashed rgba(139, 69, 19, 0.5)',
              borderRadius: 2,
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {inventoryStore.inventory.map((item, index) => (
              <DraggableItemSlot
                key={item.id}
                item={item}
                index={index}
              />
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 20 - inventoryStore.inventory.length) }).map((_, index) => (
              <Box
                key={`empty-${index}`}
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
        </SortableContext>
        
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
          💡 Drag items to reorder or drop in stash
        </Typography>
      </Box>

      {/* Drag overlay */}
      <DragOverlay>
        {activeItem ? (
          <RpgItemSlot
            item={activeItem}
            slotType={activeItem.slotType || 'skill'}
            size={64}
            showTooltip={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
})

export default DraggableInventory