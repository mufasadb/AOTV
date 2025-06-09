import { observer } from 'mobx-react-lite'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  IconButton,
  Paper
} from '@mui/material'
import { Close, Build } from '@mui/icons-material'
import { useDroppable } from '@dnd-kit/core'
import { getRpgFrame, getProfessionIcon } from '../utils/iconHelper'
import RpgButton from './RpgButton'

interface CraftingBenchOverlayProps {
  open: boolean
  onClose: () => void
}

const CraftingBenchOverlay = observer(({ open, onClose }: CraftingBenchOverlayProps) => {
  const { setNodeRef: setAnvilRef, isOver: isAnvilOver } = useDroppable({
    id: 'crafting-anvil',
    data: {
      type: 'crafting-anvil',
    },
  })

  const { setNodeRef: setToolRef, isOver: isToolOver } = useDroppable({
    id: 'crafting-tool',
    data: {
      type: 'crafting-tool',
    },
  })

  const { setNodeRef: setMaterialRef, isOver: isMaterialOver } = useDroppable({
    id: 'crafting-materials',
    data: {
      type: 'crafting-materials',
    },
  })

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `url(${getRpgFrame('Paper_01.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '600px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontFamily: 'Cinzel, serif',
        fontSize: '1.5rem',
        color: '#8B4513',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Build sx={{ fontSize: '2rem' }} />
          Blacksmith's Forge
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          
          {/* Crafting Instructions */}
          <Paper sx={{ 
            p: 2, 
            backgroundColor: 'rgba(139, 69, 19, 0.1)', 
            border: '2px solid #8B4513',
            borderRadius: 2,
            width: '100%'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cinzel, serif', color: '#8B4513' }}>
              Crafting Instructions
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1. Place an item in the <strong>Anvil</strong> to modify or enhance it
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2. Add a <strong>Crafting Tool</strong> (orbs, essences, runes)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              3. Optionally add <strong>Materials</strong> for bonus effects
            </Typography>
            <Typography variant="body2">
              4. Click <strong>Craft</strong> to forge your creation!
            </Typography>
          </Paper>

          {/* Crafting Area */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr 1fr', 
            gap: 3, 
            width: '100%',
            alignItems: 'start'
          }}>
            
            {/* Crafting Tool Slot */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>
                Crafting Tool
              </Typography>
              <Box 
                ref={setToolRef}
                sx={{ 
                  width: 120,
                  height: 120,
                  border: isToolOver ? '3px solid #4ade80' : '3px dashed #8B4513',
                  borderRadius: 2,
                  background: isToolOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(139, 69, 19, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mx: 'auto'
                }}
              >
                <Box
                  component="img"
                  src={getProfessionIcon('blacksmith', 15)}
                  alt="crafting tool slot"
                  sx={{ width: 48, height: 48, opacity: 0.5, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Orbs, Essences, Runes
              </Typography>
            </Box>

            {/* Central Anvil */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>
                Forge Anvil
              </Typography>
              <Box 
                ref={setAnvilRef}
                sx={{ 
                  width: 160,
                  height: 160,
                  border: isAnvilOver ? '4px solid #4ade80' : '4px solid #8B4513',
                  borderRadius: 3,
                  background: isAnvilOver ? 'rgba(74, 222, 128, 0.1)' : 'linear-gradient(45deg, rgba(139, 69, 19, 0.1) 0%, rgba(205, 133, 63, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mx: 'auto',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)'
                }}
              >
                <Box
                  component="img"
                  src={getProfessionIcon('blacksmith', 27)}
                  alt="anvil"
                  sx={{ width: 80, height: 80, opacity: 0.7, objectFit: 'contain' }}
                />
                
                {/* Decorative hammer */}
                <Build sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  fontSize: '1.5rem', 
                  color: '#8B4513',
                  opacity: 0.6 
                }} />
              </Box>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Place item to modify here
              </Typography>
            </Box>

            {/* Materials Slot */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>
                Materials
              </Typography>
              <Box 
                ref={setMaterialRef}
                sx={{ 
                  width: 120,
                  height: 120,
                  border: isMaterialOver ? '3px solid #4ade80' : '3px dashed #8B4513',
                  borderRadius: 2,
                  background: isMaterialOver ? 'rgba(74, 222, 128, 0.1)' : 'rgba(139, 69, 19, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mx: 'auto'
                }}
              >
                <Box
                  component="img"
                  src={getProfessionIcon('mining', 45)}
                  alt="materials slot"
                  sx={{ width: 48, height: 48, opacity: 0.5, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Iron, Gems, Special Materials
              </Typography>
            </Box>
          </Box>

          {/* Craft Button */}
          <Box sx={{ mt: 2 }}>
            <RpgButton 
              size="large" 
              variant="primary"
              startIcon={<Build />}
              disabled={true} // Placeholder - would be enabled when items are placed
            >
              Forge Item
            </RpgButton>
          </Box>

          {/* Status/Result Area */}
          <Paper sx={{ 
            p: 2, 
            backgroundColor: 'rgba(0, 0, 0, 0.1)', 
            border: '1px solid #8B4513',
            borderRadius: 2,
            width: '100%',
            minHeight: 80
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>
              Crafting Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Place items in the crafting slots to see potential results...
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  )
})

export default CraftingBenchOverlay