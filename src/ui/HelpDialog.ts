import Phaser from 'phaser';
import { HELP_DIALOG } from '../constants';

export class HelpDialog extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    super(scene, centerX, centerY);

    const helpContent = [
      'CONTROLS',
      '',
      'Move        Arrow Keys / WASD',
      'Jump        Up / W / Space',
      '',
      'COLORS',
      '',
      '1           Red',
      '2           Green',
      '3           Blue',
      '',
      'COMBINATIONS',
      '',
      '1 + 2       Yellow',
      '1 + 3       Magenta',
      '2 + 3       Cyan',
      '1 + 2 + 3   White',
    ];

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: HELP_DIALOG.BODY_FONT_SIZE,
      color: HELP_DIALOG.TEXT_COLOR,
      lineSpacing: 8,
      align: 'left',
      resolution: window.devicePixelRatio,
    };

    const text = scene.add.text(0, 0, helpContent.join('\n'), textStyle);
    text.setOrigin(0.5, 0.5);

    const textWidth = text.width + HELP_DIALOG.PADDING * 2;
    const textHeight = text.height + HELP_DIALOG.PADDING * 2;

    this.background = scene.add.graphics();
    this.background.fillStyle(HELP_DIALOG.BACKGROUND_COLOR, HELP_DIALOG.BACKGROUND_ALPHA);
    this.background.fillRoundedRect(
      -textWidth / 2,
      -textHeight / 2,
      textWidth,
      textHeight,
      HELP_DIALOG.BORDER_RADIUS
    );

    this.add([this.background, text]);

    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(200);
    this.setVisible(false);
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
}
