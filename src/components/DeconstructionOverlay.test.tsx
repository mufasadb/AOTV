import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import DeconstructionOverlay from './DeconstructionOverlay'
import { inventoryStore } from '../stores/InventoryStore'
import { darkTheme } from '../theme'
import type { Item } from '../stores/InventoryStore'

// Mock item for testing
const mockMagicItem: Item = {
  id: 'test-magic-sword',
  name: 'Magic Sword',
  type: 'weapon',
  slotType: 'melee',
  rarity: 'magic',
  description: 'A magical blade',
  icon: '/test-icon.png',
  stats: { attack: 10 },
  requirements: { level: 1 }
}

const mockRareItem: Item = {
  id: 'test-rare-armor',
  name: 'Rare Armor',
  type: 'armor',
  slotType: 'chest',
  rarity: 'rare',
  description: 'Powerful armor',
  icon: '/test-icon.png',
  stats: { armor: 20 },
  requirements: { level: 10 }
}

const mockCommonItem: Item = {
  id: 'test-common-helm',
  name: 'Common Helm',
  type: 'armor',
  slotType: 'helmet',
  rarity: 'common',
  description: 'Basic helm',
  icon: '/test-icon.png',
  stats: { armor: 5 },
  requirements: { level: 1 }
}

describe('DeconstructionOverlay', () => {
  beforeEach(() => {
    // Reset inventory
    inventoryStore.backpack = [
      mockMagicItem,
      mockRareItem,
      mockCommonItem,
      null, null, null // empty slots
    ]
  })

  const renderComponent = (open = true) => {
    const onClose = vi.fn()
    const utils = render(
      <ThemeProvider theme={darkTheme}>
        <DeconstructionOverlay open={open} onClose={onClose} />
      </ThemeProvider>
    )
    return { ...utils, onClose }
  }

  it('renders when open', () => {
    renderComponent()
    expect(screen.getByText('Item Deconstruction')).toBeInTheDocument()
    expect(screen.getByText(/Break down magic and rare items/)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderComponent(false)
    expect(screen.queryByText('Item Deconstruction')).not.toBeInTheDocument()
  })

  it('shows only magic or higher rarity items in inventory', () => {
    renderComponent()
    
    // Should show magic and rare items
    expect(screen.getByText('Magic Sword')).toBeInTheDocument()
    expect(screen.getByText('Rare Armor')).toBeInTheDocument()
    
    // Should NOT show common item
    expect(screen.queryByText('Common Helm')).not.toBeInTheDocument()
  })

  it('displays item details when item is placed in deconstruction slot', async () => {
    renderComponent()
    
    // Find and drag the magic item
    const magicItems = screen.getAllByText('Magic Sword')
    const magicItem = magicItems[0].closest('[role="button"]')
    const deconstructSlot = screen.getByAltText('deconstruct slot')?.parentElement
    
    if (!magicItem || !deconstructSlot) {
      throw new Error('Could not find draggable item or slot')
    }

    // Simulate drag and drop
    fireEvent.dragStart(magicItem)
    fireEvent.drop(deconstructSlot)
    
    // Check if item details are displayed
    await waitFor(() => {
      const itemNames = screen.getAllByText('Magic Sword')
      expect(itemNames.length).toBeGreaterThan(1) // One in inventory, one in slot details
      expect(screen.getByText(/Magic weapon/i)).toBeInTheDocument()
    })
  })

  it('breaks down item and shows materials obtained', async () => {
    renderComponent()
    
    // Place item in slot
    const rareItem = screen.getByText('Rare Armor').closest('[role="button"]')
    const deconstructSlot = screen.getByAltText('deconstruct slot')?.parentElement
    
    if (!rareItem || !deconstructSlot) {
      throw new Error('Could not find draggable item or slot')
    }

    fireEvent.dragStart(rareItem)
    fireEvent.drop(deconstructSlot)
    
    // Click break down button
    const breakDownButton = screen.getByRole('button', { name: /Break Down Item/i })
    fireEvent.click(breakDownButton)
    
    // Check for loading state
    expect(screen.getByText('Breaking Down...')).toBeInTheDocument()
    
    // Wait for breakdown to complete
    await waitFor(() => {
      expect(screen.getByText('Materials Obtained:')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    // Check that materials are shown
    expect(screen.getByText(/Magic Dust/)).toBeInTheDocument()
    
    // Verify item was removed from inventory
    expect(inventoryStore.backpack.find(item => item?.id === 'test-rare-armor')).toBeUndefined()
  })

  it('prevents breaking down common/normal items', () => {
    renderComponent()
    
    // Try to find common item (should not be visible)
    expect(screen.queryByText('Common Helm')).not.toBeInTheDocument()
  })

  it('disables break down button when no item is selected', () => {
    renderComponent()
    
    const breakDownButton = screen.getByRole('button', { name: /Break Down Item/i })
    expect(breakDownButton).toBeDisabled()
  })

  it('closes when close button is clicked', () => {
    const { onClose } = renderComponent()
    
    const closeButton = screen.getByTestId('CloseIcon').parentElement
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalled()
    }
  })
})