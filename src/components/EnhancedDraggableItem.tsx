import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { InventoryItem } from '../stores/InventoryStore'
import RpgItemSlot from './RpgItemSlot'

interface EnhancedDraggableItemProps {
  item: InventoryItem
  sourceType: 'inventory' | 'stash' | 'equipped'
  sourceIndex?: number
  sourceSlot?: string
  size?: number
}

const EnhancedDraggableItem = ({ 
  item, 
  sourceType, 
  sourceIndex, 
  sourceSlot, 
  size = 64 
}: EnhancedDraggableItemProps) => {
  const draggableId = `${item.id}-${sourceType}`
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: draggableId,
    data: {
      type: `${sourceType}-item`,
      item,
      sourceType,
      sourceIndex,
      sourceSlot,
    }
  })


  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <RpgItemSlot
        item={item}
        slotType={item.slotType || 'skill'}
        size={size}
        showTooltip={!isDragging}
      />
    </div>
  )
}

export default EnhancedDraggableItem