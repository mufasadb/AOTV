import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { InventoryItem } from '../stores/InventoryStore'
import RpgItemSlot from './RpgItemSlot'

interface DraggableItemSlotProps {
  item: InventoryItem
  index: number
}

const DraggableItemSlot = ({ item, index }: DraggableItemSlotProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: {
      type: 'inventory-slot',
      item,
      index,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
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
        size={64}
        showTooltip={true}
      />
    </div>
  )
}

export default DraggableItemSlot