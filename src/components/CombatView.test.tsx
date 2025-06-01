import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import CombatView from './CombatView'
import { darkTheme } from '../theme'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('CombatView', () => {
  it('displays player status panel', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getByText('Player Status')).toBeInTheDocument()
    expect(screen.getByText('Health')).toBeInTheDocument()
    expect(screen.getByText('Mana')).toBeInTheDocument()
    expect(screen.getByText('Energy Shield')).toBeInTheDocument()
  })

  it('shows combat stats', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getByText('Combat Stats')).toBeInTheDocument()
    expect(screen.getByText(/Armor: 12/)).toBeInTheDocument()
    expect(screen.getByText(/Dodge: 8%/)).toBeInTheDocument()
    expect(screen.getByText(/Damage: 15-22/)).toBeInTheDocument()
  })

  it('displays equipment information', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getByText('Equipment')).toBeInTheDocument()
    expect(screen.getByText('Iron Sword')).toBeInTheDocument()
    expect(screen.getByText('Wooden Shield')).toBeInTheDocument()
    expect(screen.getByText('Leather Cap')).toBeInTheDocument()
  })

  it('shows enemy information', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getAllByText('Goblin Warrior').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Orc Berserker').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dark Mage').length).toBeGreaterThan(0)
  })

  it('displays player action buttons', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getByRole('button', { name: /Attack/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Block/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abilities/ })).toBeInTheDocument()
  })

  it('shows buttons as disabled (placeholder state)', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getByRole('button', { name: /Attack/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Block/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Abilities/ })).toBeDisabled()
  })

  it('displays combat instructions', () => {
    renderWithTheme(<CombatView />)
    expect(screen.getByText(/Click an enemy to target/)).toBeInTheDocument()
    expect(screen.getByText(/Turn-based combat system/)).toBeInTheDocument()
  })
})