import Phaser from 'phaser';
import { GameColor, COLOR_HEX, VISUAL, PLATFORM } from '../constants';

export interface PlatformConfig {
  width?: number;
  alwaysSolid?: boolean;
}

export class Platform extends Phaser.Physics.Arcade.Sprite {
  public readonly platformColor: GameColor;
  public readonly alwaysSolid: boolean;
  private readonly platformWidth: number;
  private contacted = false;
  private borderGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, color: GameColor, config?: PlatformConfig) {
    super(scene, x, y, `platform_${color}`);

    this.platformColor = color;
    this.alwaysSolid = config?.alwaysSolid ?? false;
    this.platformWidth = config?.width ?? PLATFORM.WIDTH;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setDisplaySize(this.platformWidth, PLATFORM.HEIGHT);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(this.platformWidth, PLATFORM.HEIGHT);
    body.setOffset((PLATFORM.WIDTH - this.platformWidth) / 2, 0);
    body.updateFromGameObject();

    if (!this.alwaysSolid) {
      this.setAlpha(VISUAL.PLATFORM_INACTIVE_ALPHA);
      this.createBorder(scene);
    }
  }

  private createBorder(scene: Phaser.Scene): void {
    this.borderGraphics = scene.add.graphics();
    this.updateBorder();
    this.borderGraphics.setDepth(-1);
  }

  private updateBorder(): void {
    if (!this.borderGraphics) return;

    const w = this.displayWidth;
    const h = this.displayHeight;
    const color = COLOR_HEX[this.platformColor];

    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(1, color, 0.3);
    this.borderGraphics.strokeRect(this.x - w / 2, this.y - h / 2, w, h);
  }

  markContacted(): void {
    if (this.contacted) return;
    this.contacted = true;
    this.setAlpha(VISUAL.PLATFORM_ACTIVE_ALPHA);
    this.borderGraphics?.setVisible(false);
  }

  isContacted(): boolean {
    return this.contacted;
  }

  setSolid(isSolid: boolean): void {
    if (this.alwaysSolid || this.contacted) return;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = isSolid;
    this.setAlpha(isSolid ? VISUAL.PLATFORM_ACTIVE_ALPHA : VISUAL.PLATFORM_INACTIVE_ALPHA);
    this.borderGraphics?.setVisible(!isSolid);
  }

  destroy(fromScene?: boolean): void {
    this.borderGraphics?.destroy();
    super.destroy(fromScene);
  }
}
