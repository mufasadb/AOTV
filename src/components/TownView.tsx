import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Tabs, 
  Tab,
  Avatar,
  Chip
} from '@mui/material'
import { 
  Inventory, 
  Assessment, 
  Build, 
  VpnKey,
  Store,
  Explore,
  Person
} from '@mui/icons-material'
import { useState } from 'react'
import { getProfessionIcon, getWeaponIcon, getArmorIcon, getLootIcon } from '../utils/iconHelper'

const mockPlayerData = {
  name: 'Adventurer',
  level: 12,
  hp: 85,
  maxHp: 100,
  mp: 25,
  maxMp: 50,
  gold: 2450,
  keys: 3,
  craftingMats: 18,
}

const TownView = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Items
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Equipment Slots</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
              {['Weapon', 'Shield', 'Helmet', 'Chest', 'Gloves', 'Boots'].map((slot) => (
                <Box 
                  key={slot}
                  sx={{
                    aspectRatio: '1',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">{slot}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {slot === 'Weapon' ? 'Iron Sword' : slot === 'Shield' ? 'Wood Shield' : 'Empty'}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>Backpack</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
              {Array.from({ length: 18 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    aspectRatio: '1',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    color: 'text.disabled',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    }
                  }}
                >
                  {index < 3 ? '🗡️' : ''}
                </Box>
              ))}
            </Box>
          </Box>
        )
      case 1: // Stats
        return (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Character Info</Typography>
              <Chip 
                avatar={<Person />} 
                label={`${mockPlayerData.name} (Level ${mockPlayerData.level})`} 
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>Vital Stats</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">Health: {mockPlayerData.hp}/{mockPlayerData.maxHp}</Typography>
              <Typography variant="body2">Mana: {mockPlayerData.mp}/{mockPlayerData.maxMp}</Typography>
              <Typography variant="body2" color="warning.main">Gold: {mockPlayerData.gold}</Typography>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>Combat Stats</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Attack: 15-22" size="small" />
              <Chip label="Armor: 12" size="small" />
              <Chip label="Dodge: 8%" size="small" />
              <Chip label="Crit: 15%" size="small" />
            </Box>
          </Box>
        )
      case 2: // Crafting Mats
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Materials ({mockPlayerData.craftingMats})</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {['Iron Ore', 'Leather', 'Magic Dust', 'Gems'].map((material) => (
                <Box 
                  key={material}
                  sx={{ 
                    textAlign: 'center', 
                    p: 1, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1 
                  }}
                >
                  <Typography variant="caption" display="block">{material}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.floor(Math.random() * 20) + 1}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )
      case 3: // Keys
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Dungeon Keys ({mockPlayerData.keys})</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Forest Crypt Key', 'Volcanic Cave Key', 'Ice Temple Key'].map((key, index) => (
                <Box 
                  key={key}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'primary.main', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    }
                  }}
                >
                  <VpnKey color="warning" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{key}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tier {index + 1} • {['Easy', 'Medium', 'Hard'][index]} difficulty
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined">Use</Button>
                </Box>
              ))}
            </Box>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Main Town Area */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Town Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 40%, rgba(139, 69, 19, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(205, 133, 63, 0.1) 0%, transparent 50%),
              linear-gradient(to bottom, #2d1b0e 0%, #1a0d00 100%)
            `,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 15% 25%, rgba(255,255,255,0.05) 2px, transparent 2px),
                radial-gradient(circle at 85% 75%, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
            },
          }}
        />

        {/* Town Buildings/Areas */}
        <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
            Adventurer's Haven
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, maxWidth: 1000, mx: 'auto' }}>
            {/* Stash */}
            <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getLootIcon(25)}
                  alt="stash"
                  sx={{ width: 48, height: 48, mb: 2, objectFit: 'contain' }}
                />
                <Typography variant="h6" gutterBottom>Stash</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Store and organize your valuable items and equipment
                </Typography>
                <Button variant="contained" fullWidth>
                  Open Stash
                </Button>
              </CardContent>
            </Card>

            {/* Crafting Bench */}
            <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getProfessionIcon('blacksmith', 15)}
                  alt="crafting"
                  sx={{ width: 48, height: 48, mb: 2, objectFit: 'contain' }}
                />
                <Typography variant="h6" gutterBottom>Crafting Bench</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Forge and enhance equipment with your materials
                </Typography>
                <Button variant="contained" fullWidth>
                  Start Crafting
                </Button>
              </CardContent>
            </Card>

            {/* Dungeon Portal */}
            <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getLootIcon(67)}
                  alt="portal"
                  sx={{ width: 48, height: 48, mb: 2, objectFit: 'contain' }}
                />
                <Typography variant="h6" gutterBottom>Dungeon Portal</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter dangerous dungeons to find treasure and glory
                </Typography>
                <Button variant="contained" fullWidth color="error">
                  Enter Dungeon
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Player Panel */}
      <Box sx={{ width: 400, borderLeft: '1px solid', borderColor: 'divider' }}>
        <Card sx={{ height: '100%', borderRadius: 0, border: 'none' }}>
          <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Player Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, backgroundColor: 'primary.main' }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{mockPlayerData.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Level {mockPlayerData.level}</Typography>
                  <Typography variant="caption" color="warning.main">💰 {mockPlayerData.gold} Gold</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip icon={<VpnKey />} label={`${mockPlayerData.keys} Keys`} size="small" />
                <Chip icon={<Build />} label={`${mockPlayerData.craftingMats} Mats`} size="small" />
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<Inventory />} label="Items" />
                <Tab icon={<Assessment />} label="Stats" />
                <Tab icon={<Build />} label="Materials" />
                <Tab icon={<VpnKey />} label="Keys" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              {renderTabContent()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default TownView