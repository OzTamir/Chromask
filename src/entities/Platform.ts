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
  private dashedBorder: Phaser.GameObjects.Graphics | null = null;
  private contacted = false;

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

    if (this.alwaysSolid) {
      this.clearTint();
      this.setAlpha(VISUAL.PLATFORM_ACTIVE_ALPHA);
    } else {
      this.setTint(COLOR_HEX[color]);
      this.setAlpha(VISUAL.PLATFORM_INACTIVE_ALPHA);
      this.dashedBorder = scene.add.graphics();
      this.drawDashedBorder(COLOR_HEX[color]);
      this.dashedBorder.setVisible(true);
    }
  }

  private drawDashedBorder(color: number): void {
    if (!this.dashedBorder) return;
    const w = this.platformWidth;
    const h = PLATFORM.HEIGHT;
    const dashLen = 6;
    const gapLen = 4;
    const border = this.dashedBorder;
    
    border.lineStyle(2, color, 0.8);
    
    const drawDashedLine = (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;
      
      let pos = 0;
      let drawing = true;
      
      while (pos < len) {
        const segLen = drawing ? dashLen : gapLen;
        const endPos = Math.min(pos + segLen, len);
        
        if (drawing) {
          border.beginPath();
          border.moveTo(x1 + nx * pos, y1 + ny * pos);
          border.lineTo(x1 + nx * endPos, y1 + ny * endPos);
          border.strokePath();
        }
        
        pos = endPos;
        drawing = !drawing;
      }
    };

    const left = this.x - w / 2;
    const top = this.y - h / 2;
    
    drawDashedLine(left, top, left + w, top);
    drawDashedLine(left + w, top, left + w, top + h);
    drawDashedLine(left + w, top + h, left, top + h);
    drawDashedLine(left, top + h, left, top);
  }

  markContacted(): void {
    if (this.contacted) return;
    this.contacted = true;
    this.setAlpha(VISUAL.PLATFORM_ACTIVE_ALPHA);
    this.dashedBorder?.setVisible(false);
  }

  isContacted(): boolean {
    return this.contacted;
  }

  setSolid(isSolid: boolean): void {
    if (this.alwaysSolid || this.contacted) return;
    
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = isSolid;
    this.setAlpha(isSolid ? VISUAL.PLATFORM_ACTIVE_ALPHA : VISUAL.PLATFORM_INACTIVE_ALPHA);
    this.dashedBorder?.setVisible(!isSolid);
  }

  destroy(fromScene?: boolean): void {
    this.dashedBorder?.destroy();
    super.destroy(fromScene);
  }
}
