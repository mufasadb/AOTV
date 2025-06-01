import { observer } from 'mobx-react-lite'
import { Box, Typography } from '@mui/material'
import { useDroppable } from '@dnd-kit/core'
import { inventoryStore } from '../stores/InventoryStore'
import RpgItemSlot from './RpgItemSlot'

interface EquipmentSlotProps {
  slotType: string
  label: string
  position: { gridColumn: string; gridRow: string }
}

const EquipmentSlot = observer(({ slotType, label, position }: EquipmentSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `equipment-${slotType}`,
    data: {
      type: 'equipment-slot',
      slotType: slotType,
    },
  })

  const equippedItem = inventoryStore.equipped[slotType]

  return (
    <Box
      ref={setNodeRef}
      sx={{
        gridColumn: position.gridColumn,
        gridRow: position.gridRow,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        p: 1,
        border: isOver ? '2px solid #4ade80' : '2px dashed rgba(139, 69, 19, 0.5)',
        borderRadius: 2,
        background: isOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(139, 69, 19, 0.05)',
        transition: 'all 0.2s ease',
      }}
    >
      {equippedItem ? (
        <RpgItemSlot
          item={equippedItem}
          slotType={slotType as any}
          size={64}
          showTooltip={true}
        />
      ) : (
        <RpgItemSlot
          slotType={slotType as any}
          size={64}
          isEmpty={true}
        />
      )}
      <Typography variant="caption" sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
        {label}
      </Typography>
    </Box>
  )
})

const CharacterDoll = observer(() => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'character-doll',
    data: {
      type: 'equipment-area',
    },
  })

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ textAlign: 'center' }}>
        Character Equipment
      </Typography>
      
      <Box
        ref={setNodeRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: 1,
          width: '100%',
          maxWidth: 400,
          aspectRatio: '5/4',
          p: 2,
          border: isOver ? '2px solid #4ade80' : '2px solid rgba(139, 69, 19, 0.3)',
          borderRadius: 3,
          background: isOver ? 'rgba(74, 222, 128, 0.05)' : 'rgba(139, 69, 19, 0.02)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Head slot - top center */}
        <EquipmentSlot
          slotType="head"
          label="Head"
          position={{ gridColumn: '3', gridRow: '1' }}
        />

        {/* Shoulder slots - top left and right */}
        <EquipmentSlot
          slotType="shoulder"
          label="Shoulders"
          position={{ gridColumn: '2', gridRow: '2' }}
        />

        {/* Main hand weapon - left side */}
        <EquipmentSlot
          slotType="melee"
          label="Weapon"
          position={{ gridColumn: '1', gridRow: '2' }}
        />

        {/* Chest - center */}
        <EquipmentSlot
          slotType="chest"
          label="Chest"
          position={{ gridColumn: '3', gridRow: '2' }}
        />

        {/* Off-hand/Shield - right side */}
        <EquipmentSlot
          slotType="shield"
          label="Shield"
          position={{ gridColumn: '5', gridRow: '2' }}
        />

        {/* Gloves - left and right of chest */}
        <EquipmentSlot
          slotType="gloves"
          label="Gloves"
          position={{ gridColumn: '4', gridRow: '2' }}
        />

        {/* Pants - below chest */}
        <EquipmentSlot
          slotType="pants"
          label="Pants"
          position={{ gridColumn: '3', gridRow: '3' }}
        />

        {/* Boots - bottom center */}
        <EquipmentSlot
          slotType="boots"
          label="Boots"
          position={{ gridColumn: '3', gridRow: '4' }}
        />
      </Box>

      {/* Character stats summary */}
      <Box sx={{ mt: 2, p: 1, background: 'rgba(139, 69, 19, 0.05)', borderRadius: 1 }}>
        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Equipment Stats:
        </Typography>
        <Typography variant="caption" display="block">
          Attack: {calculateTotalStat('attack')}
        </Typography>
        <Typography variant="caption" display="block">
          Armor: {calculateTotalStat('armor')}
        </Typography>
        <Typography variant="caption" display="block">
          Dodge: {calculateTotalStat('dodge')}
        </Typography>
      </Box>
    </Box>
  )
})

// Helper function to calculate total stats from equipped items
const calculateTotalStat = (statName: string): number => {
  let total = 0
  Object.values(inventoryStore.equipped).forEach(item => {
    if (item && item.stats && item.stats[statName]) {
      total += item.stats[statName]
    }
  })
  return total
}

export default CharacterDoll