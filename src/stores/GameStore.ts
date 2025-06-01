import { makeAutoObservable } from 'mobx'

export class GameStore {
  isInitialized = false
  isDarkMode = true
  
  constructor() {
    makeAutoObservable(this)
  }
  
  initialize() {
    this.isInitialized = true
  }
  
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
  }
}

export const gameStore = new GameStore()