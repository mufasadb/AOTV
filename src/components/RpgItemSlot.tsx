import { Box, Typography } from '@mui/material'
import { getRpgBackground, getRpgRarityFrame, getRpgFrame } from '../utils/iconHelper'
import type { ReactNode } from 'react'
import { transitions, glow } from '../theme/animations'

interface RpgItemSlotProps {
  item?: {
    name: string
    icon: string
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  }
  slotType?: 'chest' | 'head' | 'boots' | 'gloves' | 'pants' | 'shoulder' | 'melee' | 'shield' | 'ring' | 'neck' | 'skill' | 'potion' | 'deconstruct'
  size?: number
  onClick?: () => void
  showTooltip?: boolean
  isEmpty?: boolean
  children?: ReactNode
  onDrop?: (item: any) => void
  alt?: string
  sx?: any
}

const RpgItemSlot = ({ 
  item, 
  slotType = 'skill',
  size = 64,
  onClick,
  showTooltip = true,
  isEmpty = false,
  children,
  onDrop,
  alt,
  sx
}: RpgItemSlotProps) => {
  const rarity = item?.rarity || 'common'
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        transition: transitions.standard,
        '&:hover': onClick ? {
          transform: 'scale(1.08) translateY(-2px)',
          filter: 'brightness(1.3)',
          '& .item-tooltip': {
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)',
          },
          '& .item-frame': {
            animation: item?.rarity === 'legendary' ? `${glow} 2s ease-in-out infinite` : 'none',
          }
        } : {
          '& .item-tooltip': {
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)',
          }
        },
        '&:active': onClick ? {
          transform: 'scale(1.02)',
        } : {},
        ...sx
      }}
      onClick={onClick}
      onDrop={onDrop ? (e) => {
        e.preventDefault()
        if (onDrop) onDrop(e)
      } : undefined}
      onDragOver={onDrop ? (e) => e.preventDefault() : undefined}
    >
      {/* Slot background */}
      <Box
        component="img"
        src={getRpgBackground(slotType)}
        alt={alt || `${slotType} slot`}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isEmpty ? 0.5 : 0.8,
        }}
      />
      
      {/* Item frame based on rarity - only show if item exists */}
      {item && (
        <Box
          component="img"
          src={getRpgRarityFrame(rarity, 'round')}
          alt={`${rarity} frame`}
          className="item-frame"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            transition: transitions.standard,
          }}
        />
      )}
      
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
            bottom: '-35px',
            left: '50%',
            transform: 'translateX(-50%) translateY(5px)',
            background: 'rgba(0,0,0,0.95)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: transitions.standard,
            zIndex: 10,
            pointerEvents: 'none',
            border: `1px solid ${getRarityColor(rarity)}`,
            boxShadow: `0 0 10px ${getRarityColor(rarity)}40`,
          }}
          className="item-tooltip"
        >
          <Typography variant="caption" sx={{ color: getRarityColor(rarity), fontWeight: 'bold' }}>
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