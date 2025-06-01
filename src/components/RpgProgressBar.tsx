import { Box } from '@mui/material'
import { getRpgFrame } from '../utils/iconHelper'

interface RpgProgressBarProps {
  value: number
  maxValue: number
  type: 'health' | 'mana' | 'energy' | 'xp' | 'basic'
  width?: number
  height?: number
  showText?: boolean
}

const RpgProgressBar = ({ 
  value, 
  maxValue, 
  type, 
  width = 200, 
  height = 20,
  showText = false 
}: RpgProgressBarProps) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100))
  
  // Map bar types to appropriate RPG bar images
  const getBarImage = (barType: string) => {
    switch (barType) {
      case 'health': return getRpgFrame('Hp_line.png')
      case 'mana': return getRpgFrame('Mana_line.png')
      case 'energy': return getRpgFrame('energy_line.png')
      case 'xp': return getRpgFrame('xp_line.png')
      default: return getRpgFrame('basic_bar.png')
    }
  }

  // Get appropriate colors for different bar types
  const getBarColor = (barType: string) => {
    switch (barType) {
      case 'health': return '#dc2626' // Red
      case 'mana': return '#2563eb' // Blue  
      case 'energy': return '#f59e0b' // Amber
      case 'xp': return '#16a34a' // Green
      default: return '#6b7280' // Gray
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: width,
        height: height,
        border: '2px solid rgba(139, 69, 19, 0.8)',
        borderRadius: '4px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${getRpgFrame('pattern.png')})`,
          backgroundSize: 'cover',
          opacity: 0.1,
        }}
      />
      
      {/* Progress fill */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${percentage}%`,
          background: `linear-gradient(to bottom, 
            ${getBarColor(type)}, 
            rgba(0,0,0,0.3) 50%, 
            ${getBarColor(type)}
          )`,
          backgroundImage: `url(${getBarImage(type)})`,
          backgroundSize: 'cover',
          backgroundBlendMode: 'multiply',
          transition: 'width 0.3s ease-in-out',
        }}
      />
      
      {/* Highlight effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Text overlay */}
      {showText && (
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
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          }}
        >
          {value}/{maxValue}
        </Box>
      )}
    </Box>
  )
}

export default RpgProgressBar