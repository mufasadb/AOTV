# CLAUDE.md - Project Loot & Craft

## Critical Development Guidelines 

⚠️ **IMPORTANT**: Before starting any task, Claude Code must:
1. **Review GDD.md** to understand the core game design, mechanics, and vision
2. **Review PP.md** to understand the current project phase and specific task requirements
3. **Align all work** with the project's loot-driven ARPG design principles

This ensures all development stays true to the game's design fundamentals and follows the structured development plan.

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
- Current test coverage: **31 passing tests** across 5 test files
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

## Current Implementation Status (Phase 1)

### ✅ Completed Phase 1 Tasks
**Section 1: Project Foundation & Core UI Structure**
- **Task 1.1.1 ✅**: React project with MobX, MUI, testing framework
- **Task 1.1.2 ✅**: Dark fantasy theming with medieval fonts (Cinzel)
- **Task 1.2.1 ✅**: Main UI components (TownView, CombatView, RewardModal)
- **Task 1.2.2 ✅**: Town layout with player inventory tabs, town buildings
- **Task 1.2.3 ✅**: Combat layout with enemy area, action bar, targeting
- **Task 1.2.4 ✅**: Reward modal layout
- **Task 1.3.1 ✅**: Navigation system between views

**Section 2: Item Interaction & Core Displays**
- **Task 1.4.1 ✅**: Item display components with tooltips
- **Task 1.4.2 ✅**: Inventory UI with basic grid layout
- **Task 1.4.3 ✅**: Player equipment display (basic version)
- **Task 1.4.4 ✅**: Stats bar UI in combat view
- **Task 1.4.5 ✅**: Detailed stats display in town
- **Task 1.4.6 ✅**: Stash interaction (basic version)
- **Task 1.4.7 ✅**: Crafting bench UI (placeholder)
- **Task 1.4.8 ✅**: Enemy placement and targeting visuals

**Asset Integration**
- ✅ **Icon Database**: 6,295 fantasy icons organized and accessible
- ✅ **Visual Assets**: Weapon, armor, skill, and profession icons integrated

### 🚧 Next Phase 1 Priorities (Combat Logic)
**Section 2: Combat System - Core Mechanics (PP.md Tasks 2.1-2.7)**
- **Task 2.1**: Design data structures for player/enemy stats (MobX stores)
- **Task 2.2**: Implement turn management system
- **Task 2.3**: Player "Attack" action implementation
- **Task 2.4**: Player "Block" action implementation  
- **Task 2.5**: Basic Enemy AI
- **Task 2.6**: Combat feedback display
- **Task 2.7**: Combat end conditions and rewards


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
- **Mock Data**: Combat and player data currently uses placeholder data (intentional for Phase 1)
- **Combat Logic**: No functional turn-based mechanics yet (next priority)
- **Item System**: No actual item stats or generation logic yet
- **Single View State**: Navigation state not persisted across page reloads

## Contributing Guidelines
1. **Test First**: Write failing tests before implementing features
2. **Small Commits**: Keep commits focused and atomic
3. **Type Safety**: Ensure all TypeScript errors are resolved
4. **Component Isolation**: Build reusable, self-contained components
5. **Performance**: Consider render optimization for game-critical components

---

*Last Updated: January 2025*
*Project Phase: Phase 1 Section 1 & 2 Complete - Ready for Combat System Implementation (Tasks 2.1-2.7)*
*Current Task: Begin implementing MobX stores for player/enemy stats (Task 2.1)*