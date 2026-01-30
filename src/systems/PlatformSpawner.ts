import Phaser from 'phaser';
import { Platform, PlatformConfig } from '../entities/Platform';
import { GameColor, PLATFORM, DIFFICULTY, CAMERA } from '../constants';

const MAX_PLAYABLE_WIDTH = 600;
const BASE_PLATFORM_WIDTH = 120;

export class PlatformSpawner {
  private scene: Phaser.Scene;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private lastSpawnY: number = 0;
  private lastSpawnX: number = 0;
  private lastColor: GameColor = GameColor.RED;
  private currentMaxGapY: number = DIFFICULTY.INITIAL_MAX_GAP_Y;
  private gameWidth: number = 0;
  private gameHeight: number = 0;
  private playableMinX: number = 0;
  private playableMaxX: number = 0;
  private platformWidth: number = BASE_PLATFORM_WIDTH;

  constructor(scene: Phaser.Scene, platforms: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.platforms = platforms;
  }

  private calculatePlayableZone(): void {
    const playableWidth = Math.min(this.gameWidth, MAX_PLAYABLE_WIDTH);
    const sideMargin = (this.gameWidth - playableWidth) / 2;
    this.playableMinX = sideMargin;
    this.playableMaxX = this.gameWidth - sideMargin;
    
    const widthScale = Math.min(this.gameWidth / 480, 1.5);
    this.platformWidth = Math.round(BASE_PLATFORM_WIDTH * widthScale);
  }

  private getAvailableColors(height: number): GameColor[] {
    const absHeight = Math.abs(height);

    if (absHeight < DIFFICULTY.PHASE_2_HEIGHT) {
      return [GameColor.RED, GameColor.GREEN, GameColor.BLUE];
    } else if (absHeight < DIFFICULTY.PHASE_3_HEIGHT) {
      return [
        GameColor.RED,
        GameColor.GREEN,
        GameColor.BLUE,
        GameColor.YELLOW,
        GameColor.MAGENTA,
        GameColor.CYAN,
      ];
    } else {
      return [
        GameColor.RED,
        GameColor.GREEN,
        GameColor.BLUE,
        GameColor.YELLOW,
        GameColor.MAGENTA,
        GameColor.CYAN,
        GameColor.WHITE,
      ];
    }
  }

  private createPlatform(x: number, y: number, color: GameColor, config?: PlatformConfig): Platform {
    const platform = new Platform(this.scene, x, y, color, config);
    this.platforms.add(platform);
    return platform;
  }

  private isEasyPhase(y: number): boolean {
    const heightFromStart = this.gameHeight - 100 - y;
    return heightFromStart < DIFFICULTY.EASY_PHASE_HEIGHT;
  }

  private pickColor(y: number): GameColor {
    const colors = this.getAvailableColors(y);
    
    if (this.isEasyPhase(y) && Math.random() < DIFFICULTY.EASY_PHASE_SAME_COLOR_CHANCE) {
      if (colors.includes(this.lastColor)) {
        return this.lastColor;
      }
    }
    
    return Phaser.Math.RND.pick(colors);
  }

  private pickX(y: number): number {
    const margin = this.platformWidth / 2 + 10;
    const minBound = this.playableMinX + margin;
    const maxBound = this.playableMaxX - margin;
    
    if (this.isEasyPhase(y)) {
      const minX = Math.max(minBound, this.lastSpawnX - DIFFICULTY.EASY_PHASE_MAX_X_DRIFT);
      const maxX = Math.min(maxBound, this.lastSpawnX + DIFFICULTY.EASY_PHASE_MAX_X_DRIFT);
      return Phaser.Math.Between(minX, maxX);
    }
    
    return Phaser.Math.Between(minBound, maxBound);
  }

  private getMaxGapY(y: number): number {
    if (this.isEasyPhase(y)) {
      return DIFFICULTY.EASY_PHASE_MAX_GAP_Y;
    }
    return this.currentMaxGapY;
  }

  spawnPlatformsAbove(currentY: number): void {
    const spawnUntil = currentY - CAMERA.SPAWN_AHEAD;

    while (this.lastSpawnY > spawnUntil) {
      const maxGap = this.getMaxGapY(this.lastSpawnY);
      const gapY = Phaser.Math.Between(PLATFORM.MIN_GAP_Y, maxGap);
      this.lastSpawnY -= gapY;

      const x = this.pickX(this.lastSpawnY);
      const color = this.pickColor(this.lastSpawnY);

      const widthVariation = Phaser.Math.FloatBetween(0.7, 1.4);
      const width = Math.round(this.platformWidth * widthVariation);
      this.createPlatform(x, this.lastSpawnY, color, { width });
      
      this.lastSpawnX = x;
      this.lastColor = color;
    }
  }

  cullPlatformsBelow(cameraScrollY: number): void {
    const cullY = cameraScrollY + this.gameHeight + CAMERA.CULL_BEHIND;

    this.platforms.getChildren().forEach((child) => {
      const platform = child as Platform;
      if (platform.y > cullY) {
        platform.destroy();
      }
    });
  }

  updateDifficulty(heightClimbed: number): void {
    const progress = Math.min(heightClimbed / DIFFICULTY.MAX_DIFFICULTY_HEIGHT, 1);

    this.currentMaxGapY = Phaser.Math.Linear(
      DIFFICULTY.INITIAL_MAX_GAP_Y,
      DIFFICULTY.FINAL_MAX_GAP_Y,
      progress
    );
  }

  createInitialPlatforms(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.calculatePlayableZone();
    this.lastSpawnY = height - PLATFORM.HEIGHT;
    this.lastSpawnX = width / 2;

    this.createPlatform(width / 2, height - PLATFORM.HEIGHT / 2, GameColor.NONE, {
      width: width,
      alwaysSolid: true,
    });
    this.spawnPlatformsAbove(height);
  }

  getPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    return this.platforms;
  }
}
