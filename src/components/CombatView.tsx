import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
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
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { getWeaponIcon, getArmorIcon, getMedievalIcon } from '../utils/iconHelper'
import { combatStore, type CombatStats } from '../stores/CombatStore'
import RpgProgressBar from './RpgProgressBar'
import RpgButton from './RpgButton'
import RpgItemSlot from './RpgItemSlot'
import FloatingDamage from './FloatingDamage'

// Mock player equipment for display
const mockPlayerEquipment = {
  weapon: 'Iron Sword',
  shield: 'Wooden Shield',
  helmet: 'Leather Cap',
  chest: 'Chain Mail',
}

interface CombatViewProps {
  onNavigateToTown: () => void
}

const EnemySlot = ({ 
  enemy, 
  position, 
  isSelected, 
  onSelect,
  animationState 
}: { 
  enemy?: { id: string | number, name: string, hp: number, maxHp: number, position: string, intent: string }, 
  position: { x: number, y: number },
  isSelected: boolean,
  onSelect: () => void,
  animationState: 'idle' | 'hit' | 'attacking' | 'returning'
}) => {
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

  const getAnimationTransform = () => {
    const baseTransform = 'translate(-50%, -50%)'
    switch (animationState) {
      case 'hit':
        return `${baseTransform} translateY(-15px)` // Bounce backward (up/away from player)
      case 'attacking':
        return `${baseTransform} translateY(10px)` // Jut forward (down/towards player)
      default:
        return baseTransform
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: getAnimationTransform(),
        cursor: enemy ? 'pointer' : 'default',
        transition: 'all 0.3s ease-out',
        '&:hover': enemy ? {
          filter: 'brightness(1.2)',
        } : {},
      }}
      onClick={enemy ? onSelect : undefined}
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
              borderColor: isSelected ? 'warning.main' : 'primary.main',
              boxShadow: isSelected 
                ? '0 0 20px rgba(255, 193, 7, 0.8), 0 4px 12px rgba(0,0,0,0.4)'
                : '0 4px 12px rgba(0,0,0,0.4)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              outline: isSelected ? '2px solid' : 'none',
              outlineColor: 'warning.main',
              outlineOffset: '2px',
            }}
          >
            {!getEnemyImage(enemy.name) && enemy.name.split(' ').map((word: string) => word[0]).join('')}
          </Avatar>
          
          {/* HP Bar */}
          <Box sx={{ mt: 1, minWidth: 80 }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              {enemy.name}
            </Typography>
            <RpgProgressBar
              value={enemy.hp}
              maxValue={enemy.maxHp}
              type="health"
              width={80}
              height={8}
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

const CombatView = observer(({ onNavigateToTown }: CombatViewProps) => {
  // Initialize combat if not already started
  useEffect(() => {
    if (!combatStore.isInCombat) {
      // Mock player stats
      const playerStats: CombatStats = {
        hp: 85,
        maxHp: 100,
        mp: 25,
        maxMp: 50,
        es: 15,
        maxEs: 20,
        armor: 12,
        fireRes: 10,
        lightningRes: 5,
        iceRes: 8,
        darkRes: 15,
        dodge: 8,
        block: 15,
        critChance: 15,
        critMultiplier: 1.5,
        damage: 18,
        damageType: 'physical'
      }

      // Mock enemy data with proper stats
      const enemyData = [
        {
          name: 'Goblin Warrior',
          stats: {
            hp: 45, maxHp: 60, mp: 10, maxMp: 10, es: 0, maxEs: 0,
            armor: 5, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 5,
            dodge: 12, block: 0, critChance: 8, critMultiplier: 1.3,
            damage: 12, damageType: 'physical' as const
          }
        },
        {
          name: 'Orc Berserker',
          stats: {
            hp: 80, maxHp: 120, mp: 5, maxMp: 5, es: 0, maxEs: 0,
            armor: 8, fireRes: 5, lightningRes: 0, iceRes: 0, darkRes: 0,
            dodge: 4, block: 0, critChance: 12, critMultiplier: 1.6,
            damage: 22, damageType: 'physical' as const
          }
        },
        {
          name: 'Dark Mage',
          stats: {
            hp: 30, maxHp: 40, mp: 40, maxMp: 50, es: 20, maxEs: 25,
            armor: 2, fireRes: 10, lightningRes: 15, iceRes: 5, darkRes: 25,
            dodge: 15, block: 0, critChance: 10, critMultiplier: 1.4,
            damage: 16, damageType: 'dark' as const
          }
        }
      ]

      combatStore.startCombat(playerStats, enemyData)
    }
  }, [])

  // Handle combat end states
  useEffect(() => {
    if (combatStore.turnPhase === 'victory') {
      // Show reward modal after a delay
      setTimeout(() => {
        const result = combatStore.nextFight()
        if (result === 'dungeon_complete') {
          onNavigateToTown()
        }
      }, 2000)
    } else if (combatStore.turnPhase === 'defeat') {
      // Apply death penalty and return to town
      setTimeout(() => {
        combatStore.applyDeathPenalty()
        combatStore.endCombat()
        onNavigateToTown()
      }, 2000)
    }
  }, [combatStore.turnPhase, onNavigateToTown])
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
            // Map combat store enemies to positions
            const enemy = combatStore.enemies[index]
            
            return (
              <EnemySlot
                key={index}
                enemy={enemy ? {
                  id: enemy.id,
                  name: enemy.name,
                  hp: enemy.stats.hp,
                  maxHp: enemy.stats.maxHp,
                  position: 'back',
                  intent: enemy.intent || 'attack'
                } : undefined}
                position={position}
                isSelected={enemy ? combatStore.selectedTargetId === enemy.id : false}
                onSelect={() => enemy && combatStore.selectTarget(enemy.id)}
                animationState={enemy ? combatStore.enemyAnimations[enemy.id] || 'idle' : 'idle'}
              />
            )
          })}
          
          {/* Floating Damage Numbers */}
          {combatStore.floatingDamages.map((damage) => (
            <FloatingDamage
              key={damage.id}
              damage={damage.damage}
              isCrit={damage.isCrit}
              isDodged={damage.isDodged}
              isBlocked={damage.isBlocked}
              position={{
                x: `${damage.position.x}%`,
                y: `${damage.position.y}%`
              }}
              onComplete={() => combatStore.removeFloatingDamage(damage.id)}
            />
          ))}
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
            <RpgButton 
              size="large"
              variant="primary"
              startIcon={<Attack />}
              disabled={combatStore.turnPhase !== 'player' || !combatStore.selectedTargetId || combatStore.isProcessingTurn}
              onClick={() => combatStore.playerAttack()}
            >
              Attack
            </RpgButton>
            <RpgButton 
              size="large"
              variant="secondary"
              startIcon={<Shield />}
              disabled={combatStore.turnPhase !== 'player' || combatStore.isProcessingTurn}
              onClick={() => combatStore.playerBlock()}
            >
              Block
            </RpgButton>
            <RpgButton 
              size="large"
              variant="secondary"
              disabled
            >
              Abilities
            </RpgButton>
          </Box>
          
          {/* Turn indicator and combat feedback */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {combatStore.turnPhase === 'player' ? '🗡️ Your Turn' : 
               combatStore.turnPhase === 'enemy' ? '⚔️ Enemy Turn' :
               combatStore.turnPhase === 'victory' ? '🎉 Victory!' :
               combatStore.turnPhase === 'defeat' ? '💀 Defeat' : ''}
            </Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
              Fight {combatStore.currentFight} of {combatStore.totalFights}
            </Typography>
          </Box>
          
          <Typography variant="caption" display="block" sx={{ textAlign: 'center', opacity: 0.7 }}>
            Click an enemy to target • {combatStore.selectedTargetId ? 'Target selected' : 'No target'}
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
                  <Typography variant="caption">
                    {combatStore.player?.stats.hp || 0}/{combatStore.player?.stats.maxHp || 0}
                  </Typography>
                </Box>
                <RpgProgressBar
                  value={combatStore.player?.stats.hp || 0}
                  maxValue={combatStore.player?.stats.maxHp || 1}
                  type="health"
                  width={280}
                  height={12}
                />
              </Box>

              {/* Mana */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Psychology sx={{ fontSize: 16, color: 'info.main' }} />
                  <Typography variant="body2" fontWeight="bold">Mana</Typography>
                  <Typography variant="caption">
                    {combatStore.player?.stats.mp || 0}/{combatStore.player?.stats.maxMp || 0}
                  </Typography>
                </Box>
                <RpgProgressBar
                  value={combatStore.player?.stats.mp || 0}
                  maxValue={combatStore.player?.stats.maxMp || 1}
                  type="mana"
                  width={280}
                  height={12}
                />
              </Box>

              {/* Energy Shield */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LocalFireDepartment sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" fontWeight="bold">Energy Shield</Typography>
                  <Typography variant="caption">
                    {combatStore.player?.stats.es || 0}/{combatStore.player?.stats.maxEs || 0}
                  </Typography>
                </Box>
                <RpgProgressBar
                  value={combatStore.player?.stats.es || 0}
                  maxValue={combatStore.player?.stats.maxEs || 1}
                  type="energy"
                  width={280}
                  height={12}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Combat Stats */}
            <Typography variant="subtitle2" gutterBottom>Combat Stats</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip icon={<Shield />} label={`Armor: ${combatStore.player?.stats.armor || 0}`} size="small" />
              <Chip icon={<Visibility />} label={`Dodge: ${combatStore.player?.stats.dodge || 0}%`} size="small" />
              <Chip icon={<Attack />} label={`Damage: ${combatStore.player?.stats.damage || 0}`} size="small" />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Combat Log */}
            <Typography variant="subtitle2" gutterBottom>Combat Log</Typography>
            <Box sx={{ 
              height: 120, 
              overflow: 'auto', 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 1,
              mb: 2,
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              {combatStore.combatLog.map((message, index) => (
                <Typography 
                  key={index} 
                  variant="caption" 
                  display="block" 
                  sx={{ 
                    mb: 0.5, 
                    fontSize: '0.7rem',
                    opacity: index === combatStore.combatLog.length - 1 ? 1 : 0.7
                  }}
                >
                  {message}
                </Typography>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Equipment */}
            <Typography variant="subtitle2" gutterBottom>Equipment</Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <RpgItemSlot
                    item={{
                      name: mockPlayerEquipment.weapon,
                      icon: getWeaponIcon('sword', 15),
                      rarity: 'uncommon'
                    }}
                    slotType="melee"
                    size={48}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>Weapon</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <RpgItemSlot
                    item={{
                      name: mockPlayerEquipment.shield,
                      icon: getWeaponIcon('shield', 25),
                      rarity: 'common'
                    }}
                    slotType="shield"
                    size={48}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>Shield</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <RpgItemSlot
                    item={{
                      name: mockPlayerEquipment.helmet,
                      icon: getArmorIcon('helmet', 12),
                      rarity: 'rare'
                    }}
                    slotType="head"
                    size={48}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>Helmet</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <RpgItemSlot
                    item={{
                      name: mockPlayerEquipment.chest,
                      icon: getArmorIcon('chest', 8),
                      rarity: 'uncommon'
                    }}
                    slotType="chest"
                    size={48}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>Chest</Typography>
                </Box>
              </Box>
            </Box>

          </CardContent>
        </Card>
      </Box>
    </Box>
  )
})

export default CombatView