import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  LinearProgress,
  Avatar,
  Chip,
  Divider
} from '@mui/material'
import { 
  Shield, 
  GpsFixed as Attack, 
  Favorite, 
  Psychology,
  LocalFireDepartment,
  Visibility
} from '@mui/icons-material'
import { getWeaponIcon, getArmorIcon, getMedievalIcon } from '../utils/iconHelper'

// Mock enemy data
const mockEnemies = [
  { id: 1, name: 'Goblin Warrior', hp: 45, maxHp: 60, position: 'back', intent: 'attack' },
  { id: 2, name: 'Orc Berserker', hp: 80, maxHp: 120, position: 'front', intent: 'block' },
  { id: 3, name: 'Dark Mage', hp: 30, maxHp: 40, position: 'back', intent: 'spell' },
]

// Mock player data  
const mockPlayer = {
  hp: 85,
  maxHp: 100,
  mp: 25,
  maxMp: 50,
  es: 15,
  maxEs: 20,
  armor: 12,
  dodge: 8,
  damage: '15-22',
  weapon: 'Iron Sword',
  shield: 'Wooden Shield',
  helmet: 'Leather Cap',
  chest: 'Chain Mail',
}

const EnemySlot = ({ enemy, position }: { enemy?: typeof mockEnemies[0], position: { x: number, y: number } }) => {
  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'attack': return <Attack sx={{ fontSize: 16, color: 'error.main' }} />
      case 'block': return <Shield sx={{ fontSize: 16, color: 'info.main' }} />
      case 'spell': return <Psychology sx={{ fontSize: 16, color: 'warning.main' }} />
      default: return null
    }
  }

  const getEnemyImage = (name?: string) => {
    if (!name) return null;
    
    // Map enemy names to appropriate medieval icons
    const enemyIconMap: { [key: string]: string } = {
      'Goblin Warrior': getMedievalIcon('goblin'),
      'Orc Berserker': getMedievalIcon('orc'), 
      'Dark Mage': getMedievalIcon('mage'),
    };
    
    return enemyIconMap[name] || getMedievalIcon('warrior');
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: enemy ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': enemy ? {
          transform: 'translate(-50%, -50%) scale(1.05)',
          filter: 'brightness(1.2)',
        } : {},
      }}
    >
      {enemy ? (
        <Box sx={{ textAlign: 'center' }}>
          {/* Intent Indicator */}
          <Box sx={{ mb: 1, height: 20 }}>
            {getIntentIcon(enemy.intent)}
          </Box>
          
          {/* Enemy Avatar */}
          <Avatar
            src={getEnemyImage(enemy.name) || undefined}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: getEnemyImage(enemy.name) ? 'transparent' : '#8B4513',
              border: '3px solid',
              borderColor: 'primary.main',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {!getEnemyImage(enemy.name) && enemy.name.split(' ').map(word => word[0]).join('')}
          </Avatar>
          
          {/* HP Bar */}
          <Box sx={{ mt: 1, minWidth: 80 }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              {enemy.name}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(enemy.hp / enemy.maxHp) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: enemy.hp > enemy.maxHp * 0.6 ? 'success.main' : 
                                  enemy.hp > enemy.maxHp * 0.3 ? 'warning.main' : 'error.main',
                }
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
              {enemy.hp}/{enemy.maxHp}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: 64,
            height: 64,
            border: '2px dashed',
            borderColor: 'rgba(255,255,255,0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            color: 'text.disabled',
          }}
        >
          Empty
        </Box>
      )}
    </Box>
  )
}

const CombatView = () => {
  // Enemy positions (from player perspective - enemies are across from us)
  const enemyPositions = [
    { x: 30, y: 25 }, // Back left
    { x: 50, y: 20 }, // Back center  
    { x: 70, y: 25 }, // Back right
    { x: 35, y: 45 }, // Front left
    { x: 65, y: 45 }, // Front right
  ]

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Main Combat Area */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Arena Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse at center bottom, rgba(139, 69, 19, 0.3) 0%, transparent 70%),
              linear-gradient(to bottom, #1a0d00 0%, #2d1b0e 100%)
            `,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
                radial-gradient(circle at 60% 70%, rgba(255,255,255,0.05) 1px, transparent 1px),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
            },
          }}
        />

        {/* Arena Floor Pattern */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '60%',
            border: '2px solid rgba(139, 69, 19, 0.6)',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139, 69, 19, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Enemy Area */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '50%',
          }}
        >
          {enemyPositions.map((position, index) => {
            // Assign enemies to specific positions
            let enemy;
            if (index === 0) enemy = mockEnemies.find(e => e.id === 1) // Goblin Warrior
            if (index === 1) enemy = mockEnemies.find(e => e.id === 3) // Dark Mage  
            if (index === 3) enemy = mockEnemies.find(e => e.id === 2) // Orc Berserker
            
            return (
              <EnemySlot
                key={index}
                enemy={enemy}
                position={position}
              />
            )
          })}
        </Box>

        {/* Player Action Bar */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            background: 'linear-gradient(to top, rgba(45, 27, 14, 0.95) 0%, transparent 100%)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<Attack />}
              disabled
              sx={{ px: 4 }}
            >
              Attack
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<Shield />}
              disabled
              sx={{ px: 4 }}
            >
              Block
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              disabled
              sx={{ px: 3 }}
            >
              Abilities
            </Button>
          </Box>
          <Typography variant="caption" display="block" sx={{ textAlign: 'center', opacity: 0.7 }}>
            Click an enemy to target • Turn-based combat system
          </Typography>
        </Box>
      </Box>

      {/* Player Stats & Inventory Sidebar */}
      <Box sx={{ width: 320, borderLeft: '1px solid', borderColor: 'divider' }}>
        <Card sx={{ height: '100%', borderRadius: 0, border: 'none' }}>
          <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            {/* Player Vitals */}
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Player Status
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {/* Health */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Favorite sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography variant="body2" fontWeight="bold">Health</Typography>
                  <Typography variant="caption">{mockPlayer.hp}/{mockPlayer.maxHp}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(mockPlayer.hp / mockPlayer.maxHp) * 100}
                  sx={{
                    height: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { backgroundColor: 'error.main' }
                  }}
                />
              </Box>

              {/* Mana */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Psychology sx={{ fontSize: 16, color: 'info.main' }} />
                  <Typography variant="body2" fontWeight="bold">Mana</Typography>
                  <Typography variant="caption">{mockPlayer.mp}/{mockPlayer.maxMp}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(mockPlayer.mp / mockPlayer.maxMp) * 100}
                  sx={{
                    height: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { backgroundColor: 'info.main' }
                  }}
                />
              </Box>

              {/* Energy Shield */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LocalFireDepartment sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" fontWeight="bold">Energy Shield</Typography>
                  <Typography variant="caption">{mockPlayer.es}/{mockPlayer.maxEs}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(mockPlayer.es / mockPlayer.maxEs) * 100}
                  sx={{
                    height: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { backgroundColor: 'warning.main' }
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Combat Stats */}
            <Typography variant="subtitle2" gutterBottom>Combat Stats</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip icon={<Shield />} label={`Armor: ${mockPlayer.armor}`} size="small" />
              <Chip icon={<Visibility />} label={`Dodge: ${mockPlayer.dodge}%`} size="small" />
              <Chip icon={<Attack />} label={`Damage: ${mockPlayer.damage}`} size="small" />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Equipment */}
            <Typography variant="subtitle2" gutterBottom>Equipment</Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box
                    component="img"
                    src={getWeaponIcon('sword', 15)}
                    alt="weapon"
                    sx={{ width: 32, height: 32, mb: 0.5, objectFit: 'contain' }}
                  />
                  <Typography variant="caption" display="block">Weapon</Typography>
                  <Typography variant="body2" fontWeight="bold" fontSize="0.7rem">{mockPlayer.weapon}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box
                    component="img"
                    src={getWeaponIcon('shield', 25)}
                    alt="shield"
                    sx={{ width: 32, height: 32, mb: 0.5, objectFit: 'contain' }}
                  />
                  <Typography variant="caption" display="block">Shield</Typography>
                  <Typography variant="body2" fontWeight="bold" fontSize="0.7rem">{mockPlayer.shield}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box
                    component="img"
                    src={getArmorIcon('helmet', 12)}
                    alt="helmet"
                    sx={{ width: 32, height: 32, mb: 0.5, objectFit: 'contain' }}
                  />
                  <Typography variant="caption" display="block">Helmet</Typography>
                  <Typography variant="body2" fontWeight="bold" fontSize="0.7rem">{mockPlayer.helmet}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box
                    component="img"
                    src={getArmorIcon('chest', 8)}
                    alt="chest"
                    sx={{ width: 32, height: 32, mb: 0.5, objectFit: 'contain' }}
                  />
                  <Typography variant="caption" display="block">Chest</Typography>
                  <Typography variant="body2" fontWeight="bold" fontSize="0.7rem">{mockPlayer.chest}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Quick Inventory */}
            <Typography variant="subtitle2" gutterBottom>Quick Items</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {[1, 2, 3, 4].map((slot) => (
                <Box
                  key={slot}
                  sx={{
                    aspectRatio: '1',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: 'text.disabled',
                  }}
                >
                  {slot}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default CombatView