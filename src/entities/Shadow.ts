import Phaser from 'phaser';
import { VISUAL } from '../constants';

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
    cameraScrollY: number = 0,
    cameraHeight: number = 720,
    lightAngle: number = VISUAL.SHADOW_LIGHT_ANGLE
  ): void {
    this.graphics.clear();

    if (!isGrounded) {
      return;
    }

    const alpha = VISUAL.SHADOW_ALPHA;
    const entityBottomY = y + height / 2;

    const screenBottom = cameraScrollY + cameraHeight;
    const maxShadowLength = 500;
    const shadowLength = Math.min(screenBottom - entityBottomY, maxShadowLength);

    if (shadowLength <= 0) {
      return;
    }

    const lightAngleRad = (lightAngle * Math.PI) / 180;
    const lightDirX = -Math.cos(lightAngleRad);

    const endX = x + shadowLength * lightDirX;
    const endY = screenBottom;

    const spreadOffset = VISUAL.SHADOW_SPREAD;

    this.graphics.fillStyle(0x000000, alpha);

    this.graphics.beginPath();
    this.graphics.moveTo(x - width / 2, entityBottomY);
    this.graphics.lineTo(x + width / 2, entityBottomY);
    this.graphics.lineTo(endX + width / 2 + spreadOffset, endY);
    this.graphics.lineTo(endX - width / 2 + spreadOffset, endY);
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
