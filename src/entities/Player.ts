import Phaser from 'phaser';
import { PLAYER } from '../constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    body.setFriction(1, 0);
    this.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
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
}
