import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

interface FloatingDamageProps {
  damage: number
  isCrit?: boolean
  isDodged?: boolean
  isBlocked?: boolean
  position: { x: string | number, y: string | number }
  onComplete: () => void
}

const FloatingDamage = ({ 
  damage, 
  isCrit, 
  isDodged, 
  isBlocked, 
  position, 
  onComplete 
}: FloatingDamageProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 300) // Wait for fade out
    }, 1200)

    return () => clearTimeout(timer)
  }, [onComplete])

  const getText = () => {
    if (isDodged) return 'DODGED'
    if (isBlocked) return 'BLOCKED'
    return damage.toString()
  }

  const getColor = () => {
    if (isDodged) return '#4CAF50' // Green
    if (isBlocked) return '#2196F3' // Blue
    if (isCrit) return '#FF5722' // Orange-red
    return '#F44336' // Red
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transition: 'all 1.2s ease-out',
        animation: 'floatUp 1.2s ease-out forwards',
        '@keyframes floatUp': {
          '0%': {
            transform: 'translate(-50%, -50%) scale(0.8)',
            opacity: 1,
          },
          '20%': {
            transform: 'translate(-50%, -60%) scale(1.2)',
            opacity: 1,
          },
          '100%': {
            transform: 'translate(-50%, -80%) scale(1)',
            opacity: 0,
          },
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: getColor(),
          fontWeight: 'bold',
          fontSize: isCrit ? '1.5rem' : '1.2rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          WebkitTextStroke: '1px rgba(0,0,0,0.5)',
        }}
      >
        {getText()}
        {isCrit && '!'}
      </Typography>
    </Box>
  )
}

export default FloatingDamage