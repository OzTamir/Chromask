import Phaser from 'phaser';
import { GameColor, COLOR_HEX, VISUAL, PLATFORM } from '../constants';
import { Shadow } from './Shadow';

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
  private shadow: Shadow;

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

    this.shadow = new Shadow(scene, -2);

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

    this.shadow.clear();
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

  setSolid(isSolid: boolean, camera?: Phaser.Cameras.Scene2D.Camera): void {
    if (this.alwaysSolid || this.contacted) return;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = isSolid;
    this.setAlpha(isSolid ? VISUAL.PLATFORM_ACTIVE_ALPHA : VISUAL.PLATFORM_INACTIVE_ALPHA);
    this.borderGraphics?.setVisible(!isSolid);

    const isVisible = camera ? this.isOnScreen(camera) : true;
    if (isVisible) {
      this.shadow.update(this.x, this.y, this.displayWidth, this.displayHeight, true, camera?.scrollY ?? 0);
    } else {
      this.shadow.clear();
    }
  }

  isOnScreen(camera: Phaser.Cameras.Scene2D.Camera): boolean {
    const margin = 50;
    const top = camera.scrollY - margin;
    const bottom = camera.scrollY + camera.height + margin;
    return this.y > top && this.y < bottom;
  }

  updateShadow(camera?: Phaser.Cameras.Scene2D.Camera): void {
    const isVisible = camera ? this.isOnScreen(camera) : true;
    if (isVisible) {
      this.shadow.update(this.x, this.y, this.displayWidth, this.displayHeight, true, camera?.scrollY ?? 0);
    } else {
      this.shadow.clear();
    }
  }

  destroy(fromScene?: boolean): void {
    this.borderGraphics?.destroy();
    this.shadow.destroy();
    super.destroy(fromScene);
  }
}
