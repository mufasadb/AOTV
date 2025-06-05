import { keyframes } from '@mui/material';

// Fade animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Scale animations
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Slide animations
export const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInFromBottom = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Shake animation
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
`;

// Glow animation
export const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
`;

// Bounce animation
export const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

// Float animation
export const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// Spin animation
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Animation timing functions
export const transitions = {
  standard: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Common animation styles
export const animationStyles = {
  fadeIn: {
    animation: `${fadeIn} 0.3s ease-in-out`,
  },
  scaleIn: {
    animation: `${scaleIn} 0.3s ease-out`,
  },
  slideInFromRight: {
    animation: `${slideInFromRight} 0.4s ease-out`,
  },
  slideInFromLeft: {
    animation: `${slideInFromLeft} 0.4s ease-out`,
  },
  slideInFromBottom: {
    animation: `${slideInFromBottom} 0.3s ease-out`,
  },
  pulse: {
    animation: `${pulse} 2s infinite`,
  },
  float: {
    animation: `${float} 3s ease-in-out infinite`,
  },
  glow: {
    animation: `${glow} 2s ease-in-out infinite`,
  },
  bounce: {
    animation: `${bounce} 1s`,
  },
  shake: {
    animation: `${shake} 0.3s`,
  },
  spin: {
    animation: `${spin} 1s linear infinite`,
  },
};

// Hover effects
export const hoverEffects = {
  lift: {
    transition: transitions.standard,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  },
  glow: {
    transition: transitions.standard,
    '&:hover': {
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
    },
  },
  scale: {
    transition: transitions.standard,
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  brightness: {
    transition: transitions.standard,
    '&:hover': {
      filter: 'brightness(1.2)',
    },
  },
};