import { observer } from 'mobx-react-lite'
import { Box, Typography, LinearProgress } from '@mui/material'
import { 
  Favorite, 
  Psychology, 
  LocalFireDepartment,
  GpsFixed as Attack 
} from '@mui/icons-material'
import { playerStore } from '../stores/PlayerStore'

const PlayerStatsBar = observer(() => {
  const totalAttack = playerStore.calculateTotalStat('attack')
  const maxHp = playerStore.calculateTotalStat('maxHp')
  const maxMp = playerStore.calculateTotalStat('maxMp')
  const maxEs = playerStore.calculateTotalStat('maxEs')

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'linear-gradient(to bottom, rgba(45, 27, 14, 0.95) 0%, rgba(26, 13, 0, 0.9) 100%)',
        borderBottom: '1px solid rgba(139, 69, 19, 0.5)',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        gap: 3,
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Health */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <Favorite sx={{ fontSize: 20, color: 'error.main' }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              HP
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {playerStore.vitals.hp}/{maxHp}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={playerStore.healthPercentage}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'rgba(139, 0, 0, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#dc2626',
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </Box>

      {/* Mana */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <Psychology sx={{ fontSize: 20, color: 'info.main' }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              MP
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {playerStore.vitals.mp}/{maxMp}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={playerStore.manaPercentage}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'rgba(0, 0, 139, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2563eb',
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </Box>

      {/* Energy Shield */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <LocalFireDepartment sx={{ fontSize: 20, color: 'warning.main' }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              ES
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {playerStore.vitals.es}/{maxEs}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={playerStore.energyShieldPercentage}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'rgba(139, 139, 0, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#eab308',
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </Box>

      {/* Attack Power */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        <Attack sx={{ fontSize: 20, color: 'warning.main' }} />
        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
            Attack
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
            {totalAttack}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
})

export default PlayerStatsBar