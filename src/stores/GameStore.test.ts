import { describe, it, expect } from 'vitest'
import { GameStore } from './GameStore'

describe('GameStore', () => {
  it('initializes with isInitialized false', () => {
    const store = new GameStore()
    expect(store.isInitialized).toBe(false)
  })

  it('initializes with dark mode enabled', () => {
    const store = new GameStore()
    expect(store.isDarkMode).toBe(true)
  })

  it('can be initialized', () => {
    const store = new GameStore()
    store.initialize()
    expect(store.isInitialized).toBe(true)
  })

  it('can toggle theme mode', () => {
    const store = new GameStore()
    expect(store.isDarkMode).toBe(true)
    
    store.toggleTheme()
    expect(store.isDarkMode).toBe(false)
    
    store.toggleTheme()
    expect(store.isDarkMode).toBe(true)
  })
})