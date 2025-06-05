import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'
import { gameStore } from './stores/GameStore'

describe('App', () => {
  beforeEach(() => {
    gameStore.isInitialized = false
    gameStore.isDarkMode = true
  })

  it('renders the game title', () => {
    render(<App />)
    expect(screen.getByText('Project Loot & Craft')).toBeInTheDocument()
  })

  it('shows not initialized status initially', () => {
    render(<App />)
    expect(screen.getByText('Game Status: Not Initialized')).toBeInTheDocument()
  })

  it('shows dark theme by default', () => {
    render(<App />)
    expect(screen.getByText('Theme: Dark (Gritty)')).toBeInTheDocument()
  })

  it('shows initialize button when not initialized', () => {
    render(<App />)
    expect(screen.getByText('Initialize Game')).toBeInTheDocument()
  })

  it('shows theme toggle button', () => {
    render(<App />)
    expect(screen.getByLabelText('Switch to Light Mode')).toBeInTheDocument()
  })

  it('can initialize the game and shows navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await user.click(screen.getByText('Initialize Game'))
    
    // Should show the navigation tabs
    expect(screen.getByRole('tab', { name: 'Town' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Combat' })).toBeInTheDocument()
    
    // Should show TownView by default
    expect(screen.getByText("Adventurer's Haven")).toBeInTheDocument()
  })

  it('can navigate between Town and Combat views', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Initialize game first
    await user.click(screen.getByText('Initialize Game'))
    
    // Should start on Town view
    expect(screen.getByText("Adventurer's Haven")).toBeInTheDocument()
    
    // Click Combat tab
    await user.click(screen.getByRole('tab', { name: 'Combat' }))
    expect(screen.getByText(/Your Turn|Enemy Turn/)).toBeInTheDocument()
    expect(screen.getAllByText('Goblin Warrior').length).toBeGreaterThan(0)
    
    // Click back to Town tab
    await user.click(screen.getByRole('tab', { name: 'Town' }))
    expect(screen.getByText("Adventurer's Haven")).toBeInTheDocument()
  })

  it('can toggle between dark and light themes', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Initially dark
    expect(screen.getByText('Theme: Dark (Gritty)')).toBeInTheDocument()
    
    // Click toggle to light
    await user.click(screen.getByLabelText('Switch to Light Mode'))
    expect(screen.getByText('Theme: Light (Parchment)')).toBeInTheDocument()
    expect(screen.getByLabelText('Switch to Dark Mode')).toBeInTheDocument()
    
    // Click toggle back to dark
    await user.click(screen.getByLabelText('Switch to Dark Mode'))
    expect(screen.getByText('Theme: Dark (Gritty)')).toBeInTheDocument()
    expect(screen.getByLabelText('Switch to Light Mode')).toBeInTheDocument()
  })
})