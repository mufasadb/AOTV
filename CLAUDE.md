# CLAUDE.md - Project Loot & Craft

## Critical Development Guidelines 

⚠️ **IMPORTANT**: Before starting any task, Claude Code must:
1. **Review GDD.md** to understand the core game design, mechanics, and vision
2. **Review PP.md** to understand the current project phase and specific task requirements
3. **Align all work** with the project's design principles
4. **Confirm request is complete before considering complete** unless explictly asked to turn the server off, ensure the dev server is running, and that it returns a response on localhost:5173 and that it has an expected response before considering something "complete" 


## Project Overview
**Project Loot & Craft** is a loot-driven ARPG with turn-based combat, deep crafting systems, and strategic itemization. The game focuses on item-based character progression where all power comes from equipped gear rather than traditional leveling.

**Key Design References:**
- **GDD.md**: Complete game design document outlining mechanics, systems, and vision
- **PP.md**: Detailed 8-phase project plan with specific task breakdowns

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: MobX
- **UI Framework**: Material-UI (MUI) with custom dark fantasy theme
- **Testing**: Vitest + React Testing Library
- **Fonts**: Cinzel & Cinzel Decorative (medieval/fantasy styling)
- **Build Tool**: Vite
- **Package Manager**: npm

## Quick Start Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm test:ui

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

## Development Guidelines

### Testing
- Follow TDD (Test-Driven Development) approach
- All components must have comprehensive test coverage
- Use `describe` blocks to group related tests
- Test both functionality and UI state changes

### Code Style
- Use TypeScript for all new code
- Follow MUI theming patterns for consistent styling
- Use MobX `observer` for reactive components
- Prefer functional components over class components
- Use proper semantic HTML structure

### Component Structure
```
src/
├── components/          # Reusable UI components
├── stores/             # MobX state management
├── theme/              # MUI theme configuration
└── test/               # Test utilities and setup
```


**Asset Integration**
- ✅ **Icon Database**: 6,295 fantasy icons organized and accessible
- ✅ **Visual Assets**: Weapon, armor, skill, and profession icons integrated

## Combat Visual System

**Animation Framework**
- **Enemy Hit Animation**: `translateY(-15px)` - enemies bounce "up" (away from player) when struck
- **Enemy Attack Animation**: `translateY(10px)` - enemies jut "down" (towards player) when attacking
- **Animation Timing**: 300ms hit delay + 600ms return animation for smooth sequencing
- **Turn Processing Lock**: `isProcessingTurn` prevents button spam during animations

**Floating Damage System**
- **Damage Numbers**: Float up and fade out over 1.2 seconds
- **Color Coding**: 
  - Red: Normal damage
  - Orange-red: Critical hits  
  - Green: "DODGED"
  - Blue: "BLOCKED"
- **Positioning**: Damage appears above enemies or near player health bar with random offset
- **Cleanup**: Auto-removal after animation completes to prevent memory leaks

**Visual Perspective**
- **Player Position**: Bottom of screen (conceptually)
- **Enemy Position**: Top/center area (away from player)
- **Movement Logic**: Up = away from player (backward), Down = towards player (forward)
- **Turn Indicators**: Real-time emoji feedback (🗡️ Your Turn, ⚔️ Enemy Turn, 🎉 Victory, 💀 Defeat)

## Architecture Decisions

### State Management
- **MobX** chosen for reactive state management
- **GameStore** handles core game state (initialization, theme)
- Component-specific state uses React hooks where appropriate

### UI/UX Design
- **Dark Mode First**: Default theme optimized for fantasy atmosphere
- **Desktop-Centric**: Full screen utilization with sidebar layouts
- **Game-Like Feel**: 3D buttons, atmospheric backgrounds, proper spacing
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Testing Strategy
- **Component Testing**: Each UI component has dedicated test file
- **Integration Testing**: App-level tests verify navigation and state changes
- **Mock Data**: Realistic game data for testing UI components
- **Visual Regression**: Ensured through consistent theming

## Common Development Tasks

### Adding New Components
1. Create component in `src/components/`
2. Add corresponding test file with `.test.tsx` suffix
3. Export from component and update imports
4. Follow MUI theming patterns for styling

### Updating Game State
1. Modify relevant store in `src/stores/`
2. Update component with `observer` wrapper
3. Add/update tests for state changes
4. Ensure MobX reactivity works correctly

### Theme Customization
1. Edit `src/theme/index.ts` for global changes
2. Use `sx` prop for component-specific styling
3. Maintain consistency between light and dark themes
4. Test theme toggle functionality

## Performance Considerations
- **Bundle Size**: Currently ~508KB (consider code splitting for production)
- **Render Optimization**: Using MobX observers to minimize re-renders
- **Asset Loading**: Prepared directories for game assets in `public/images/`
- **Build Optimization**: Vite provides efficient bundling and tree-shaking

## Deployment Notes
- **PWA Ready**: Project configured for Progressive Web App features
- **Environment**: Built with Node.js and modern browser targets
- **Production Build**: Optimized bundle with proper minification
- **Static Hosting**: Can be deployed to any static hosting service

## Known Issues & Limitations
- **Mock Data**: Some player equipment data uses placeholder items for display (inventory system is functional)
- **Item System**: Item generation and advanced crafting logic not yet implemented  
- **Single View State**: Navigation state not persisted across page reloads
- **Abilities System**: Player abilities placeholder (combat actions functional)

## Contributing Guidelines
1. **Test First**: Write failing tests before implementing features
2. **Small Commits**: Keep commits focused and atomic
3. **Type Safety**: Ensure all TypeScript errors are resolved
4. **Component Isolation**: Build reusable, self-contained components
5. **Performance**: Consider render optimization for game-critical components

---