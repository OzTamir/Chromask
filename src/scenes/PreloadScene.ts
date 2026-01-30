import Phaser from 'phaser';
import { GameColor, COLOR_HEX, PLATFORM, PLAYER } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    this.createTextures();
    this.scene.start('GameScene');
  }

  private createTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    this.createPlatformTextures(graphics);
    this.createPlayerTexture(graphics);

    graphics.destroy();
  }

  private createPlatformTextures(graphics: Phaser.GameObjects.Graphics): void {
    const colors = Object.values(GameColor).filter(
      (c): c is GameColor => typeof c === 'number' && c !== GameColor.NONE
    );

    for (const color of colors) {
      this.createFlatRectangle(graphics, PLATFORM.WIDTH, PLATFORM.HEIGHT, COLOR_HEX[color], `platform_${color}`);
    }

    this.createFlatRectangle(graphics, PLATFORM.WIDTH, PLATFORM.HEIGHT, 0x555555, `platform_${GameColor.NONE}`);
  }

  private createPlayerTexture(graphics: Phaser.GameObjects.Graphics): void {
    this.createFlatRectangle(graphics, PLAYER.WIDTH, PLAYER.HEIGHT, 0xEEEEEE, 'player');
  }

  private createFlatRectangle(graphics: Phaser.GameObjects.Graphics, width: number, height: number, color: number, key: string): void {
    graphics.clear();

    // Main body - flat matte color
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);

    // Subtle top edge highlight (Thomas was Alone style)
    graphics.fillStyle(this.lightenColor(color, 0.15), 1);
    graphics.fillRect(0, 0, width, 2);

    // Subtle bottom edge shadow
    graphics.fillStyle(this.darkenColor(color, 0.15), 1);
    graphics.fillRect(0, height - 2, width, 2);

    graphics.generateTexture(key, width, height);
  }

  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, ((color >> 16) & 0xFF) + Math.floor(255 * factor));
    const g = Math.min(255, ((color >> 8) & 0xFF) + Math.floor(255 * factor));
    const b = Math.min(255, (color & 0xFF) + Math.floor(255 * factor));
    return (r << 16) | (g << 8) | b;
  }

  private darkenColor(color: number, factor: number): number {
    const r = Math.max(0, ((color >> 16) & 0xFF) - Math.floor(255 * factor));
    const g = Math.max(0, ((color >> 8) & 0xFF) - Math.floor(255 * factor));
    const b = Math.max(0, (color & 0xFF) - Math.floor(255 * factor));
    return (r << 16) | (g << 8) | b;
  }
}
