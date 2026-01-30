import Phaser from 'phaser';
import { PLATFORM, PLAYER } from '../constants';
import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { ColorSystem } from '../systems/ColorSystem';
import { PlatformSpawner } from '../systems/PlatformSpawner';
import { DifficultyManager } from '../systems/DifficultyManager';
import { ColorIndicator } from '../ui/ColorIndicator';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private colorSystem!: ColorSystem;
  private platformSpawner!: PlatformSpawner;
  private difficultyManager!: DifficultyManager;
  private colorIndicator!: ColorIndicator;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private colorKeys!: { red: Phaser.Input.Keyboard.Key; green: Phaser.Input.Keyboard.Key; blue: Phaser.Input.Keyboard.Key };

  private highestY: number = 0;
  private forcedScrollY: number = 0;
  private floorStarted: boolean = false;
  private maxScrollSpeed: number = 0;
  private scoreText!: Phaser.GameObjects.Text;

  private get gameWidth(): number {
    return this.cameras.main.width;
  }

  private get gameHeight(): number {
    return this.cameras.main.height;
  }

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Reset all scene state for new game (scene object is reused by Phaser)
    this.maxScrollSpeed = 0;

    this.setupPhysicsWorld();
    this.setupInput();
    this.setupSystems();
    this.setupPlayer();
    this.setupCamera();
    this.setupUI();
    this.setupCollision();
  }

  private setupPhysicsWorld(): void {
    this.physics.world.setBounds(0, -100000, this.gameWidth, 200000);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.colorKeys = {
      red: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      green: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      blue: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    };

    this.input.keyboard!.addCapture('W,A,S,D,SPACE,UP,DOWN,LEFT,RIGHT,ONE,TWO,THREE');
  }

  private setupSystems(): void {
    this.colorSystem = new ColorSystem();

    this.platforms = this.physics.add.staticGroup();
    this.platformSpawner = new PlatformSpawner(this, this.platforms);
    this.platformSpawner.createInitialPlatforms(this.gameWidth, this.gameHeight);

    const playerStartY = this.gameHeight - PLATFORM.HEIGHT - PLAYER.HEIGHT / 2;
    this.difficultyManager = new DifficultyManager(playerStartY);
  }

  private setupPlayer(): void {
    const groundTop = this.gameHeight - PLATFORM.HEIGHT;
    const playerY = groundTop - PLAYER.HEIGHT / 2 - 1;
    this.player = new Player(this, this.gameWidth / 2, playerY);
    this.highestY = this.player.y;
    this.forcedScrollY = 0;
    this.floorStarted = false;
  }

  private setupCamera(): void {
    this.cameras.main.scrollY = 0;
  }

  private setupUI(): void {
    this.colorIndicator = new ColorIndicator(this, 20, 20);

    this.scoreText = this.add.text(this.gameWidth - 20, 20, '0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#EEEEEE',
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    this.scale.on('resize', this.onResize, this);
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setSize(gameSize.width, gameSize.height);
    this.physics.world.setBounds(0, -100000, gameSize.width, 200000);
    this.scoreText.setX(gameSize.width - 20);
  }

  private setupCollision(): void {
    this.physics.add.collider(this.player, this.platforms, (playerObj, platformObj) => {
      const player = playerObj as Player;
      const platform = platformObj as Platform;
      const playerBody = player.body as Phaser.Physics.Arcade.Body;
      const platformBody = platform.body as Phaser.Physics.Arcade.StaticBody;

      if (playerBody.blocked.down || playerBody.touching.down) {
        const playerBottom = playerBody.bottom;
        const platformTop = platformBody.top;
        
        if (playerBottom <= platformTop + 5 && playerBody.velocity.y >= 0) {
          platform.markContacted();
        }
      }
    });
  }

  update(_time: number, delta: number): void {
    this.handleInput();
    this.updateColorFromKeys();
    this.updatePlatformSolidity();
    this.updateCamera(delta);
    this.updateSpawning();
    this.updateScore();
    this.checkDeath();
  }

  private handleInput(): void {
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                 Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                 Phaser.Input.Keyboard.JustDown(this.cursors.space!);

    if (left) {
      this.player.moveLeft();
    } else if (right) {
      this.player.moveRight();
    } else {
      this.player.stopHorizontal();
    }

    if (jump) {
      this.player.jump();
    }
  }

  private updateColorFromKeys(): void {
    const red = this.colorKeys.red.isDown;
    const green = this.colorKeys.green.isDown;
    const blue = this.colorKeys.blue.isDown;
    
    this.colorSystem.setColors(red, green, blue);
    this.colorIndicator.update(this.colorSystem);
  }

  private updatePlatformSolidity(): void {
    this.platforms.getChildren().forEach((child) => {
      const platform = child as Platform;
      const isSolid = this.colorSystem.isColorActive(platform.platformColor);
      platform.setSolid(isSolid, this.cameras.main);
      platform.updateShadow(this.cameras.main);
    });
  }

  private updateCamera(delta: number): void {
    if (this.player.y < this.highestY) {
      this.highestY = this.player.y;
    }

    const heightClimbed = this.difficultyManager.getHeightClimbed(this.highestY);
    const baseScrollSpeed = this.difficultyManager.getScrollSpeed(heightClimbed);
    
    // Ensure speed never decreases once floor starts
    this.maxScrollSpeed = Math.max(this.maxScrollSpeed, baseScrollSpeed);
    const scrollSpeed = this.maxScrollSpeed;
    
    if (scrollSpeed > 0 && !this.floorStarted) {
      this.floorStarted = true;
      this.forcedScrollY = this.cameras.main.scrollY;
    }
    
    if (this.floorStarted) {
      this.forcedScrollY -= scrollSpeed * (delta / 1000);
    }

    const targetScrollY = this.player.y - this.gameHeight / 2;
    const ratchetedScroll = Math.min(targetScrollY, this.cameras.main.scrollY);
    const finalScroll = Math.min(ratchetedScroll, this.forcedScrollY);
    
    this.cameras.main.scrollY = finalScroll;

    // Keep floor caught up with camera when player jumps ahead
    if (this.floorStarted && this.forcedScrollY > finalScroll) {
      this.forcedScrollY = finalScroll;
    }
  }

  private updateSpawning(): void {
    const heightClimbed = this.difficultyManager.getHeightClimbed(this.highestY);
    this.platformSpawner.updateDifficulty(heightClimbed);
    this.platformSpawner.spawnPlatformsAbove(this.cameras.main.scrollY);
    this.platformSpawner.cullPlatformsBelow(this.cameras.main.scrollY);
  }

  private updateScore(): void {
    const pixelHeight = this.difficultyManager.getHeightClimbed(this.highestY);
    const score = this.difficultyManager.getPlatformHeight(pixelHeight);
    this.scoreText.setText(`Height: ${score}`);
  }

  private checkDeath(): void {
    if (this.player.isBelowScreen(this.cameras.main.scrollY, this.gameHeight)) {
      const pixelHeight = this.difficultyManager.getHeightClimbed(this.highestY);
      const score = this.difficultyManager.getPlatformHeight(pixelHeight);
      this.scene.start('GameOverScene', { score });
    }
  }
}
