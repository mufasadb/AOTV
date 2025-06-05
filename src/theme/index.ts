import { createTheme, type ThemeOptions } from '@mui/material/styles'
import { fadeIn } from './animations'

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Cinzel", "Cinzel Decorative", serif',
    h4: {
      fontFamily: '"Cinzel Decorative", serif',
      fontWeight: 700,
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    },
    h5: {
      fontFamily: '"Cinzel Decorative", serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontWeight: 600,
          textTransform: 'none',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          },
          '&:active': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          padding: '8px 12px',
          fontSize: '0.875rem',
          animation: `${fadeIn} 0.3s ease-in-out`,
        },
        arrow: {
          color: 'rgba(0, 0, 0, 0.95)',
          '&::before': {
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
      defaultProps: {
        arrow: true,
        TransitionProps: {
          timeout: {
            enter: 300,
            exit: 200,
          },
        },
      },
    },
  },
}

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B4513', // Dark brown, reminiscent of old leather/wood
      contrastText: '#d4af37',
    },
    secondary: {
      main: '#CD853F', // Sandy brown for accents
    },
    background: {
      default: '#1a0d00', // Very dark brown, almost black
      paper: '#2d1b0e', // Slightly lighter dark brown
    },
    text: {
      primary: '#d4af37', // Antique gold
      secondary: '#cd853f', // Sandy brown
    },
    success: {
      main: '#228B22', // Forest green
    },
    error: {
      main: '#8B0000', // Dark red
    },
    warning: {
      main: '#DAA520', // Goldenrod
    },
  },
  components: {
    ...(baseTheme.components || {}),
    MuiButton: {
      styleOverrides: {
        root: {
          border: '2px solid #8B4513',
          borderRadius: '8px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#654321',
            border: '2px solid #CD853F',
          },
        },
      },
    },
  },
})

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#8B4513', // Dark brown
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#CD853F', // Sandy brown
    },
    background: {
      default: '#f5f5dc', // Beige
      paper: '#faebd7', // Antique white
    },
    text: {
      primary: '#4a4a4a', // Dark gray
      secondary: '#8B4513', // Dark brown
    },
    success: {
      main: '#228B22', // Forest green
    },
    error: {
      main: '#DC143C', // Crimson
    },
    warning: {
      main: '#FF8C00', // Dark orange
    },
  },
  components: {
    ...(baseTheme.components || {}),
    MuiButton: {
      styleOverrides: {
        root: {
          border: '2px solid #8B4513',
          borderRadius: '8px',
          textShadow: 'none',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#CD853F',
            border: '2px solid #654321',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h4: {
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          color: '#8B4513',
        },
      },
    },
  },
})