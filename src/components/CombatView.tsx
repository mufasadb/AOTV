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
import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { getMedievalIcon } from '../utils/iconHelper'
import { combatStore } from '../stores/CombatStore'
import { playerStore } from '../stores/PlayerStore'
import { inventoryStore } from '../stores/InventoryStore'
import RpgProgressBar from './RpgProgressBar'
import RpgButton from './RpgButton'
import FloatingDamage from './FloatingDamage'
import CharacterDoll from './CharacterDoll'
import EnhancedDraggableItem from './EnhancedDraggableItem'
import EnhancedDragDrop from './EnhancedDragDrop'
import RewardModal from './RewardModal'
import { transitions, glow } from '../theme/animations'


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
  enemy: import('../stores/CombatStore').CombatEntity, 
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

  const getEnemyImage = (name: string) => {
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
        return `${baseTransform} translateY(-8px)` // Small upward movement when hit
      case 'attacking':
        return `${baseTransform} translateY(10px)` // Jut forward (down/towards player)
      default:
        return baseTransform
    }
  }

  const createEnemyTooltip = () => {
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
      title={createEnemyTooltip()}
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
          cursor: 'pointer',
          transition: transitions.elastic,
          '&:hover': {
            filter: 'brightness(1.2)',
            transform: `${getAnimationTransform()} scale(1.05)`,
          },
        }}
        onClick={onSelect}
      >
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
      </Box>
    </Tooltip>
  )
}

const CombatView = observer(({ onNavigateToTown }: CombatViewProps) => {
  const combatLogRef = useRef<HTMLDivElement>(null)
  
  // Track attack button state for debugging
  const isAttackButtonDisabled = 
    combatStore.turnPhase !== 'player' || 
    !combatStore.selectedTargetId || 
    combatStore.isProcessingTurn ||
    !combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp

  // Log attack button state changes
  useEffect(() => {
    const reasons = []
    if (combatStore.turnPhase !== 'player') reasons.push(`turnPhase=${combatStore.turnPhase}`)
    if (!combatStore.selectedTargetId) reasons.push('no_target_selected')
    if (combatStore.isProcessingTurn) reasons.push('processing_turn')
    if (!combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp) reasons.push('target_dead')
    
    if (isAttackButtonDisabled) {
      console.log('🚫 BUTTON: Attack button DISABLED - Reasons:', reasons.join(', '))
    } else {
      console.log('✅ BUTTON: Attack button ENABLED - All conditions met')
    }
  }, [isAttackButtonDisabled, combatStore.turnPhase, combatStore.selectedTargetId, combatStore.isProcessingTurn, combatStore.enemies])

  // Initialize combat if not already started
  useEffect(() => {
    if (!combatStore.isInCombat) {
      // Ensure player starts with full vitals
      playerStore.fullHeal()
      
      // Use player stats from PlayerStore
      const playerStats = playerStore.combatStats

      // Start the dungeon with generated enemies
      combatStore.initializeDungeon(playerStats)
    }
  }, [])

  // Handle combat end states
  useEffect(() => {
    if (combatStore.turnPhase === 'victory') {
      // Don't auto-progress to next fight - let player see rewards first
      // The reward modal will handle progression
    } else if (combatStore.turnPhase === 'defeat') {
      // Apply death penalty and return to town
      setTimeout(() => {
        combatStore.applyDeathPenalty()
        combatStore.endCombat()
        onNavigateToTown()
      }, 2000)
    }
  }, [combatStore.turnPhase, onNavigateToTown])

  // Auto-scroll combat log to bottom when new messages arrive
  useEffect(() => {
    if (combatLogRef.current) {
      combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight
    }
  }, [combatStore.combatLog.length])

  // Sync player vitals from combat to PlayerStore
  useEffect(() => {
    if (combatStore.player) {
      playerStore.updateVitals({
        hp: combatStore.player.stats.hp,
        mp: combatStore.player.stats.mp,
        es: combatStore.player.stats.es
      })
    }
  }, [combatStore.player?.stats.hp, combatStore.player?.stats.mp, combatStore.player?.stats.es])
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
          {combatStore.enemies.map((enemy, index) => {
            // Only show actual enemies, no empty slots
            const position = enemyPositions[index]
            
            return (
              <EnemySlot
                key={enemy.id}
                enemy={enemy}
                position={position}
                isSelected={combatStore.selectedTargetId === enemy.id}
                onSelect={() => combatStore.selectTarget(enemy.id)}
                animationState={combatStore.enemyAnimations[enemy.id] || 'idle'}
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
              disabled={isAttackButtonDisabled}
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
      <Box sx={{ width: 640, borderLeft: '1px solid', borderColor: 'divider' }}>
        <Card sx={{ height: '100%', borderRadius: 0, border: 'none' }}>
          <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Player Status</Typography>
            
            {/* Player Vitals with Progress Bars */}
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              backgroundColor: 'rgba(45, 27, 14, 0.3)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Player Vitals
              </Typography>
              
              {/* Health */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#dc2626' }}>
                    Health
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {playerStore.vitals.hp}/{playerStore.calculateTotalStat('maxHp')}
                  </Typography>
                </Box>
                <RpgProgressBar
                  value={playerStore.vitals.hp}
                  maxValue={playerStore.calculateTotalStat('maxHp')}
                  type="health"
                  width={280}
                  height={16}
                />
              </Box>

              {/* Mana */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2563eb' }}>
                    Mana
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {playerStore.vitals.mp}/{playerStore.calculateTotalStat('maxMp')}
                  </Typography>
                </Box>
                <RpgProgressBar
                  value={playerStore.vitals.mp}
                  maxValue={playerStore.calculateTotalStat('maxMp')}
                  type="mana"
                  width={280}
                  height={16}
                />
              </Box>

              {/* Energy Shield */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#7c3aed' }}>
                    Energy Shield
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {playerStore.vitals.es}/{playerStore.calculateTotalStat('maxEs')}
                  </Typography>
                </Box>
                <RpgProgressBar
                  value={playerStore.vitals.es}
                  maxValue={playerStore.calculateTotalStat('maxEs')}
                  type="energy"
                  width={280}
                  height={16}
                />
              </Box>
            </Box>
            
            {/* Character Equipment - Always Visible */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Equipment</Typography>
              <CharacterDoll />
            </Box>

            {/* Player Inventory - 2 Column Layout */}
            <Box sx={{ 
              mb: 3,
              p: 2,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              backgroundColor: 'rgba(45, 27, 14, 0.3)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Inventory ({inventoryStore.inventory.length} items)
              </Typography>
              
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {inventoryStore.inventory.map((item, index) => (
                  <Box
                    key={`combat-inventory-${item.id}-${index}`}
                    sx={{
                      border: '1px solid rgba(139, 69, 19, 0.3)',
                      borderRadius: 1,
                      p: 0.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)'
                      }
                    }}
                  >
                    <EnhancedDraggableItem
                      item={item}
                      sourceIndex={index}
                      sourceType="inventory"
                    />
                  </Box>
                ))}
                
                {/* Empty slots to show grid structure */}
                {Array.from({ length: Math.max(0, 6 - inventoryStore.inventory.length) }, (_, index) => (
                  <Box
                    key={`empty-slot-${index}`}
                    sx={{
                      border: '1px dashed rgba(139, 69, 19, 0.3)',
                      borderRadius: 1,
                      p: 1,
                      height: 64,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.5 }}>
                      Empty
                    </Typography>
                  </Box>
                ))}
              </Box>
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
                <Box 
                  ref={combatLogRef}
                  sx={{ 
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

      {/* Reward Modal */}
      <RewardModal
        open={combatStore.showRewardModal}
        onClose={() => {
          const result = combatStore.nextFight()
          if (result === 'dungeon_complete') {
            combatStore.closeRewardModal()
            onNavigateToTown()
          }
          // If result is 'next_fight', modal will close automatically and combat continues
        }}
        rewards={combatStore.turnPhase === 'victory' && combatStore.currentFight <= combatStore.totalFights ? combatStore.fightRewards : combatStore.dungeonRewards}
        isDungeonComplete={combatStore.currentFight > combatStore.totalFights}
      />
    </EnhancedDragDrop>
  )
})

export default CombatView