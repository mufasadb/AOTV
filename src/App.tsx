import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Typography, Button, IconButton, Tooltip, Tabs, Tab, Fade } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { gameStore } from './stores/GameStore'
import { darkTheme, lightTheme } from './theme'
import TownView from './components/TownView'
import CombatView from './components/CombatView'
import RewardModal from './components/RewardModal'
import PlayerStatsBar from './components/PlayerStatsBar'

const App = observer(() => {
  const currentTheme = gameStore.isDarkMode ? darkTheme : lightTheme
  const [currentView, setCurrentView] = useState(0)
  const [showRewardModal, setShowRewardModal] = useState(false)
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentView(newValue)
  }

  const navigateToCombat = () => {
    setCurrentView(1)
  }

  const navigateToTown = () => {
    setCurrentView(0)
  }

  const renderCurrentView = () => {
    return (
      <>
        <Fade in={currentView === 0} timeout={500} unmountOnExit>
          <Box sx={{ height: '100%' }}>
            <TownView onNavigateToCombat={navigateToCombat} />
          </Box>
        </Fade>
        <Fade in={currentView === 1} timeout={500} unmountOnExit>
          <Box sx={{ height: '100%' }}>
            <CombatView onNavigateToTown={navigateToTown} />
          </Box>
        </Fade>
      </>
    )
  }

  if (!gameStore.isInitialized) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: gameStore.isDarkMode 
              ? 'linear-gradient(135deg, #1a0d00 0%, #2d1b0e 100%)'
              : 'linear-gradient(135deg, #f5f5dc 0%, #faebd7 100%)',
          }}
        >
          {/* Theme Toggle Button */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Tooltip title={gameStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton 
                onClick={() => gameStore.toggleTheme()}
                color="primary"
                size="large"
              >
                {gameStore.isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              maxWidth: '600px',
              p: 4,
              backgroundColor: gameStore.isDarkMode 
                ? 'rgba(45, 27, 14, 0.8)' 
                : 'rgba(250, 235, 215, 0.9)',
              borderRadius: '12px',
              border: '3px solid',
              borderColor: 'primary.main',
              boxShadow: gameStore.isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.6)'
                : '0 8px 32px rgba(139, 69, 19, 0.3)',
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Project Loot & Craft
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
              Game Status: Not Initialized
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Theme: {gameStore.isDarkMode ? 'Dark (Gritty)' : 'Light (Parchment)'}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ mt: 2, px: 4, py: 1.5 }}
              onClick={() => gameStore.initialize()}
            >
              Initialize Game
            </Button>
          </Box>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: gameStore.isDarkMode 
            ? 'linear-gradient(135deg, #1a0d00 0%, #2d1b0e 100%)'
            : 'linear-gradient(135deg, #f5f5dc 0%, #faebd7 100%)',
        }}
      >
        {/* Theme Toggle Button */}
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1300 }}>
          <Tooltip title={gameStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton 
              onClick={() => gameStore.toggleTheme()}
              color="primary"
              size="large"
            >
              {gameStore.isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1300,
          backgroundColor: 'rgba(45, 27, 14, 0.9)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main',
          overflow: 'hidden',
        }}>
          <Tabs 
            value={currentView} 
            onChange={handleTabChange}
            sx={{
              minHeight: 'auto',
              '& .MuiTab-root': {
                minHeight: 'auto',
                py: 1,
                px: 3,
                fontWeight: 600,
                fontSize: '0.875rem',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              }
            }}
          >
            <Tab label="Town" />
            <Tab label="Combat" />
          </Tabs>
        </Box>

        {/* Player Stats Bar */}
        <PlayerStatsBar />

        {/* Main Content */}
        <Box sx={{ height: '100vh', paddingTop: '60px' }}>
          {renderCurrentView()}
        </Box>

        {/* Demo button to show RewardModal */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowRewardModal(true)}
            size="small"
          >
            Demo Reward Modal
          </Button>
        </Box>

        {/* Reward Modal */}
        <RewardModal 
          open={showRewardModal} 
          onClose={() => setShowRewardModal(false)} 
        />
      </Box>
    </ThemeProvider>
  )
})

export default App
