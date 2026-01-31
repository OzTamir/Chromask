import Phaser from 'phaser';
import { 
  DifficultyLevel, DIFFICULTY_LABELS, DIFFICULTY_DESCRIPTIONS,
  SoundMode, SoundCategory, SoundSettings, SOUND_CATEGORY_LABELS
} from '../constants';

interface SegmentData {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  difficulty: DifficultyLevel;
  index: number;
}

interface AudioSegmentData {
  mode: SoundMode;
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
}

interface ToggleData {
  bg: Phaser.GameObjects.Graphics;
  knob: Phaser.GameObjects.Graphics;
  enabled: boolean;
}

export class SettingsDialog extends Phaser.GameObjects.Container {
  private selectedDifficulty: DifficultyLevel;
  private soundSettings: SoundSettings;
  private onCloseCallback: (difficulty: DifficultyLevel, soundSettings: SoundSettings) => void;
  private segments: SegmentData[] = [];
  private audioSegments: AudioSegmentData[] = [];
  private descriptionText!: Phaser.GameObjects.Text;
  private customTogglesContainer!: Phaser.GameObjects.Container;
  private toggleStates: Map<SoundCategory, ToggleData> = new Map();

  private audioOnly: boolean = false;
  private difficultyElements: Phaser.GameObjects.GameObject[] = [];

  private panelWidth: number = 360;
  private panelHeight: number = 520;
  private currentPanelHeight: number = 0;
  private panel!: Phaser.GameObjects.Graphics;
  private closeButtonContainer!: Phaser.GameObjects.Container;

  private titleText!: Phaser.GameObjects.Text;
  private difficultyLabel!: Phaser.GameObjects.Text;
  private audioLabel!: Phaser.GameObjects.Text;
  private audioSegmentsY: number = 0;

  private readonly segmentHeight = 36;
  private readonly segmentGap = 2;
  private readonly cornerRadius = 6;

  constructor(
    scene: Phaser.Scene,
    initialDifficulty: DifficultyLevel,
    initialSoundSettings: SoundSettings,
    onClose: (difficulty: DifficultyLevel, soundSettings: SoundSettings) => void,
    audioOnly: boolean = false
  ) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    super(scene, centerX, centerY);

    this.selectedDifficulty = initialDifficulty;
    this.soundSettings = { ...initialSoundSettings, custom: { ...initialSoundSettings.custom } };
    this.onCloseCallback = onClose;
    this.audioOnly = audioOnly;

    const { width, height } = scene.cameras.main;

    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(-centerX, -centerY, width, height);
    this.add(overlay);

    const screenWidth = scene.cameras.main.width;
    const screenHeight = scene.cameras.main.height;

    this.panelWidth = Math.min(360, screenWidth * 0.9);
    this.panelHeight = this.audioOnly 
      ? Math.min(320, screenHeight * 0.5)
      : Math.min(520, screenHeight * 0.85);

    const padding = 20;
    const sectionSpacing = 25;

    this.panel = scene.add.graphics();
    this.panel.fillStyle(0x222222, 1);
    this.panel.fillRoundedRect(-this.panelWidth / 2, -this.panelHeight / 2, this.panelWidth, this.panelHeight, 12);
    this.add(this.panel);

    let currentY = -this.panelHeight / 2 + padding;

    const titleY = currentY + 15;
    this.titleText = scene.add.text(0, titleY, 'Settings', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: window.devicePixelRatio,
    }).setOrigin(0.5);
    this.add(this.titleText);
    currentY += 50;

    if (!this.audioOnly) {
      const diffLabelY = currentY;
      this.difficultyLabel = scene.add.text(
        -this.panelWidth / 2 + padding,
        diffLabelY,
        'Difficulty',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#888888',
          resolution: window.devicePixelRatio,
        }
      ).setOrigin(0, 0.5);
      this.add(this.difficultyLabel);
      this.difficultyElements.push(this.difficultyLabel);
      currentY += 25;

      const diffSegmentsY = currentY + 18;
      this.createDifficultySegmentedControl(scene, diffSegmentsY);
      currentY += 55;

      const descY = currentY;
      this.descriptionText = scene.add.text(0, descY, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#888888',
        resolution: window.devicePixelRatio,
        wordWrap: { width: this.panelWidth - 40 },
        align: 'center',
      }).setOrigin(0.5, 0);
      this.add(this.descriptionText);
      this.difficultyElements.push(this.descriptionText);
      currentY += 45;

      currentY += sectionSpacing;
    } else {
      this.difficultyLabel = scene.add.text(0, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#888888',
        resolution: window.devicePixelRatio,
      }).setOrigin(0, 0.5).setVisible(false);
      this.add(this.difficultyLabel);
      
      this.descriptionText = scene.add.text(0, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#888888',
        resolution: window.devicePixelRatio,
      }).setOrigin(0.5, 0).setVisible(false);
      this.add(this.descriptionText);
    }

    const audioLabelY = currentY;
    this.audioLabel = scene.add.text(
      -this.panelWidth / 2 + padding,
      audioLabelY,
      'Audio',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#888888',
        resolution: window.devicePixelRatio,
      }
    ).setOrigin(0, 0.5);
    this.add(this.audioLabel);
    currentY += 25;

    this.audioSegmentsY = currentY + 18;
    this.createAudioSegmentedControl(scene, this.audioSegmentsY);
    currentY += 50;

    const togglesStartY = currentY + 10;
    this.createCustomTogglesContainer(scene, togglesStartY);
    currentY = togglesStartY + 180;

    const closeButtonY = this.panelHeight / 2 - padding - 20;
    this.createCloseButton(scene, closeButtonY);

    scene.add.existing(this);
    this.setDepth(1000);
    this.setVisible(false);

    this.updateSelection();
    this.updateAudioSection();
  }

  private createDifficultySegmentedControl(scene: Phaser.Scene, y: number): void {
    const difficulties = [
      DifficultyLevel.EASY,
      DifficultyLevel.MEDIUM,
      DifficultyLevel.HARD,
      DifficultyLevel.VERY_HARD,
    ];

    const segmentWidth = Math.floor((this.panelWidth - 60) / 4);
    const totalWidth = segmentWidth * 4 + this.segmentGap * 3;
    const startX = -totalWidth / 2;

    difficulties.forEach((difficulty, index) => {
      const x = startX + index * (segmentWidth + this.segmentGap) + segmentWidth / 2;
      this.createDifficultySegment(scene, difficulty, index, x, y, difficulties.length, segmentWidth);
    });
  }

  private createDifficultySegment(
    scene: Phaser.Scene,
    difficulty: DifficultyLevel,
    index: number,
    x: number,
    y: number,
    totalSegments: number,
    segmentWidth: number
  ): void {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    container.add(bg);

    const text = scene.add.text(0, 0, DIFFICULTY_LABELS[difficulty], {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#aaaaaa',
      fontStyle: 'bold',
      resolution: window.devicePixelRatio,
    }).setOrigin(0.5);
    container.add(text);

    const segmentData: SegmentData = {
      container,
      bg,
      text,
      difficulty,
      index,
    };
    this.segments.push(segmentData);

    this.drawDifficultySegment(segmentData, false, false, totalSegments, segmentWidth);

    const hitArea = new Phaser.Geom.Rectangle(
      -segmentWidth / 2,
      -this.segmentHeight / 2,
      segmentWidth,
      this.segmentHeight
    );
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      if (this.selectedDifficulty !== difficulty) {
        this.drawDifficultySegment(segmentData, false, true, totalSegments, segmentWidth);
      }
    });

    container.on('pointerout', () => {
      const isSelected = this.selectedDifficulty === difficulty;
      this.drawDifficultySegment(segmentData, isSelected, false, totalSegments, segmentWidth);
    });

    container.on('pointerdown', () => {
      this.selectedDifficulty = difficulty;
      this.updateSelection();
    });

    this.add(container);
    this.difficultyElements.push(container);
  }

  private drawDifficultySegment(
    segment: SegmentData,
    selected: boolean,
    hovered: boolean,
    totalSegments: number,
    segmentWidth: number
  ): void {
    const { bg, text, index } = segment;
    const w = segmentWidth;
    const h = this.segmentHeight;
    const r = this.cornerRadius;

    bg.clear();

    let bgColor: number;
    if (selected) {
      bgColor = 0x4488ff;
    } else if (hovered) {
      bgColor = 0x444444;
    } else {
      bgColor = 0x333333;
    }

    bg.fillStyle(bgColor, 1);

    const isFirst = index === 0;
    const isLast = index === totalSegments - 1;

    if (isFirst && isLast) {
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    } else if (isFirst) {
      this.drawPartialRoundedRect(bg, -w / 2, -h / 2, w, h, {
        tl: r, tr: 0, bl: r, br: 0
      });
    } else if (isLast) {
      this.drawPartialRoundedRect(bg, -w / 2, -h / 2, w, h, {
        tl: 0, tr: r, bl: 0, br: r
      });
    } else {
      bg.fillRect(-w / 2, -h / 2, w, h);
    }

    text.setColor(selected ? '#ffffff' : '#aaaaaa');
  }

  private createAudioSegmentedControl(scene: Phaser.Scene, y: number): void {
    const modes = [SoundMode.ON, SoundMode.OFF, SoundMode.CUSTOM];
    const labels = { [SoundMode.ON]: 'On', [SoundMode.OFF]: 'Off', [SoundMode.CUSTOM]: 'Custom' };

    const audioSegmentWidth = Math.floor((this.panelWidth - 50) / 3);
    const totalWidth = audioSegmentWidth * 3 + this.segmentGap * 2;
    const startX = -totalWidth / 2;

    modes.forEach((mode, index) => {
      const x = startX + index * (audioSegmentWidth + this.segmentGap) + audioSegmentWidth / 2;
      this.createAudioSegment(scene, mode, labels[mode], index, x, y, modes.length, audioSegmentWidth);
    });
  }

  private createAudioSegment(
    scene: Phaser.Scene,
    mode: SoundMode,
    label: string,
    index: number,
    x: number,
    y: number,
    totalSegments: number,
    audioSegmentWidth: number
  ): void {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    container.add(bg);

    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#aaaaaa',
      fontStyle: 'bold',
      resolution: window.devicePixelRatio,
    }).setOrigin(0.5);
    container.add(text);

    const segmentData: AudioSegmentData = {
      mode,
      container,
      bg,
      text,
    };
    this.audioSegments.push(segmentData);

    this.drawAudioSegment(segmentData, false, false, index, totalSegments, audioSegmentWidth);

    const hitArea = new Phaser.Geom.Rectangle(
      -audioSegmentWidth / 2,
      -this.segmentHeight / 2,
      audioSegmentWidth,
      this.segmentHeight
    );
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      if (this.soundSettings.mode !== mode) {
        this.drawAudioSegment(segmentData, false, true, index, totalSegments, audioSegmentWidth);
      }
    });

    container.on('pointerout', () => {
      const isSelected = this.soundSettings.mode === mode;
      this.drawAudioSegment(segmentData, isSelected, false, index, totalSegments, audioSegmentWidth);
    });

    container.on('pointerdown', () => {
      this.soundSettings.mode = mode;
      this.updateAudioSection();
    });

    this.add(container);
  }

  private drawAudioSegment(
    segment: AudioSegmentData,
    selected: boolean,
    hovered: boolean,
    index: number,
    totalSegments: number,
    audioSegmentWidth: number
  ): void {
    const { bg, text } = segment;
    const w = audioSegmentWidth;
    const h = this.segmentHeight;
    const r = this.cornerRadius;

    bg.clear();

    let bgColor: number;
    if (selected) {
      bgColor = 0x4488ff;
    } else if (hovered) {
      bgColor = 0x444444;
    } else {
      bgColor = 0x333333;
    }

    bg.fillStyle(bgColor, 1);

    const isFirst = index === 0;
    const isLast = index === totalSegments - 1;

    if (isFirst && isLast) {
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    } else if (isFirst) {
      this.drawPartialRoundedRect(bg, -w / 2, -h / 2, w, h, {
        tl: r, tr: 0, bl: r, br: 0
      });
    } else if (isLast) {
      this.drawPartialRoundedRect(bg, -w / 2, -h / 2, w, h, {
        tl: 0, tr: r, bl: 0, br: r
      });
    } else {
      bg.fillRect(-w / 2, -h / 2, w, h);
    }

    text.setColor(selected ? '#ffffff' : '#aaaaaa');
  }

  private createCustomTogglesContainer(scene: Phaser.Scene, startY: number): void {
    this.customTogglesContainer = scene.add.container(0, startY);

    const categories = [
      SoundCategory.JUMP,
      SoundCategory.LANDING,
      SoundCategory.UI,
      SoundCategory.MUSIC,
    ];

    const rowHeight = 36;
    const toggleWidth = 44;
    const toggleHeight = 24;
    const labelX = -this.panelWidth / 2 + 30;
    const toggleX = this.panelWidth / 2 - 50;

    categories.forEach((category, index) => {
      const rowY = index * rowHeight;

      const label = scene.add.text(labelX, rowY, SOUND_CATEGORY_LABELS[category], {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#aaaaaa',
        resolution: window.devicePixelRatio,
      }).setOrigin(0, 0.5);
      this.customTogglesContainer.add(label);

      const toggleContainer = scene.add.container(toggleX, rowY);
      
      const bg = scene.add.graphics();
      toggleContainer.add(bg);

      const knob = scene.add.graphics();
      toggleContainer.add(knob);

      const enabled = this.soundSettings.custom[category];
      const toggleData: ToggleData = { bg, knob, enabled };
      this.toggleStates.set(category, toggleData);

      this.drawToggle(toggleData, toggleWidth, toggleHeight);

      const hitArea = new Phaser.Geom.Rectangle(
        -toggleWidth / 2,
        -toggleHeight / 2,
        toggleWidth,
        toggleHeight
      );
      toggleContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      toggleContainer.input!.cursor = 'pointer';

      toggleContainer.on('pointerdown', () => {
        const data = this.toggleStates.get(category);
        if (data) {
          data.enabled = !data.enabled;
          this.soundSettings.custom[category] = data.enabled;
          this.drawToggle(data, toggleWidth, toggleHeight);
        }
      });

      this.customTogglesContainer.add(toggleContainer);
    });

    this.add(this.customTogglesContainer);
  }

  private drawToggle(toggleData: ToggleData, width: number, height: number): void {
    const { bg, knob, enabled } = toggleData;
    const knobDiameter = 20;
    const knobRadius = knobDiameter / 2;
    const padding = (height - knobDiameter) / 2;

    bg.clear();
    bg.fillStyle(enabled ? 0x4488ff : 0x333333, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);

    knob.clear();
    knob.fillStyle(0xffffff, 1);
    
    const knobX = enabled 
      ? width / 2 - knobRadius - padding 
      : -width / 2 + knobRadius + padding;
    
    knob.fillCircle(knobX, 0, knobRadius);
  }

  private updateAudioSection(): void {
    const totalSegments = this.audioSegments.length;
    const audioSegmentWidth = Math.floor((this.panelWidth - 50) / 3);
    
    this.audioSegments.forEach((segment, index) => {
      const isSelected = segment.mode === this.soundSettings.mode;
      this.drawAudioSegment(segment, isSelected, false, index, totalSegments, audioSegmentWidth);
    });

    const showCustom = this.soundSettings.mode === SoundMode.CUSTOM;
    this.customTogglesContainer.setVisible(showCustom);

    if (showCustom) {
      const toggleWidth = 44;
      const toggleHeight = 24;
      this.toggleStates.forEach((toggleData, category) => {
        toggleData.enabled = this.soundSettings.custom[category];
        this.drawToggle(toggleData, toggleWidth, toggleHeight);
      });
    }

    this.updatePanelSize();
  }

  private calculatePanelHeight(): number {
    const padding = 20;
    const titleHeight = 50;
    const sectionHeight = 80;
    const descriptionHeight = 45;
    const sectionGap = 25;
    const togglesHeight = this.soundSettings.mode === SoundMode.CUSTOM ? 196 : 0;
    const closeButtonHeight = 60;

    if (this.audioOnly) {
      return padding + titleHeight + sectionHeight + togglesHeight + closeButtonHeight + padding;
    } else {
      return padding + titleHeight + sectionHeight + descriptionHeight + sectionGap + sectionHeight + togglesHeight + closeButtonHeight + padding;
    }
  }

  private updatePanelSize(): void {
    const newHeight = this.calculatePanelHeight();
    if (newHeight === this.currentPanelHeight) return;

    this.currentPanelHeight = newHeight;
    this.panelHeight = newHeight;

    this.panel.clear();
    this.panel.fillStyle(0x222222, 1);
    this.panel.fillRoundedRect(-this.panelWidth / 2, -newHeight / 2, this.panelWidth, newHeight, 12);

    const padding = 20;
    const closeButtonY = newHeight / 2 - padding - 20;
    this.closeButtonContainer.setY(closeButtonY);

    this.repositionContent(newHeight);
  }

  private repositionContent(panelHeight: number): void {
    const panelTop = -panelHeight / 2;
    const padding = 20;

    let y = panelTop + padding;

    this.titleText.setY(y + 15);
    y += 50;

    if (!this.audioOnly) {
      this.difficultyLabel.setY(y);
      y += 25;
      
      const segmentWidth = Math.floor((this.panelWidth - 60) / 4);
      const totalWidth = segmentWidth * 4 + this.segmentGap * 3;
      const startX = -totalWidth / 2;
      this.segments.forEach((seg, index) => {
        const x = startX + index * (segmentWidth + this.segmentGap) + segmentWidth / 2;
        seg.container.setPosition(x, y + 18);
      });
      y += 55;

      this.descriptionText.setY(y);
      y += 45 + 25;
    }

    this.audioLabel.setY(y);
    y += 25;

    const audioSegmentWidth = Math.floor((this.panelWidth - 50) / 3);
    const totalWidth = audioSegmentWidth * 3 + this.segmentGap * 2;
    const startX = -totalWidth / 2;
    this.audioSegments.forEach((seg, index) => {
      const x = startX + index * (audioSegmentWidth + this.segmentGap) + audioSegmentWidth / 2;
      seg.container.setPosition(x, y + 18);
    });
    y += 50;

    if (this.soundSettings.mode === SoundMode.CUSTOM) {
      this.customTogglesContainer.setY(y + 10);
    }
  }

  private drawPartialRoundedRect(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    corners: { tl: number; tr: number; bl: number; br: number }
  ): void {
    const { tl, tr, bl, br } = corners;

    graphics.beginPath();

    // Start at top-left after corner
    graphics.moveTo(x + tl, y);

    // Top edge to top-right corner
    graphics.lineTo(x + width - tr, y);

    // Top-right corner
    if (tr > 0) {
      graphics.arc(x + width - tr, y + tr, tr, -Math.PI / 2, 0, false);
    } else {
      graphics.lineTo(x + width, y);
    }

    // Right edge to bottom-right corner
    graphics.lineTo(x + width, y + height - br);

    // Bottom-right corner
    if (br > 0) {
      graphics.arc(x + width - br, y + height - br, br, 0, Math.PI / 2, false);
    } else {
      graphics.lineTo(x + width, y + height);
    }

    // Bottom edge to bottom-left corner
    graphics.lineTo(x + bl, y + height);

    // Bottom-left corner
    if (bl > 0) {
      graphics.arc(x + bl, y + height - bl, bl, Math.PI / 2, Math.PI, false);
    } else {
      graphics.lineTo(x, y + height);
    }

    // Left edge to top-left corner
    graphics.lineTo(x, y + tl);

    // Top-left corner
    if (tl > 0) {
      graphics.arc(x + tl, y + tl, tl, Math.PI, Math.PI * 1.5, false);
    } else {
      graphics.lineTo(x, y);
    }

    graphics.closePath();
    graphics.fillPath();
  }

  private createCloseButton(scene: Phaser.Scene, y: number): void {
    const buttonWidth = 120;
    const buttonHeight = 40;

    this.closeButtonContainer = scene.add.container(0, y);

    const bg = scene.add.graphics();
    this.drawBeveledButton(bg, buttonWidth, buttonHeight, 0x555555, 0x777777, 0x333333);
    this.closeButtonContainer.add(bg);

    const text = scene.add.text(0, 0, 'Close', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: window.devicePixelRatio,
    }).setOrigin(0.5);
    this.closeButtonContainer.add(text);

    const hitArea = new Phaser.Geom.Rectangle(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight
    );
    this.closeButtonContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.closeButtonContainer.input!.cursor = 'pointer';

    this.closeButtonContainer.on('pointerover', () => {
      this.drawBeveledButton(bg, buttonWidth, buttonHeight, 0x666666, 0x888888, 0x444444);
    });

    this.closeButtonContainer.on('pointerout', () => {
      this.drawBeveledButton(bg, buttonWidth, buttonHeight, 0x555555, 0x777777, 0x333333);
    });

    this.closeButtonContainer.on('pointerdown', () => {
      this.onCloseCallback(this.selectedDifficulty, this.soundSettings);
      this.hide();
    });

    this.add(this.closeButtonContainer);
  }

  private drawBeveledButton(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    bg: number,
    hi: number,
    sh: number
  ): void {
    const bevelSize = 3;
    graphics.clear();

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

  private updateSelection(): void {
    const totalSegments = this.segments.length;
    const segmentWidth = Math.floor((this.panelWidth - 60) / 4);

    this.segments.forEach((segment) => {
      const isSelected = segment.difficulty === this.selectedDifficulty;
      this.drawDifficultySegment(segment, isSelected, false, totalSegments, segmentWidth);
    });

    this.descriptionText.setText(DIFFICULTY_DESCRIPTIONS[this.selectedDifficulty]);
  }

  private repositionForMode(): void {
    this.currentPanelHeight = 0;
    this.updatePanelSize();
  }

  show(currentDifficulty?: DifficultyLevel, currentSoundSettings?: SoundSettings, audioOnly?: boolean): void {
    if (audioOnly !== undefined && audioOnly !== this.audioOnly) {
      this.audioOnly = audioOnly;
      this.difficultyElements.forEach(el => {
        if (el && 'setVisible' in el) {
          (el as Phaser.GameObjects.Container).setVisible(!audioOnly);
        }
      });
      this.repositionForMode();
    }

    if (currentDifficulty !== undefined) {
      this.selectedDifficulty = currentDifficulty;
      this.updateSelection();
    }
    if (currentSoundSettings !== undefined) {
      this.soundSettings = { ...currentSoundSettings, custom: { ...currentSoundSettings.custom } };
      this.updateAudioSection();
    }
    const camera = this.scene.cameras.main;
    this.setPosition(camera.width / 2, camera.scrollY + camera.height / 2);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  isVisible(): boolean {
    return this.visible;
  }

  getSelectedDifficulty(): DifficultyLevel {
    return this.selectedDifficulty;
  }

  getSoundSettings(): SoundSettings {
    return { ...this.soundSettings, custom: { ...this.soundSettings.custom } };
  }
}
