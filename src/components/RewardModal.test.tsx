import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import RewardModal from './RewardModal'
import { darkTheme } from '../theme'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('RewardModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('does not render when closed', () => {
    renderWithTheme(<RewardModal open={false} onClose={mockOnClose} />)
    expect(screen.queryByText('Victory!')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    renderWithTheme(<RewardModal open={true} onClose={mockOnClose} />)
    expect(screen.getByText('Victory!')).toBeInTheDocument()
  })

  it('displays combat rewards section', () => {
    renderWithTheme(<RewardModal open={true} onClose={mockOnClose} />)
    expect(screen.getByText('Combat Rewards')).toBeInTheDocument()
    expect(screen.getByText('Items Found:')).toBeInTheDocument()
  })

  it('shows mock reward items', () => {
    renderWithTheme(<RewardModal open={true} onClose={mockOnClose} />)
    expect(screen.getByText('Rusty Sword (+2 Attack)')).toBeInTheDocument()
    expect(screen.getByText('Leather Boots (+1 Defense)')).toBeInTheDocument()
    expect(screen.getByText('Health Potion')).toBeInTheDocument()
    expect(screen.getByText('Iron Ore (Crafting Material)')).toBeInTheDocument()
  })

  it('displays return to town button', () => {
    renderWithTheme(<RewardModal open={true} onClose={mockOnClose} />)
    expect(screen.getByRole('button', { name: 'Return to Town' })).toBeInTheDocument()
  })

  it('calls onClose when return to town button is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RewardModal open={true} onClose={mockOnClose} />)
    
    await user.click(screen.getByRole('button', { name: 'Return to Town' }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('shows backpack message', () => {
    renderWithTheme(<RewardModal open={true} onClose={mockOnClose} />)
    expect(screen.getByText(/These items have been added to your backpack/)).toBeInTheDocument()
  })
})