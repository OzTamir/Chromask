import Phaser from 'phaser';
import { GAME, PLAYER } from './constants';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME.BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  input: {
    keyboard: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PLAYER.GRAVITY },
      debug: false,
    },
  },
  scene: [PreloadScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
