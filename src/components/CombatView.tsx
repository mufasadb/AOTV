import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  Tooltip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade
} from '@mui/material'
import { 
  Shield, 
  GpsFixed as Attack, 
  Psychology,
  Visibility,
  ExpandMore
} from '@mui/icons-material'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { getMedievalIcon } from '../utils/iconHelper'
import { combatStore } from '../stores/CombatStore'
import { playerStore } from '../stores/PlayerStore'
import RpgProgressBar from './RpgProgressBar'
import RpgButton from './RpgButton'
import FloatingDamage from './FloatingDamage'
import CharacterDoll from './CharacterDoll'
import EnhancedDragDrop from './EnhancedDragDrop'
import { transitions, shake, glow } from '../theme/animations'


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
  enemy?: import('../stores/CombatStore').CombatEntity, 
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

  const createEnemyTooltip = () => {
    if (!enemy) return null

    // Calculate middle damage value
    const baseDamage = enemy.stats.damage
    const critMultiplier = enemy.stats.critMultiplier || 1.0
    const averageDamage = Math.floor(baseDamage + (baseDamage * (critMultiplier - 1) * (enemy.stats.critChance / 100)))

    return (
      <Paper sx={{ p: 2, maxWidth: 280, bgcolor: 'rgba(0,0,0,0.9)' }}>
        <Typography variant="h6" sx={{ color: 'warning.main', mb: 1 }}>
          {enemy.name}
        </Typography>
        
        {/* Attack Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'error.main', mb: 0.5 }}>
            {(enemy.intent || 'Attack').charAt(0).toUpperCase() + (enemy.intent || 'attack').slice(1)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
            ~{averageDamage} {enemy.stats.damageType} damage
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {enemy.stats.critChance}% crit chance
          </Typography>
        </Box>

        {/* Combat Stats */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Combat Stats</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <Typography variant="caption">Armor: {enemy.stats.armor}</Typography>
            <Typography variant="caption">Dodge: {enemy.stats.dodge}%</Typography>
            <Typography variant="caption">Block: {enemy.stats.block}%</Typography>
            <Typography variant="caption">Crit: {enemy.stats.critChance}%</Typography>
          </Box>
        </Box>

        {/* Resistances */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Resistances</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#dc2626' }}>
              Fire: {enemy.stats.fireRes}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#2563eb' }}>
              Lightning: {enemy.stats.lightningRes}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#0891b2' }}>
              Ice: {enemy.stats.iceRes}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#7c2d12' }}>
              Dark: {enemy.stats.darkRes}%
            </Typography>
          </Box>
        </Box>

        {/* Health Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Health</Typography>
          <Typography variant="caption">
            {enemy.stats.hp}/{enemy.stats.maxHp} HP
          </Typography>
          {enemy.stats.es > 0 && (
            <Typography variant="caption" display="block">
              {enemy.stats.es}/{enemy.stats.maxEs} ES
            </Typography>
          )}
          {enemy.stats.mp > 0 && (
            <Typography variant="caption" display="block">
              {enemy.stats.mp}/{enemy.stats.maxMp} MP
            </Typography>
          )}
        </Box>

        {/* Tactical Info */}
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: 'info.main', fontStyle: 'italic' }}>
            💡 Tips: {enemy.stats.dodge > 15 ? 'High dodge - hard to hit! ' : ''}
            {enemy.stats.armor > 20 ? 'Heavy armor - use elemental damage! ' : ''}
            {enemy.stats.critChance > 20 ? 'High crit chance - be careful! ' : ''}
            {enemy.stats.es > 0 ? 'Has energy shield - hits shield first! ' : ''}
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Tooltip
      title={enemy ? createEnemyTooltip() : ''}
      placement="right"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'transparent',
            maxWidth: 'none',
            p: 0,
          }
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
            {
              name: 'preventOverflow',
              options: {
                padding: 16,
                boundary: 'viewport',
              },
            },
          ],
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: getAnimationTransform(),
          cursor: enemy ? 'pointer' : 'default',
          transition: transitions.elastic,
          animation: animationState === 'hit' ? `${shake} 0.3s` : 'none',
          '&:hover': enemy ? {
            filter: 'brightness(1.2)',
            transform: `${getAnimationTransform()} scale(1.05)`,
          } : {},
        }}
        onClick={enemy ? onSelect : undefined}
      >
      {enemy ? (
        <Fade in={true} timeout={800}>
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
              animation: isSelected ? `${glow} 2s ease-in-out infinite` : 'none',
              transition: transitions.standard,
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
              value={enemy.stats.hp}
              maxValue={enemy.stats.maxHp}
              type="health"
              width={80}
              height={8}
            />
            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
              {enemy.stats.hp}/{enemy.stats.maxHp}
            </Typography>
          </Box>
          </Box>
        </Fade>
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
    </Tooltip>
  )
}

const CombatView = observer(({ onNavigateToTown }: CombatViewProps) => {
  // Initialize combat if not already started
  useEffect(() => {
    if (!combatStore.isInCombat) {
      // Use player stats from PlayerStore
      const playerStats = playerStore.combatStats

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
    <EnhancedDragDrop>
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
                enemy={enemy}
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

      {/* Player Equipment & Info Sidebar */}
      <Box sx={{ width: 320, borderLeft: '1px solid', borderColor: 'divider' }}>
        <Card sx={{ height: '100%', borderRadius: 0, border: 'none' }}>
          <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Player Status</Typography>
            
            {/* Player Health/Mana/ES */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>Health</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {playerStore.vitals.hp}/{playerStore.calculateTotalStat('maxHp')}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>Mana</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {playerStore.vitals.mp}/{playerStore.calculateTotalStat('maxMp')}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>Energy Shield</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {playerStore.vitals.es}/{playerStore.calculateTotalStat('maxEs')}
                </Typography>
              </Box>
            </Box>
            
            {/* Character Equipment - Always Visible */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Equipment</Typography>
              <CharacterDoll />
            </Box>

            {/* Combat Stats - Collapsible */}
            <Accordion sx={{ mb: 1, bgcolor: 'transparent', boxShadow: 'none' }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ 
                  minHeight: 40, 
                  '& .MuiAccordionSummary-content': { my: 1 },
                  border: '1px solid rgba(139, 69, 19, 0.3)',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Typography variant="subtitle2">Combat Stats</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<Shield />} label={`Armor: ${playerStore.calculateTotalStat('armor')}`} size="small" />
                  <Chip icon={<Visibility />} label={`Dodge: ${playerStore.calculateTotalStat('dodge')}%`} size="small" />
                  <Chip icon={<Attack />} label={`Damage: ${playerStore.calculateTotalStat('attack')}`} size="small" />
                  <Chip label={`Crit: ${playerStore.calculateTotalStat('critChance')}%`} size="small" />
                  <Chip label={`Block: ${playerStore.calculateTotalStat('block')}%`} size="small" />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Combat Log - Collapsible */}
            <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ 
                  minHeight: 40, 
                  '& .MuiAccordionSummary-content': { my: 1 },
                  border: '1px solid rgba(139, 69, 19, 0.3)',
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle2">Combat Log</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ 
                  height: 120, 
                  overflow: 'auto', 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  p: 1,
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
              </AccordionDetails>
            </Accordion>

          </CardContent>
        </Card>
      </Box>
      </Box>
    </EnhancedDragDrop>
  )
})

export default CombatView