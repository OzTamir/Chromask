import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number }): void {
    const { width, height } = this.cameras.main;
    
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2, `Height: ${data.score ?? 0}`, {
      fontSize: '32px',
      color: '#ffff00',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height * 0.7, 'Press SPACE to restart', {
      fontSize: '20px',
      color: '#888888',
    }).setOrigin(0.5);
    
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
