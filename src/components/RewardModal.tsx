import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material'
import RpgItemSlot from './RpgItemSlot'
import type { AnyItem } from '../types/ItemTypes'

export interface DungeonRewards {
  gold: number
  items: (string | AnyItem)[] // Support both strings and item objects for backward compatibility
  experience?: number
}

interface RewardModalProps {
  open: boolean
  onClose: () => void
  rewards?: DungeonRewards
}

const RewardModal = ({ open, onClose, rewards }: RewardModalProps) => {
  const defaultRewards: DungeonRewards = {
    gold: 0,
    items: [],
    experience: 0
  }
  
  const actualRewards = rewards || defaultRewards

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'primary.main'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h4" component="div" color="success.main">
          Victory!
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
          Combat Rewards
        </Typography>
        
        {/* Gold Reward */}
        <Box sx={{ 
          border: '1px solid', 
          borderColor: 'warning.main', 
          borderRadius: 1, 
          p: 2,
          mb: 2,
          backgroundColor: 'rgba(255, 193, 7, 0.1)'
        }}>
          <Typography variant="h6" sx={{ color: 'warning.main', textAlign: 'center' }}>
            💰 {actualRewards.gold} Gold
          </Typography>
        </Box>

        {/* Items Reward */}
        {actualRewards.items.length > 0 && (
          <Box sx={{ 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 1, 
            p: 2,
            backgroundColor: 'background.paper'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              Items Found:
            </Typography>
            
            {/* Display item objects with icons in a grid */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {actualRewards.items
                .filter(item => typeof item === 'object' && item !== null)
                .map((item, index) => {
                  const itemObj = item as AnyItem
                  return (
                    <Grid item key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <RpgItemSlot
                          item={{
                            name: itemObj.name,
                            icon: itemObj.icon,
                            rarity: itemObj.type === 'equipment' ? itemObj.rarity : 'common'
                          }}
                          size={48}
                          showTooltip={true}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5, 
                            maxWidth: 60, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {itemObj.name}
                        </Typography>
                      </Box>
                    </Grid>
                  )
                })}
            </Grid>
            
            {/* Fallback for string items (backward compatibility) */}
            {actualRewards.items.some(item => typeof item === 'string') && (
              <List dense>
                {actualRewards.items
                  .filter(item => typeof item === 'string')
                  .map((item, index) => (
                    <ListItem key={`string-${index}`} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={item as string}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </Box>
        )}

        {/* No items message */}
        {actualRewards.items.length === 0 && (
          <Box sx={{ 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 1, 
            p: 2,
            backgroundColor: 'background.paper',
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="text.secondary">
              No items found this time. Better luck next dungeon!
            </Typography>
          </Box>
        )}
        
        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
          These items have been added to your backpack
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={onClose}
          sx={{ px: 4 }}
        >
          Return to Town
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RewardModal