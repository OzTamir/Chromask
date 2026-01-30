import Phaser from 'phaser';
import { ColorSystem } from '../systems/ColorSystem';
import { COLOR_HEX, GameColor } from '../constants';

export class ColorIndicator extends Phaser.GameObjects.Container {
  private redBox: Phaser.GameObjects.Rectangle;
  private greenBox: Phaser.GameObjects.Rectangle;
  private blueBox: Phaser.GameObjects.Rectangle;
  private activeColorBox: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const boxSize = 24;
    const spacing = 32;

    this.redBox = scene.add.rectangle(0, 0, boxSize, boxSize, COLOR_HEX[GameColor.RED]);
    this.greenBox = scene.add.rectangle(spacing, 0, boxSize, boxSize, COLOR_HEX[GameColor.GREEN]);
    this.blueBox = scene.add.rectangle(spacing * 2, 0, boxSize, boxSize, COLOR_HEX[GameColor.BLUE]);

    this.activeColorBox = scene.add.rectangle(spacing * 3 + 16, 0, boxSize, boxSize, COLOR_HEX[GameColor.NONE]);
    this.activeColorBox.setStrokeStyle(2, 0xFFFFFF);

    this.add([this.redBox, this.greenBox, this.blueBox, this.activeColorBox]);

    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(100);
  }

  update(colorSystem: ColorSystem): void {
    this.redBox.setAlpha(colorSystem.isRedEnabled() ? 1 : 0.25);
    this.greenBox.setAlpha(colorSystem.isGreenEnabled() ? 1 : 0.25);
    this.blueBox.setAlpha(colorSystem.isBlueEnabled() ? 1 : 0.25);

    const activeColor = colorSystem.getActiveColor();
    this.activeColorBox.setFillStyle(COLOR_HEX[activeColor]);
  }
}
