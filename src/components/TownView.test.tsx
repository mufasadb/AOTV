import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import TownView from './TownView'
import { darkTheme } from '../theme'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('TownView', () => {
  it('renders the town title', () => {
    renderWithTheme(<TownView onNavigateToCombat={() => {}} />)
    expect(screen.getByText("Adventurer's Haven")).toBeInTheDocument()
  })

  it('displays main town area sections', () => {
    renderWithTheme(<TownView onNavigateToCombat={() => {}} />)
    expect(screen.getByText('Stash')).toBeInTheDocument()
    expect(screen.getByText('Crafting Bench')).toBeInTheDocument()
    expect(screen.getByText('Dungeon Portal')).toBeInTheDocument()
    expect(screen.getByText('Open Stash')).toBeInTheDocument()
    expect(screen.getByText('Start Crafting')).toBeInTheDocument()
    expect(screen.getByText('Enter Dungeon')).toBeInTheDocument()
  })

  it('displays player information panel', () => {
    renderWithTheme(<TownView onNavigateToCombat={() => {}} />)
    expect(screen.getByText('Adventurer')).toBeInTheDocument()
    expect(screen.getByText('Level 12')).toBeInTheDocument()
    expect(screen.getByText(/2450 Gold/)).toBeInTheDocument()
  })

  it('displays inventory tabs', () => {
    renderWithTheme(<TownView onNavigateToCombat={() => {}} />)
    expect(screen.getByRole('tab', { name: /Items/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Stats/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Materials/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Keys/ })).toBeInTheDocument()
  })

  it('shows equipment slots by default', () => {
    renderWithTheme(<TownView onNavigateToCombat={() => {}} />)
    expect(screen.getByText('Equipment Slots')).toBeInTheDocument()
    expect(screen.getAllByText('Weapon')).toHaveLength(2) // One in old layout, one in CharacterDoll
    expect(screen.getAllByText('Shield')).toHaveLength(2) // One in old layout, one in CharacterDoll
    expect(screen.getByText('Helmet')).toBeInTheDocument()
  })
})