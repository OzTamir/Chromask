import Phaser from 'phaser';
import { PLAYER, CharacterDefinition, CHARACTER, VISUAL, GameColor, COLOR_HEX } from '../constants';
import { Shadow } from './Shadow';
import { ColorSwapPipeline } from '../systems/ColorSwapPipeline';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentCharacter: CharacterDefinition = CHARACTER.RUNNER;
  private leftEye: Phaser.GameObjects.Ellipse | null = null;
  private rightEye: Phaser.GameObjects.Ellipse | null = null;
  private leftPupil: Phaser.GameObjects.Ellipse | null = null;
  private rightPupil: Phaser.GameObjects.Ellipse | null = null;
  private shadow: Shadow;
  private colorSwapPipeline: ColorSwapPipeline | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-sprite');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    body.setFriction(1, 0);
    this.setScale(CHARACTER.RUNNER.scale);
    this.setSize(24, 32);
    this.setOffset(4, 0);

    this.shadow = new Shadow(scene, -5);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.updateAnimation();
    this.updateEyes();
    this.updateShadow();
  }

  private createEyes(): void {
    const eyeOffsetY = -PLAYER.HEIGHT * 0.35;
    const eyeSpacingX = PLAYER.WIDTH * 0.2;

    this.leftEye = this.scene.add.ellipse(this.x - eyeSpacingX, this.y + eyeOffsetY, 6, 8, 0xFFFFFF);
    this.rightEye = this.scene.add.ellipse(this.x + eyeSpacingX, this.y + eyeOffsetY, 6, 8, 0xFFFFFF);
    this.leftPupil = this.scene.add.ellipse(this.x - eyeSpacingX, this.y + eyeOffsetY, 3, 3, 0x333333);
    this.rightPupil = this.scene.add.ellipse(this.x + eyeSpacingX, this.y + eyeOffsetY, 3, 3, 0x333333);

    this.leftEye.setDepth(10);
    this.rightEye.setDepth(10);
    this.leftPupil.setDepth(11);
    this.rightPupil.setDepth(11);
  }

  private destroyEyes(): void {
    this.leftEye?.destroy();
    this.rightEye?.destroy();
    this.leftPupil?.destroy();
    this.rightPupil?.destroy();
    this.leftEye = null;
    this.rightEye = null;
    this.leftPupil = null;
    this.rightPupil = null;
  }

  private updateEyes(): void {
    if (!this.leftEye) return;

    const eyeOffsetY = -PLAYER.HEIGHT * 0.35;
    const eyeSpacingX = PLAYER.WIDTH * 0.2;

    this.leftEye.setPosition(this.x - eyeSpacingX, this.y + eyeOffsetY);
    this.rightEye!.setPosition(this.x + eyeSpacingX, this.y + eyeOffsetY);
    this.leftPupil!.setPosition(this.x - eyeSpacingX, this.y + eyeOffsetY);
    this.rightPupil!.setPosition(this.x + eyeSpacingX, this.y + eyeOffsetY);
  }

  private updateShadow(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isGrounded = body.blocked.down || body.touching.down;
    const camera = this.scene.cameras.main;
    const char = this.currentCharacter;
    this.shadow.update(this.x, this.y, char.hitbox.width * char.scale, char.hitbox.height * char.scale, isGrounded, camera.scrollY, camera.height, VISUAL.SHADOW_LIGHT_ANGLE);
  }

  private updateAnimation(): void {
    if (!this.currentCharacter.hasAnimations) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const velocityX = body.velocity.x;
    const velocityY = body.velocity.y;
    const onGround = body.blocked.down || body.touching.down;
    const prefix = this.currentCharacter.id;

    if (velocityX < 0) {
      this.setFlipX(true);
    } else if (velocityX > 0) {
      this.setFlipX(false);
    }

    let nextAnimation: string;

    if (!onGround) {
      if (velocityY < 0) {
        nextAnimation = `${prefix}-jump`;
      } else {
        nextAnimation = `${prefix}-fall`;
      }
    } else {
      if (Math.abs(velocityX) > 0) {
        nextAnimation = `${prefix}-run`;
      } else {
        nextAnimation = `${prefix}-idle`;
      }
    }

    if (this.anims.currentAnim?.key !== nextAnimation) {
      this.play(nextAnimation);
    }
  }

  setCharacter(character: CharacterDefinition): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const feetY = body.bottom;
    const spriteX = this.x;

    this.currentCharacter = character;
    this.setTexture(character.texture);
    this.setScale(character.scale);
    this.setSize(character.hitbox.width, character.hitbox.height);
    this.setOffset(character.hitbox.offsetX, character.hitbox.offsetY);

    const targetBodyY = feetY - character.hitbox.height;
    const targetBodyX = spriteX + character.hitbox.offsetX;

    body.reset(targetBodyX, targetBodyY);

    if (!character.hasAnimations) {
      this.anims.stop();
    } else {
      this.play(`${character.id}-idle`);
    }

    if (character.hasEyes) {
      this.createEyes();
    } else {
      this.destroyEyes();
    }

    this.setupColorSwapPipeline(character);
  }

  private setupColorSwapPipeline(character: CharacterDefinition): void {
    this.resetPostPipeline();
    this.colorSwapPipeline = null;

    if (character.colorSwap) {
      this.setPostPipeline('ColorSwapPipeline');
      const pipelines = this.getPostPipeline('ColorSwapPipeline');
      const pipeline = Array.isArray(pipelines) ? pipelines[0] : pipelines;
      if (pipeline instanceof ColorSwapPipeline) {
        this.colorSwapPipeline = pipeline;
        pipeline.setKeyHue(character.colorSwap.keyHue, character.colorSwap.hueRange);
        pipeline.setGrayscale();
      }
    }
  }

  setActiveColor(color: GameColor): void {
    if (!this.colorSwapPipeline) return;

    if (color === GameColor.NONE) {
      this.colorSwapPipeline.setGrayscale();
    } else {
      this.colorSwapPipeline.setTargetColor(COLOR_HEX[color]);
    }
  }

  getCharacter(): CharacterDefinition {
    return this.currentCharacter;
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
    this.destroyEyes();
    this.shadow.destroy();
    super.destroy(fromScene);
  }
}
