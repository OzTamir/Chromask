import Phaser from 'phaser';
import { SettingsDialog } from '../ui/SettingsDialog';
import { 
  DifficultyLevel, STORAGE, 
  SoundSettings, DEFAULT_SOUND_SETTINGS 
} from '../constants';

interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface ButtonColors {
  background: number;
  highlight: number;
  shadow: number;
  text: string;
  alpha: number;
}

export class MainMenuScene extends Phaser.Scene {
  private settingsDialog!: SettingsDialog;
  private currentDifficulty: DifficultyLevel = DifficultyLevel.MEDIUM;
  private currentSoundSettings: SoundSettings = { ...DEFAULT_SOUND_SETTINGS };

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.createWordmark(width, height);

    this.currentDifficulty = this.loadDifficulty();
    this.currentSoundSettings = this.loadSoundSettings();
    this.settingsDialog = new SettingsDialog(
      this,
      this.currentDifficulty,
      this.currentSoundSettings,
      (difficulty: DifficultyLevel, soundSettings: SoundSettings) => {
        this.currentDifficulty = difficulty;
        this.currentSoundSettings = soundSettings;
        this.saveDifficulty(difficulty);
        this.saveSoundSettings(soundSettings);
      }
    );

    // Calculate button positions centered between title and footer
    const titleBottom = height * 0.3;
    const footerTop = height * 0.88;
    const availableSpace = footerTop - titleBottom;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    const totalButtonsHeight = buttonHeight * 3 + buttonSpacing * 2;
    const startY = titleBottom + (availableSpace - totalButtonsHeight) / 2 + buttonHeight / 2;

    this.createButton({
      x: width / 2,
      y: startY,
      width: 200,
      height: buttonHeight,
      text: 'Play Now',
      onClick: () => this.scene.start('GameScene', { difficulty: this.currentDifficulty, soundSettings: this.currentSoundSettings }),
    });

    this.createButton({
      x: width / 2,
      y: startY + buttonHeight + buttonSpacing,
      width: 200,
      height: buttonHeight,
      text: 'Leaderboard',
      disabled: true,
    });

    this.createButton({
      x: width / 2,
      y: startY + (buttonHeight + buttonSpacing) * 2,
      width: 200,
      height: buttonHeight,
      text: 'Settings',
      onClick: () => this.settingsDialog.show(this.currentDifficulty, this.currentSoundSettings),
    });

    this.createFooterLink(width, height);
    this.createCredits(width, height);
  }

  private createWordmark(screenWidth: number, screenHeight: number): void {
    const wordmark = this.add.image(screenWidth / 2, screenHeight * 0.2, 'wordmark');
    const maxWidth = screenWidth * 0.8;
    const scaleFactor = 0.7;
    if (wordmark.width > maxWidth) {
      wordmark.setScale((maxWidth / wordmark.width) * scaleFactor);
    } else {
      wordmark.setScale(scaleFactor);
    }
  }

  private getButtonColors(disabled: boolean): ButtonColors {
    if (disabled) {
      return {
        background: 0x888888,
        highlight: 0x999999,
        shadow: 0x666666,
        text: '#666666',
        alpha: 0.5,
      };
    }
    return {
      background: 0x555555,
      highlight: 0x777777,
      shadow: 0x333333,
      text: '#ffffff',
      alpha: 1,
    };
  }

  private drawBeveledButton(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    bg: number,
    hi: number,
    sh: number,
    alpha: number
  ): void {
    const bevelSize = 3;
    graphics.clear();
    graphics.setAlpha(alpha);

    graphics.fillStyle(bg);
    graphics.fillRect(-width / 2, -height / 2, width, height);

    graphics.fillStyle(hi);
    graphics.fillRect(-width / 2, -height / 2, width, bevelSize);
    graphics.fillRect(-width / 2, -height / 2, bevelSize, height);

    graphics.fillStyle(sh);
    graphics.fillRect(-width / 2, height / 2 - bevelSize, width, bevelSize);
    graphics.fillRect(width / 2 - bevelSize, -height / 2, bevelSize, height);

    graphics.fillStyle(bg);
    graphics.fillRect(
      -width / 2 + bevelSize,
      -height / 2 + bevelSize,
      width - bevelSize * 2,
      height - bevelSize * 2
    );
  }

  private createButton(config: ButtonConfig): Phaser.GameObjects.Container {
    const { x, y, width, height, text, disabled = false, onClick } = config;

    const colors = this.getButtonColors(disabled);
    const hoverColors = { background: 0x666666, highlight: 0x888888, shadow: 0x444444 };

    const graphics = this.add.graphics();
    this.drawBeveledButton(graphics, width, height, colors.background, colors.highlight, colors.shadow, colors.alpha);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: colors.text,
      fontStyle: 'bold',
      resolution: window.devicePixelRatio,
    }).setOrigin(0.5);

    if (disabled) {
      buttonText.setAlpha(0.7);
    }

    const container = this.add.container(x, y, [graphics, buttonText]);

    if (!disabled && onClick) {
      const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      container.input!.cursor = 'pointer';

      container.on('pointerover', () => {
        this.drawBeveledButton(graphics, width, height, hoverColors.background, hoverColors.highlight, hoverColors.shadow, 1);
      });

      container.on('pointerout', () => {
        this.drawBeveledButton(graphics, width, height, colors.background, colors.highlight, colors.shadow, colors.alpha);
      });

      container.on('pointerdown', onClick);
    }

    return container;
  }

   private createFooterLink(screenWidth: number, screenHeight: number): void {
     const footerText = this.add.text(
       screenWidth / 2,
       screenHeight * 0.92,
       'Global Game Jam 2026',
       {
         fontFamily: 'Arial, sans-serif',
         fontSize: '14px',
         color: '#888888',
         resolution: window.devicePixelRatio,
       }
     ).setOrigin(0.5);

     const underline = this.add.graphics();
     const textBounds = footerText.getBounds();

     const drawUnderline = (color: number) => {
       underline.clear();
       underline.lineStyle(1, color, 1);
       underline.lineBetween(textBounds.x, textBounds.bottom + 2, textBounds.x + textBounds.width, textBounds.bottom + 2);
     };

     drawUnderline(0x888888);

     footerText.setInteractive({ useHandCursor: true });

     footerText.on('pointerover', () => {
       footerText.setColor('#666666');
       drawUnderline(0x666666);
     });

     footerText.on('pointerout', () => {
       footerText.setColor('#888888');
       drawUnderline(0x888888);
     });

    footerText.on('pointerdown', () => {
      window.open('https://github.com/OzTamir/Chromask', '_blank');
    });
  }

  private createCredits(screenWidth: number, screenHeight: number): void {
    const creditsY = screenHeight * 0.96;
    
    const creditConfigs = [
      { name: 'Oz Tamir', url: 'https://github.com/OzTamir' },
      { name: 'Eden Rozen', url: 'https://github.com/FistOfFury' },
      { name: 'Eva Osherovsky', url: 'https://github.com/evoosa' },
      { name: 'Noam Gal', url: 'https://github.com/i-am-noamg' },
    ];

    const fontSize = 12;
    const separator = ' | ';
    

    const byText = this.add.text(0, creditsY, 'By: ', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#666666',
      resolution: window.devicePixelRatio,
    });


    let totalWidth = byText.width;
    const nameWidths: number[] = [];
    const sepWidths: number[] = [];

    creditConfigs.forEach((config, index) => {
      const tempName = this.add.text(0, 0, config.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#666666',
        resolution: window.devicePixelRatio,
      });
      nameWidths.push(tempName.width);
      totalWidth += tempName.width;
      tempName.destroy();

      if (index < creditConfigs.length - 1) {
        const tempSep = this.add.text(0, 0, separator, {
          fontFamily: 'Arial, sans-serif',
          fontSize: `${fontSize}px`,
          color: '#666666',
          resolution: window.devicePixelRatio,
        });
        sepWidths.push(tempSep.width);
        totalWidth += tempSep.width;
        tempSep.destroy();
      }
    });


    const startX = (screenWidth - totalWidth) / 2;
    let currentX = startX;

    byText.setPosition(currentX, creditsY);
    currentX += byText.width;

    creditConfigs.forEach((config, index) => {
      const nameX = currentX;
      
      const nameText = this.add.text(nameX, creditsY, config.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#666666',
        resolution: window.devicePixelRatio,
      });

      const underline = this.add.graphics();

      const drawUnderline = (color: number) => {
        underline.clear();
        underline.lineStyle(1, color, 1);
        underline.lineBetween(nameX, creditsY + nameText.height - 2, nameX + nameWidths[index], creditsY + nameText.height - 2);
      };

      drawUnderline(0x666666);

      nameText.setInteractive({ useHandCursor: true });

      nameText.on('pointerover', () => {
        nameText.setColor('#444444');
        drawUnderline(0x444444);
      });

      nameText.on('pointerout', () => {
        nameText.setColor('#666666');
        drawUnderline(0x666666);
      });

      nameText.on('pointerdown', () => {
        window.open(config.url, '_blank');
      });

      currentX += nameWidths[index];

      if (index < creditConfigs.length - 1) {
        this.add.text(currentX, creditsY, separator, {
          fontFamily: 'Arial, sans-serif',
          fontSize: `${fontSize}px`,
          color: '#666666',
          resolution: window.devicePixelRatio,
        });
        currentX += sepWidths[index];
      }
    });
  }

  private loadDifficulty(): DifficultyLevel {
    const saved = localStorage.getItem(STORAGE.SELECTED_DIFFICULTY);
    if (saved !== null && Object.values(DifficultyLevel).includes(saved as DifficultyLevel)) {
      return saved as DifficultyLevel;
    }
    return DifficultyLevel.MEDIUM;
  }

  private saveDifficulty(difficulty: DifficultyLevel): void {
    localStorage.setItem(STORAGE.SELECTED_DIFFICULTY, difficulty);
  }

  private loadSoundSettings(): SoundSettings {
    const saved = localStorage.getItem(STORAGE.SOUND_SETTINGS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved) as SoundSettings;
        return { ...DEFAULT_SOUND_SETTINGS, ...parsed, custom: { ...DEFAULT_SOUND_SETTINGS.custom, ...parsed.custom } };
      } catch {
        return { ...DEFAULT_SOUND_SETTINGS };
      }
    }
    return { ...DEFAULT_SOUND_SETTINGS };
  }

  private saveSoundSettings(settings: SoundSettings): void {
    localStorage.setItem(STORAGE.SOUND_SETTINGS, JSON.stringify(settings));
  }
}
