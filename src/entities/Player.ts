import Phaser from 'phaser';
import { PLAYER } from '../constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private leftEye!: Phaser.GameObjects.Ellipse;
  private rightEye!: Phaser.GameObjects.Ellipse;
  private leftPupil!: Phaser.GameObjects.Ellipse;
  private rightPupil!: Phaser.GameObjects.Ellipse;
  private eyeOffsetY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    body.setFriction(1, 0);
    this.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);

    this.eyeOffsetY = -PLAYER.HEIGHT * 0.35;
    this.createEyes(scene);
  }

  private createEyes(scene: Phaser.Scene): void {
    const eyeWidth = 6;
    const eyeHeight = 8;

    this.leftEye = scene.add.ellipse(0, this.eyeOffsetY, eyeWidth, eyeHeight, 0xFFFFFF);
    this.rightEye = scene.add.ellipse(0, this.eyeOffsetY, eyeWidth, eyeHeight, 0xFFFFFF);

    const pupilSize = 3;
    this.leftPupil = scene.add.ellipse(0, this.eyeOffsetY, pupilSize, pupilSize, 0x222222);
    this.rightPupil = scene.add.ellipse(0, this.eyeOffsetY, pupilSize, pupilSize, 0x222222);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.leftEye.setPosition(this.x - PLAYER.WIDTH * 0.2, this.y + this.eyeOffsetY);
    this.rightEye.setPosition(this.x + PLAYER.WIDTH * 0.2, this.y + this.eyeOffsetY);
    this.leftPupil.setPosition(this.x - PLAYER.WIDTH * 0.2, this.y + this.eyeOffsetY);
    this.rightPupil.setPosition(this.x + PLAYER.WIDTH * 0.2, this.y + this.eyeOffsetY);
  }

  moveLeft(): void {
    this.setVelocityX(-PLAYER.MOVE_SPEED);
  }

  moveRight(): void {
    this.setVelocityX(PLAYER.MOVE_SPEED);
  }

  stopHorizontal(): void {
    this.setVelocityX(0);
  }

  jump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down || body.touching.down) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY);
    }
  }

  isBelowScreen(cameraScrollY: number, cameraHeight: number): boolean {
    const deathThreshold = cameraScrollY + cameraHeight + 50;
    return this.y > deathThreshold;
  }

  destroy(fromScene?: boolean): void {
    this.leftEye?.destroy();
    this.rightEye?.destroy();
    this.leftPupil?.destroy();
    this.rightPupil?.destroy();
    super.destroy(fromScene);
  }
}
