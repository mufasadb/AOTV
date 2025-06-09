import { observer } from 'mobx-react-lite'
import { Box } from '@mui/material'
import { 
  DndContext, 
  DragOverlay, 
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { useState, useRef, useEffect } from 'react'
import { inventoryStore } from '../stores/InventoryStore'
import type { InventoryItem } from '../stores/InventoryStore'
import RpgItemSlot from './RpgItemSlot'

interface DraggedItemInfo {
  item: InventoryItem
  sourceType: 'inventory' | 'stash' | 'equipped'
  sourceIndex?: number
  sourceSlot?: string
}

interface EnhancedDragDropProps {
  children: React.ReactNode
}

const EnhancedDragDrop = observer(({ children }: EnhancedDragDropProps) => {
  const [draggedItem, setDraggedItem] = useState<DraggedItemInfo | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [contextKey, setContextKey] = useState(0)
  const dragOverlayRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Track mouse position during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedItem) {
        setDragPosition({ x: e.clientX, y: e.clientY })
      }
    }

    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [draggedItem])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    
    // Get the data from the draggable element
    const dragData = active.data.current
    if (!dragData || !dragData.item) {
      return
    }

    const item = dragData.item

    // Use the source info from the drag data
    const sourceInfo: DraggedItemInfo = {
      item,
      sourceType: dragData.sourceType,
      sourceIndex: dragData.sourceIndex,
      sourceSlot: dragData.sourceSlot
    }

    setDraggedItem(sourceInfo)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over || !draggedItem) return

    // Add visual feedback for valid drop zones
    
    // You could add CSS classes here for visual feedback
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event
    
    // Always ensure cleanup happens regardless of drop outcome
    const forceCleanup = () => {
      setDraggedItem(null)
      setDragPosition({ x: 0, y: 0 })
      
      // If this was an invalid drop, force remount the DndContext to reset everything
      if (!over || !validateDropTarget(draggedItem?.item!, over.data.current)) {
        setTimeout(() => {
          setContextKey(prev => prev + 1)
        }, 50)
      }
      
      // Standard cleanup
      setTimeout(() => {
        setDraggedItem(null)
        setDragPosition({ x: 0, y: 0 })
      }, 0)
    }
    
    if (!draggedItem) {
      forceCleanup()
      return
    }

    if (!over) {
      forceCleanup()
      return
    }

    const dropData = over.data.current
    const isValidDrop = validateDropTarget(draggedItem.item, dropData)

    if (!isValidDrop) {
      // Invalid drop - ensure same cleanup as valid drops
      forceCleanup()
      return
    }

    // Handle the drop based on target type
    handleValidDrop(draggedItem, dropData)
    
    // Valid drop - same cleanup
    forceCleanup()
  }

  const validateDropTarget = (item: InventoryItem, dropData: any): boolean => {
    if (!dropData) return false

    const { type: targetType, slotType: targetSlot } = dropData

    switch (targetType) {
      case 'inventory-slot':
      case 'inventory-area':
        return true // Inventory accepts all items

      case 'stash-slot':
      case 'stash-area':
        return true // Stash accepts all items

      case 'equipment-slot':
        // Equipment slots only accept matching item types
        return item.slotType === targetSlot

      case 'equipment-area':
        // General equipment area - check if item is equippable
        return !!item.slotType

      case 'deconstruction-slot':
        // Deconstruction only accepts magic or higher rarity items
        return item.rarity !== 'common'

      case 'crafting-anvil':
      case 'crafting-tool':
      case 'crafting-materials':
        // Crafting accepts appropriate items (placeholder for now)
        return true

      default:
        return false
    }
  }

  const handleValidDrop = (draggedInfo: DraggedItemInfo, dropData: any) => {
    const { item, sourceType, sourceIndex, sourceSlot } = draggedInfo
    const { type: targetType, slotType: targetSlot, index: targetIndex } = dropData

    // Handle drop based on target
    switch (targetType) {
      case 'inventory-slot':
      case 'inventory-area':
        if (sourceType === 'inventory' && typeof sourceIndex === 'number' && typeof targetIndex === 'number') {
          // Reorder within inventory
          inventoryStore.reorderInventory(sourceIndex, targetIndex)
        } else if (sourceType === 'stash') {
          // Move from stash to inventory
          inventoryStore.moveToInventory(item.id)
        } else if (sourceType === 'equipped' && sourceSlot) {
          // Unequip to inventory
          inventoryStore.unequipItem(sourceSlot)
        }
        break

      case 'stash-slot':
      case 'stash-area':
        if (sourceType === 'inventory') {
          // Move from inventory to stash
          inventoryStore.moveToStash(item.id)
        } else if (sourceType === 'equipped' && sourceSlot) {
          // Unequip directly to stash
          inventoryStore.unequipToStash(sourceSlot)
        }
        break

      case 'equipment-slot':
        if (sourceType === 'inventory') {
          inventoryStore.equipItem(item.id)
        } else if (sourceType === 'stash') {
          // Move from stash to inventory first, then equip
          inventoryStore.moveToInventory(item.id)
          setTimeout(() => inventoryStore.equipItem(item.id), 0)
        } else if (sourceType === 'equipped' && sourceSlot && targetSlot && sourceSlot !== targetSlot) {
          // Swap equipment slots (if both items are compatible)
          const currentTargetItem = inventoryStore.equipped[targetSlot]
          if (currentTargetItem) {
            inventoryStore.equipped[sourceSlot] = currentTargetItem
            inventoryStore.equipped[targetSlot] = item
          } else {
            inventoryStore.unequipItem(sourceSlot)
            inventoryStore.equipped[targetSlot] = item
          }
        }
        break

      case 'deconstruction-slot':
        // Call the deconstruction handler if available
        if (dropData.onDrop) {
          dropData.onDrop(item)
        }
        break

      case 'crafting-anvil':
      case 'crafting-tool': 
      case 'crafting-materials':
        // TODO: Implement crafting handlers
        console.log(`Dropped ${item.name} on ${targetType}`)
        break
    }
  }

  return (
    <DndContext
      key={contextKey}
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      {/* Custom drag overlay that follows cursor */}
      <DragOverlay dropAnimation={null}>
        {draggedItem ? (
          <Box
            ref={dragOverlayRef}
            sx={{
              position: 'fixed',
              left: dragPosition.x - 32,
              top: dragPosition.y - 32,
              zIndex: 10000,
              pointerEvents: 'none',
              transform: 'rotate(5deg)',
              filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))',
            }}
          >
            <RpgItemSlot
              item={draggedItem.item}
              slotType={draggedItem.item.slotType || 'skill'}
              size={64}
              showTooltip={false}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
})

export default EnhancedDragDrop