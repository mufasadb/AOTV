import { 
  Box, 
  Typography,
  IconButton,
  Slider,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material'
import { Close, Settings, VolumeUp, VolumeOff, PlayArrow } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { soundManager, playSounds } from '../utils/soundHelper'
import RpgButton from './RpgButton'

interface SettingsOverlayProps {
  open: boolean
  onClose: () => void
}

const SettingsOverlay = observer(({ open, onClose }: SettingsOverlayProps) => {
  const [volume, setVolume] = useState(soundManager.getMasterVolume() * 100)
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled())

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const volumeValue = (newValue as number) / 100
    setVolume(newValue as number)
    soundManager.setMasterVolume(volumeValue)
  }

  const handleSoundToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked
    setSoundEnabled(enabled)
    soundManager.setEnabled(enabled)
  }

  const handleSoundTest = () => {
    // Play a sequence of test sounds
    playSounds.attack()
    setTimeout(() => playSounds.enemyHit(), 300)
    setTimeout(() => playSounds.itemPickup(), 600)
    setTimeout(() => playSounds.clothEquip(), 900)
  }

  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        maxHeight: '80vh',
        zIndex: 1300,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        backgroundImage: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(205, 133, 63, 0.05) 100%)'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(139, 69, 19, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main' }}>
            Game Settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>
      
      <Box sx={{ p: 3 }}>
        {/* Audio Settings Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontFamily: 'Cinzel, serif', 
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2
          }}>
            <VolumeUp sx={{ color: 'primary.main' }} />
            Audio Settings
          </Typography>
          
          {/* Sound Enable/Disable */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={handleSoundToggle}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {soundEnabled ? <VolumeUp /> : <VolumeOff />}
                  <Typography variant="body1">
                    Sound Effects {soundEnabled ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Volume Slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Volume: {Math.round(volume)}%
            </Typography>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              disabled={!soundEnabled}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' }
              ]}
              sx={{
                color: 'primary.main',
                '& .MuiSlider-track': {
                  backgroundColor: 'primary.main'
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(212, 175, 55, 0.16)'
                  }
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem'
                }
              }}
            />
          </Box>

          {/* Sound Test Button */}
          <Box sx={{ textAlign: 'center' }}>
            <RpgButton
              variant="primary"
              startIcon={<PlayArrow />}
              disabled={!soundEnabled}
              onClick={handleSoundTest}
            >
              Test Sounds
            </RpgButton>
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Plays a sequence of game sounds at current volume
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'primary.main', opacity: 0.3 }} />

        {/* Game Info Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontFamily: 'Cinzel, serif', 
            color: 'text.primary',
            mb: 2
          }}>
            Game Information
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(0, 0, 0, 0.1)', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Version:</strong> Alpha 0.1.0
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Game:</strong> Adventures of the Vale - Loot & Craft
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Build:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <RpgButton variant="secondary" onClick={onClose}>
            Close Settings
          </RpgButton>
        </Box>
      </Box>
    </Box>
  )
})

export default SettingsOverlay