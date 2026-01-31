import Phaser from 'phaser';
import { GameColor, AUDIO, COLOR_NAMES, SoundSettings, SoundMode, SoundCategory } from '../constants';

export class AudioManager {
  private scene: Phaser.Scene;
  private lastBruhTime: number = 0;
  private soundSettings: SoundSettings;
  private landingCount: number = 0;

  constructor(scene: Phaser.Scene, soundSettings: SoundSettings) {
    this.scene = scene;
    this.soundSettings = soundSettings;
  }

  private isCategoryEnabled(category: SoundCategory): boolean {
    if (this.soundSettings.mode === SoundMode.OFF) {
      return false;
    }
    if (this.soundSettings.mode === SoundMode.ON) {
      return true;
    }
    // CUSTOM mode - check individual toggle
    return this.soundSettings.custom[category];
  }

  // Play random jump sound from 4 options
  playJump(): void {
    if (!this.isCategoryEnabled(SoundCategory.JUMP)) return;
    const keys = AUDIO.KEYS.JUMP;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    this.scene.sound.play(randomKey);
  }

  playPlatformHit(color: GameColor): void {
    if (!this.isCategoryEnabled(SoundCategory.LANDING)) return;
    if (color === GameColor.NONE) return;
    
    this.landingCount++;
    
    if (this.landingCount % AUDIO.CONFIG.SUFFER_LANDING_INTERVAL === 0) {
      this.playSuffer();
    } else {
      const colorName = COLOR_NAMES[color];
      const key = `${AUDIO.KEYS.PLATFORM_HIT}-${colorName}`;
      this.scene.sound.play(key);
    }
  }

  private playSuffer(): void {
    const keys = AUDIO.KEYS.SUFFER;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    this.scene.sound.play(randomKey);
  }

  playGameStart(): void {
    if (!this.isCategoryEnabled(SoundCategory.UI)) return;
    this.scene.sound.play(AUDIO.KEYS.GAME_START);
  }

  playGameOver(): void {
    if (!this.isCategoryEnabled(SoundCategory.UI)) return;
    this.scene.sound.play(AUDIO.KEYS.GAME_OVER);
  }

  // Play random BRUH sound with cooldown
  playBruh(): void {
    if (!this.isCategoryEnabled(SoundCategory.UI)) return;
    const now = Date.now();
    if (now - this.lastBruhTime < AUDIO.CONFIG.BRUH_COOLDOWN_MS) return;
    
    this.lastBruhTime = now;
    const keys = AUDIO.KEYS.BRUH;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    this.scene.sound.play(randomKey);
  }

   stopAll(): void {
     this.scene.sound.stopAll();
   }

   updateSoundSettings(newSettings: SoundSettings): void {
     this.soundSettings = newSettings;
   }
}
