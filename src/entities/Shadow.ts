import Phaser from 'phaser';
import { VISUAL, GAME } from '../constants';

export class Shadow {
  private graphics: Phaser.GameObjects.Graphics;
  private depth: number;

  constructor(scene: Phaser.Scene, depth: number = -10) {
    this.graphics = scene.add.graphics();
    this.depth = depth;
    this.graphics.setDepth(depth);
  }

  update(
    x: number,
    y: number,
    width: number,
    height: number,
    isGrounded: boolean = false,
    cameraScrollY: number = 0
  ): void {
    this.graphics.clear();

    if (!isGrounded) {
      return;
    }

    const alpha = VISUAL.SHADOW_ALPHA;
    const startOffsetY = height * 0.8;
    const entityBottomY = y - height / 2 + startOffsetY;

    const screenBottom = cameraScrollY + GAME.HEIGHT;
    const shadowLength = screenBottom - entityBottomY;

    if (shadowLength <= 0) {
      return;
    }

    const lightAngleRad = (VISUAL.SHADOW_LIGHT_ANGLE * Math.PI) / 180;
    const lightDirX = Math.cos(lightAngleRad);

    const endX = x + shadowLength * lightDirX;
    const endY = screenBottom;

    const spreadOffset = VISUAL.SHADOW_SPREAD;

    this.graphics.fillStyle(0x000000, alpha);

    this.graphics.beginPath();
    this.graphics.moveTo(x - width / 2, entityBottomY);
    this.graphics.lineTo(endX - width / 2 + spreadOffset, endY);
    this.graphics.lineTo(endX + width / 2 + spreadOffset, endY);
    this.graphics.lineTo(x + width / 2, entityBottomY);
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  setDepth(depth: number): void {
    this.depth = depth;
    this.graphics.setDepth(depth);
  }

  getDepth(): number {
    return this.depth;
  }

  clear(): void {
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
