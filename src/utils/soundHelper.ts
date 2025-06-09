/**
 * Sound Helper - Manages game audio with HTML5 Audio API
 */

export interface SoundConfig {
  volume?: number
  loop?: boolean
  preload?: boolean
}

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled = true
  private masterVolume = 0.3

  constructor() {
    // Initialize with basic sound effects (with fallback for missing files)
    this.loadSoundWithFallback('attack', '/audio/sword-hit.mp3', { volume: 0.4 })
    this.loadSoundWithFallback('enemy-hit', '/audio/enemy-hit.mp3', { volume: 0.4 })
    this.loadSoundWithFallback('enemy-hit-crit', '/audio/enemy-hit-crit.mp3', { volume: 0.5 })
    this.loadSoundWithFallback('enemy-death', '/audio/enemy-death.mp3', { volume: 0.5 })
    this.loadSoundWithFallback('player-hit', '/audio/player-hurt.mp3', { volume: 0.3 })
    this.loadSoundWithFallback('player-hit-crit', '/audio/player-hurt-crit.mp3', { volume: 0.4 })
    this.loadSoundWithFallback('victory', '/audio/victory.mp3', { volume: 0.6 })
    this.loadSoundWithFallback('loot', '/audio/loot.mp3', { volume: 0.4 })
    this.loadSoundWithFallback('item-pickup', '/audio/item-pickup.mp3', { volume: 0.3 })
    this.loadSoundWithFallback('cloth-equip', '/audio/cloth-equip.mp3', { volume: 0.3 })
    this.loadSoundWithFallback('cloth-unequip', '/audio/cloth-unequip.mp3', { volume: 0.3 })
    this.loadSoundWithFallback('click', '/audio/ui-click.mp3', { volume: 0.2 })
    this.loadSoundWithFallback('hover', '/audio/ui-hover.mp3', { volume: 0.1 })
  }

  private loadSound(id: string, src: string, config: SoundConfig = {}) {
    try {
      const audio = new Audio()
      audio.src = src
      audio.volume = (config.volume || 0.5) * this.masterVolume
      audio.loop = config.loop || false
      audio.preload = config.preload ? 'auto' : 'metadata'
      
      // Handle loading errors gracefully
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: ${src}`)
      })
      
      this.sounds.set(id, audio)
    } catch (error) {
      console.warn(`Error creating audio for ${id}:`, error)
    }
  }

  private loadSoundWithFallback(id: string, src: string, config: SoundConfig = {}) {
    // For now, create a placeholder that logs instead of playing actual sound
    // This allows the system to work without actual audio files
    const dummyAudio = {
      play: () => {
        console.log(`🔊 SOUND: Playing ${id} (${src})`)
        return Promise.resolve()
      },
      pause: () => {},
      load: () => {},
      volume: (config.volume || 0.5) * this.masterVolume,
      currentTime: 0,
      loop: config.loop || false
    } as any

    this.sounds.set(id, dummyAudio)
  }

  play(soundId: string): void {
    if (!this.enabled) return
    
    const sound = this.sounds.get(soundId)
    if (sound) {
      try {
        // Reset to beginning and play
        sound.currentTime = 0
        const playPromise = sound.play()
        
        // Handle play promise for browsers that require user interaction
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Audio play was prevented, this is normal for autoplay policies
            console.log(`Audio play prevented for ${soundId}`)
          })
        }
      } catch (error) {
        console.warn(`Error playing sound ${soundId}:`, error)
      }
    }
  }

  stop(soundId: string): void {
    const sound = this.sounds.get(soundId)
    if (sound) {
      sound.pause()
      sound.currentTime = 0
    }
  }

  setVolume(soundId: string, volume: number): void {
    const sound = this.sounds.get(soundId)
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume * this.masterVolume))
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    // Update all existing sounds
    this.sounds.forEach((sound, id) => {
      const config = this.getSoundConfig(id)
      sound.volume = (config.volume || 0.5) * this.masterVolume
    })
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      // Stop all currently playing sounds
      this.sounds.forEach(sound => {
        sound.pause()
      })
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  private getSoundConfig(soundId: string): SoundConfig {
    // Return default configs for known sounds
    const configs: { [key: string]: SoundConfig } = {
      'attack': { volume: 0.4 },
      'enemy-hit': { volume: 0.4 },
      'enemy-hit-crit': { volume: 0.5 },
      'enemy-death': { volume: 0.5 },
      'player-hit': { volume: 0.3 },
      'player-hit-crit': { volume: 0.4 },
      'victory': { volume: 0.6 },
      'loot': { volume: 0.4 },
      'item-pickup': { volume: 0.3 },
      'cloth-equip': { volume: 0.3 },
      'cloth-unequip': { volume: 0.3 },
      'click': { volume: 0.2 },
      'hover': { volume: 0.1 }
    }
    return configs[soundId] || { volume: 0.5 }
  }

  // Preload a sound effect
  preload(soundId: string): void {
    const sound = this.sounds.get(soundId)
    if (sound) {
      sound.load()
    }
  }

  // Add new sound at runtime
  addSound(id: string, src: string, config: SoundConfig = {}): void {
    this.loadSound(id, src, config)
  }
}

// Create global sound manager instance
export const soundManager = new SoundManager()

// Convenience functions for common sounds
export const playSounds = {
  attack: () => soundManager.play('attack'),
  enemyHit: (isCrit: boolean = false) => soundManager.play(isCrit ? 'enemy-hit-crit' : 'enemy-hit'),
  enemyDeath: () => soundManager.play('enemy-death'),
  playerHit: (isCrit: boolean = false) => soundManager.play(isCrit ? 'player-hit-crit' : 'player-hit'),
  victory: () => soundManager.play('victory'),
  loot: () => soundManager.play('loot'),
  itemPickup: () => soundManager.play('item-pickup'),
  clothEquip: () => soundManager.play('cloth-equip'),
  clothUnequip: () => soundManager.play('cloth-unequip'),
  click: () => soundManager.play('click'),
  hover: () => soundManager.play('hover')
}

export default soundManager