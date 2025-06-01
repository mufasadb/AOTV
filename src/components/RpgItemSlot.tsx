import { Box, Typography } from '@mui/material'
import { getRpgBackground, getRpgRarityFrame, getRpgFrame } from '../utils/iconHelper'
import type { ReactNode } from 'react'

interface RpgItemSlotProps {
  item?: {
    name: string
    icon: string
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  }
  slotType?: 'chest' | 'head' | 'boots' | 'gloves' | 'pants' | 'shoulder' | 'melee' | 'shield' | 'ring' | 'neck' | 'skill' | 'potion'
  size?: number
  onClick?: () => void
  showTooltip?: boolean
  isEmpty?: boolean
  children?: ReactNode
}

const RpgItemSlot = ({ 
  item, 
  slotType = 'skill',
  size = 64,
  onClick,
  showTooltip = true,
  isEmpty = false,
  children
}: RpgItemSlotProps) => {
  const rarity = item?.rarity || 'common'
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
          filter: 'brightness(1.2)',
          '& .item-tooltip': {
            opacity: 1,
          }
        } : {
          '& .item-tooltip': {
            opacity: 1,
          }
        },
      }}
      onClick={onClick}
    >
      {/* Slot background */}
      <Box
        component="img"
        src={getRpgBackground(slotType)}
        alt={`${slotType} slot`}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isEmpty ? 0.5 : 0.8,
        }}
      />
      
      {/* Item frame based on rarity */}
      <Box
        component="img"
        src={getRpgRarityFrame(rarity, 'round')}
        alt={`${rarity} frame`}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 2,
        }}
      />
      
      {/* Item icon */}
      {item && (
        <Box
          component="img"
          src={item.icon}
          alt={item.name}
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '80%',
            objectFit: 'contain',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Empty slot indicator */}
      {isEmpty && !item && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Box
            component="img"
            src={getRpgFrame('inventory_frame_little.png')}
            alt="empty slot"
            sx={{
              width: '90%',
              height: '90%',
              objectFit: 'cover',
              opacity: 0.6,
            }}
          />
        </Box>
      )}
      
      {/* Custom children content */}
      {children && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
          }}
        >
          {children}
        </Box>
      )}
      
      {/* Tooltip on hover */}
      {showTooltip && item && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            zIndex: 10,
            pointerEvents: 'none',
            border: `1px solid ${getRarityColor(rarity)}`,
          }}
          className="item-tooltip"
        >
          <Typography variant="caption" sx={{ color: getRarityColor(rarity) }}>
            {item.name}
          </Typography>
        </Box>
      )}
      
    </Box>
  )
}

// Helper function to get rarity colors
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'uncommon': return '#1eff00'
    case 'rare': return '#0070dd'
    case 'epic': return '#a335ee'
    case 'legendary': return '#ff8000'
    default: return '#9d9d9d'
  }
}

export default RpgItemSlot