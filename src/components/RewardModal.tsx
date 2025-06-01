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
  ListItemText
} from '@mui/material'

interface RewardModalProps {
  open: boolean
  onClose: () => void
}

const RewardModal = ({ open, onClose }: RewardModalProps) => {
  // Placeholder reward data
  const mockRewards = [
    'Rusty Sword (+2 Attack)',
    'Leather Boots (+1 Defense)',
    'Health Potion',
    'Iron Ore (Crafting Material)'
  ]

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
          <List dense>
            {mockRewards.map((reward, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText 
                  primary={reward}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
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