import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Tabs, 
  Tab,
  Avatar,
  Chip,
  Tooltip,
  Button,
  Fade
} from '@mui/material'
import { 
  Inventory, 
  Assessment, 
  Build, 
  VpnKey,
  Person
} from '@mui/icons-material'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { getProfessionIcon, getLootIcon } from '../utils/iconHelper'
import { playerStore } from '../stores/PlayerStore'
import { materialsStore } from '../stores/MaterialsStore'
import RpgButton from './RpgButton'
import EnhancedDragDrop from './EnhancedDragDrop'
import EnhancedInventory from './EnhancedInventory'
import CharacterDoll from './CharacterDoll'
import StashOverlay from './StashOverlay'
import CraftingBenchOverlay from './CraftingBenchOverlay'
import DeconstructionOverlay from './DeconstructionOverlay'
import { transitions } from '../theme/animations'

interface TownViewProps {
  onNavigateToCombat: () => void
}


const TownView = observer(({ onNavigateToCombat }: TownViewProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const [stashOpen, setStashOpen] = useState(false)
  const [craftingOpen, setCraftingOpen] = useState(false)
  const [deconstructOpen, setDeconstructOpen] = useState(false)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Items
        return (
          <Fade in={true} timeout={600}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, maxWidth: 350 }}>
                <CharacterDoll />
              </Box>
              <Box sx={{ flex: 1 }}>
                <EnhancedInventory />
              </Box>
            </Box>
          </Fade>
        )
      case 1: // Stats
        return (
          <Fade in={true} timeout={600}>
            <Box>
              <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Character Info</Typography>
              <Chip 
                avatar={<Person />} 
                label={`${playerStore.playerInfo.name} (Level ${playerStore.playerInfo.level})`} 
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>Vital Stats</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">Health: {playerStore.vitals.hp}/{playerStore.calculateTotalStat('maxHp')}</Typography>
              <Typography variant="body2">Mana: {playerStore.vitals.mp}/{playerStore.calculateTotalStat('maxMp')}</Typography>
              <Typography variant="body2" color="warning.main">Gold: {playerStore.playerInfo.gold}</Typography>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>Combat Stats</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Tooltip title="Physical damage dealt to enemies" arrow>
                <Chip label={`Attack: ${playerStore.calculateTotalStat('attack')}`} size="small" sx={{ cursor: 'help' }} />
              </Tooltip>
              <Tooltip title="Reduces physical damage taken" arrow>
                <Chip label={`Armor: ${playerStore.calculateTotalStat('armor')}`} size="small" sx={{ cursor: 'help' }} />
              </Tooltip>
              <Tooltip title="Chance to completely avoid incoming damage" arrow>
                <Chip label={`Dodge: ${playerStore.calculateTotalStat('dodge')}%`} size="small" sx={{ cursor: 'help' }} />
              </Tooltip>
              <Tooltip title="Chance to block physical attacks (shields only)" arrow>
                <Chip label={`Block: ${playerStore.calculateTotalStat('block')}%`} size="small" sx={{ cursor: 'help' }} />
              </Tooltip>
              <Tooltip title="Affects attack frequency and movement" arrow>
                <Chip label={`Speed: ${playerStore.calculateTotalStat('speed')}`} size="small" sx={{ cursor: 'help' }} />
              </Tooltip>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Resistances</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Tooltip title="Reduces fire damage taken" arrow>
                <Chip label={`Fire: ${playerStore.calculateTotalStat('fireRes')}%`} size="small" sx={{ cursor: 'help', bgcolor: 'rgba(220, 38, 38, 0.1)' }} />
              </Tooltip>
              <Tooltip title="Reduces lightning damage taken" arrow>
                <Chip label={`Lightning: ${playerStore.calculateTotalStat('lightningRes')}%`} size="small" sx={{ cursor: 'help', bgcolor: 'rgba(59, 130, 246, 0.1)' }} />
              </Tooltip>
              <Tooltip title="Reduces ice damage taken" arrow>
                <Chip label={`Ice: ${playerStore.calculateTotalStat('iceRes')}%`} size="small" sx={{ cursor: 'help', bgcolor: 'rgba(14, 165, 233, 0.1)' }} />
              </Tooltip>
              <Tooltip title="Reduces dark/chaos damage taken" arrow>
                <Chip label={`Dark: ${playerStore.calculateTotalStat('darkRes')}%`} size="small" sx={{ cursor: 'help', bgcolor: 'rgba(139, 69, 19, 0.1)' }} />
              </Tooltip>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Critical Stats</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Tooltip title="Chance to deal critical damage" arrow>
                <Chip label={`Crit Chance: ${playerStore.calculateTotalStat('critChance')}%`} size="small" sx={{ cursor: 'help', bgcolor: 'rgba(234, 179, 8, 0.1)' }} />
              </Tooltip>
              <Tooltip title="Multiplier for critical hit damage" arrow>
                <Chip label={`Crit Multi: ${playerStore.calculateTotalStat('critMultiplier').toFixed(1)}x`} size="small" sx={{ cursor: 'help', bgcolor: 'rgba(234, 179, 8, 0.1)' }} />
              </Tooltip>
            </Box>
            </Box>
          </Fade>
        )
      case 2: // Crafting Mats
        return (
          <Fade in={true} timeout={600}>
            <Box>
            <Typography variant="subtitle2" gutterBottom>
              Materials ({materialsStore.uniqueMaterialCount} types, {materialsStore.totalMaterialCount} total)
            </Typography>
            
            {materialsStore.allMaterials.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4, 
                color: 'text.secondary',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1
              }}>
                <Typography variant="body2">
                  No materials yet. Deconstruct magic or rare items to gather crafting materials.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                {materialsStore.allMaterials.map((stack) => (
                  <Box 
                    key={stack.material.id}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    {/* Material Icon */}
                    <Box
                      component="img"
                      src={stack.material.icon}
                      alt={stack.material.name}
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        objectFit: 'contain',
                        filter: stack.material.rarity === 'rare' ? 'hue-rotate(60deg)' : 'none'
                      }}
                    />
                    
                    {/* Material Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                        {stack.material.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        x{stack.quantity}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {stack.material.category}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Add some starter materials button for testing */}
            {materialsStore.allMaterials.length === 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    materialsStore.addMaterials({
                      'magic_dust': 5,
                      'iron_ore': 3,
                      'leather_scraps': 2
                    })
                  }}
                >
                  Add Starter Materials (Debug)
                </Button>
              </Box>
            )}
            </Box>
          </Fade>
        )
      case 3: // Keys
        return (
          <Fade in={true} timeout={600}>
            <Box>
            <Typography variant="subtitle2" gutterBottom>Dungeon Keys ({playerStore.playerInfo.keys})</Typography>
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
                  <RpgButton size="small">Use</RpgButton>
                </Box>
              ))}
            </Box>
            </Box>
          </Fade>
        )
      default:
        return null
    }
  }

  return (
    <EnhancedDragDrop>
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
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Stash */}
            <Card sx={{ 
              cursor: 'pointer', 
              transition: transitions.standard, 
              '&:hover': { 
                transform: 'translateY(-4px) scale(1.02)', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)' 
              } 
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getLootIcon(101)}
                  alt="stash"
                  sx={{ width: 48, height: 48, mb: 2, objectFit: 'contain' }}
                />
                <Typography variant="h6" gutterBottom>Stash</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Store and organize your valuable items and equipment
                </Typography>
                <RpgButton fullWidth onClick={() => setStashOpen(true)}>
                  Open Stash
                </RpgButton>
              </CardContent>
            </Card>

            {/* Crafting Bench */}
            <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getProfessionIcon('blacksmith', 27)}
                  alt="crafting"
                  sx={{ width: 48, height: 48, mb: 2, objectFit: 'contain' }}
                />
                <Typography variant="h6" gutterBottom>Crafting Bench</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Forge and enhance equipment with your materials
                </Typography>
                <RpgButton fullWidth onClick={() => setCraftingOpen(true)}>
                  Start Crafting
                </RpgButton>
              </CardContent>
            </Card>

            {/* Deconstruction */}
            <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getProfessionIcon('enchantment', 11)}
                  alt="deconstruction"
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    mb: 2, 
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto 16px auto'
                  }}
                />
                <Typography variant="h6" gutterBottom>Deconstruction</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Break down items for crafting materials
                </Typography>
                <RpgButton fullWidth onClick={() => setDeconstructOpen(true)}>
                  Deconstruct Items
                </RpgButton>
              </CardContent>
            </Card>

            {/* Dungeon Portal */}
            <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  component="img"
                  src={getLootIcon(54)}
                  alt="portal"
                  sx={{ width: 48, height: 48, mb: 2, objectFit: 'contain' }}
                />
                <Typography variant="h6" gutterBottom>Dungeon Portal</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter dangerous dungeons to find treasure and glory
                </Typography>
                <RpgButton fullWidth variant="danger" onClick={onNavigateToCombat}>
                  Enter Dungeon
                </RpgButton>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Player Panel */}
      <Box sx={{ width: '50%', borderLeft: '1px solid', borderColor: 'divider' }}>
        <Card sx={{ height: '100%', borderRadius: 0, border: 'none' }}>
          <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Player Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, backgroundColor: 'primary.main' }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{playerStore.playerInfo.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Level {playerStore.playerInfo.level}</Typography>
                  <Typography variant="caption" color="warning.main">💰 {playerStore.playerInfo.gold} Gold</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip icon={<VpnKey />} label={`${playerStore.playerInfo.keys} Keys`} size="small" />
                <Chip icon={<Build />} label={`${playerStore.playerInfo.craftingMats} Mats`} size="small" />
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

      {/* Stash Overlay */}
      <StashOverlay open={stashOpen} onClose={() => setStashOpen(false)} />
      
      {/* Crafting Bench Overlay */}
      <CraftingBenchOverlay open={craftingOpen} onClose={() => setCraftingOpen(false)} />
      
      {/* Deconstruction Overlay */}
      <DeconstructionOverlay open={deconstructOpen} onClose={() => setDeconstructOpen(false)} />
      </Box>
    </EnhancedDragDrop>
  )
})

export default TownView