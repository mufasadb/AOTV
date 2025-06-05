import { Box, Typography } from '@mui/material'
import { getRpgFrame } from '../utils/iconHelper'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { transitions } from '../theme/animations'

interface RpgButtonProps {
  children: ReactNode
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  fullWidth?: boolean
  startIcon?: ReactNode
}

const RpgButton = ({ 
  children, 
  onClick, 
  size = 'medium',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  startIcon
}: RpgButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Get button images based on size
  const getButtonImages = (buttonSize: string) => {
    switch (buttonSize) {
      case 'small': return {
        normal: getRpgFrame('mini_button.png'),
        width: 80,
        height: 32
      }
      case 'large': return {
        normal: getRpgFrame('long_button.png'),
        pressed: getRpgFrame('long_button_on.png'),
        disabled: getRpgFrame('long_button_off.png'),
        width: 200,
        height: 48
      }
      default: return {
        normal: getRpgFrame('mid_button.png'),
        pressed: getRpgFrame('mid_button_on.png'),
        disabled: getRpgFrame('mid_button_off.png'),
        width: 140,
        height: 40
      }
    }
  }

  const buttonConfig = getButtonImages(size)
  
  // Get current button state image
  const getCurrentImage = () => {
    if (disabled && buttonConfig.disabled) return buttonConfig.disabled
    if (isPressed && buttonConfig.pressed) return buttonConfig.pressed
    return buttonConfig.normal
  }

  // Get text color based on variant and state
  const getTextColor = () => {
    if (disabled) return '#666'
    
    switch (variant) {
      case 'danger': return '#ff6b6b'
      case 'secondary': return '#d4af37'
      default: return '#f4f1de'
    }
  }

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    if (!disabled && onClick) onClick()
  }

  const handleMouseLeave = () => {
    setIsPressed(false)
    setIsHovered(false)
  }

  return (
    <Box
      component="button"
      role="button"
      disabled={disabled}
      sx={{
        position: 'relative',
        width: fullWidth ? '100%' : buttonConfig.width,
        height: buttonConfig.height,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transform: isPressed ? 'translateY(2px) scale(0.98)' : isHovered && !disabled ? 'translateY(-1px) scale(1.02)' : 'none',
        transition: transitions.fast,
        filter: isHovered && !disabled ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'none',
        border: 'none',
        background: 'transparent',
        padding: 0,
        '&:active': {
          transform: 'translateY(2px) scale(0.98)',
        },
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => !disabled && setIsHovered(true)}
    >
      {/* Button background image */}
      <Box
        component="img"
        src={getCurrentImage()}
        alt="button"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'stretch',
          pointerEvents: 'none',
        }}
      />
      
      {/* Button content */}
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
          gap: 1,
          paddingTop: isPressed ? '2px' : '0px',
        }}
      >
        {startIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {startIcon}
          </Box>
        )}
        <Typography
          sx={{
            color: getTextColor(),
            fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            fontFamily: 'Cinzel, serif',
          }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  )
}

export default RpgButton