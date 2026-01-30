# CHROMASK — Technical Specification

> Endless vertical climber with additive color-mixing mechanics  
> Target: 48-72 hour game jam

---

## 1. Technical Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Engine** | Phaser 3.90 | Proven platformer support, extensive docs, Arcade physics |
| **Physics** | Arcade | Simple AABB collision, perfect for platformers, fast |
| **Language** | TypeScript | Type safety, better IDE support, catches bugs early |
| **Build** | Vite | Fast HMR, modern ESM, minimal config |
| **Platform** | Web (desktop) | Keyboard-only controls |

### Project Setup

```bash
npm create vite@latest chromask -- --template vanilla-ts
cd chromask
npm install phaser
npm run dev
```

### File Structure

```
chromask/
├── src/
│   ├── main.ts              # Entry point, Phaser config
│   ├── scenes/
│   │   ├── GameScene.ts     # Main gameplay
│   │   ├── GameOverScene.ts # Death screen + restart
│   │   └── PreloadScene.ts  # Asset loading (minimal)
│   ├── entities/
│   │   ├── Player.ts        # Player sprite + physics
│   │   └── Platform.ts      # Platform with color state
│   ├── systems/
│   │   ├── ColorSystem.ts   # Active color calculation
│   │   ├── PlatformSpawner.ts # Procedural generation
│   │   └── DifficultyManager.ts # Scroll speed, spacing
│   ├── ui/
│   │   └── ColorIndicator.ts # HUD showing active colors
│   └── constants.ts         # Game constants
├── public/
│   └── (audio files if any)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 2. Color System

### 2.1 Color Enum

```typescript
// constants.ts
export enum GameColor {
  NONE    = 0b000,  // 0 - no platforms solid
  RED     = 0b001,  // 1
  GREEN   = 0b010,  // 2
  BLUE    = 0b100,  // 4
  YELLOW  = 0b011,  // 3 (R + G)
  MAGENTA = 0b101,  // 5 (R + B)
  CYAN    = 0b110,  // 6 (G + B)
  WHITE   = 0b111,  // 7 (R + G + B)
}

export const COLOR_HEX: Record<GameColor, number> = {
  [GameColor.NONE]:    0x333333, // Dark gray (for UI only)
  [GameColor.RED]:     0xFF3333,
  [GameColor.GREEN]:   0x33FF33,
  [GameColor.BLUE]:    0x3333FF,
  [GameColor.YELLOW]:  0xFFFF33,
  [GameColor.MAGENTA]: 0xFF33FF,
  [GameColor.CYAN]:    0x33FFFF,
  [GameColor.WHITE]:   0xFFFFFF,
};
```

### 2.2 Active Color Calculation

```typescript
// systems/ColorSystem.ts
export class ColorSystem {
  private redEnabled = false;
  private greenEnabled = false;
  private blueEnabled = false;

  toggleRed(): void   { this.redEnabled = !this.redEnabled; }
  toggleGreen(): void { this.greenEnabled = !this.greenEnabled; }
  toggleBlue(): void  { this.blueEnabled = !this.blueEnabled; }

  getActiveColor(): GameColor {
    let color = GameColor.NONE;
    if (this.redEnabled)   color |= GameColor.RED;
    if (this.greenEnabled) color |= GameColor.GREEN;
    if (this.blueEnabled)  color |= GameColor.BLUE;
    return color;
  }

  isColorActive(platformColor: GameColor): boolean {
    return this.getActiveColor() === platformColor;
  }
}
```

### 2.3 Collision Rule

**CRITICAL**: Platform collision is BINARY based on EXACT color match.

```typescript
// In GameScene.update()
this.platforms.children.iterate((platform: Platform) => {
  const isSolid = this.colorSystem.isColorActive(platform.color);
  platform.body.enable = isSolid;
  platform.setAlpha(isSolid ? 1.0 : 0.4);
});
```

---

## 3. Controls

### 3.1 Key Bindings

| Action | Primary | Alternate |
|--------|---------|-----------|
| Move Left | `←` Arrow | `A` |
| Move Right | `→` Arrow | `D` |
| Jump | `↑` Arrow | `W` / `Space` |
| Toggle Red | `1` | - |
| Toggle Green | `2` | - |
| Toggle Blue | `3` | - |

### 3.2 Input Setup

```typescript
// In GameScene.create()
this.cursors = this.input.keyboard!.createCursorKeys();
this.wasd = this.input.keyboard!.addKeys({
  up: Phaser.Input.Keyboard.KeyCodes.W,
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D,
});
this.colorKeys = this.input.keyboard!.addKeys({
  red: Phaser.Input.Keyboard.KeyCodes.ONE,
  green: Phaser.Input.Keyboard.KeyCodes.TWO,
  blue: Phaser.Input.Keyboard.KeyCodes.THREE,
});

// Prevent browser scroll
this.input.keyboard!.addCapture('W,A,S,D,SPACE,UP,DOWN,LEFT,RIGHT');
```

### 3.3 Movement Constants

```typescript
export const PLAYER = {
  MOVE_SPEED: 300,      // pixels/second horizontal
  JUMP_VELOCITY: -500,  // negative = up
  GRAVITY: 800,         // pixels/second²
};
```

---

## 4. Physics & Collision

### 4.1 World Setup

```typescript
// main.ts Phaser config
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PLAYER.GRAVITY },
      debug: false, // Toggle for development
    },
  },
  scene: [PreloadScene, GameScene, GameOverScene],
};
```

### 4.2 World Bounds

```typescript
// Extend world vertically for endless scrolling
this.physics.world.setBounds(0, -100000, 480, 200000);
this.player.setCollideWorldBounds(true);
```

### 4.3 Platform Physics

- Platforms are **Static Bodies** (don't move, no gravity)
- Use `refreshBody()` after any position/scale changes
- Collision enabled/disabled per-frame based on color match

```typescript
// entities/Platform.ts
export class Platform extends Phaser.Physics.Arcade.Sprite {
  public color: GameColor;

  constructor(scene: Phaser.Scene, x: number, y: number, color: GameColor) {
    super(scene, x, y, 'platform');
    this.color = color;
    this.setTint(COLOR_HEX[color]);
    
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body
  }
}
```

---

## 5. Camera & Scrolling

### 5.1 Camera Behavior

- Camera follows player **vertically only**
- Camera **never scrolls down** (ratchet behavior)
- Horizontal camera is locked

```typescript
// In GameScene.create()
this.cameras.main.startFollow(this.player, true, 0, 1);
this.cameras.main.setDeadzone(0, 100); // Look-ahead buffer

// Track highest point for ratchet
private highestY: number = 0;

// In update()
if (this.player.y < this.highestY) {
  this.highestY = this.player.y;
} else {
  // Force camera to stay at highest point (ratchet)
  this.cameras.main.scrollY = Math.min(
    this.cameras.main.scrollY,
    this.highestY - 200
  );
}
```

### 5.2 Death Detection

```typescript
// In update()
const screenBottom = this.cameras.main.scrollY + 720 + 50; // 50px grace
if (this.player.y > screenBottom) {
  this.scene.start('GameOverScene', { score: this.score });
}
```

---

## 6. Platform Generation

### 6.1 Spawning Rules

```typescript
export const PLATFORM = {
  WIDTH: 100,
  HEIGHT: 20,
  MIN_GAP_X: 60,   // Minimum horizontal distance
  MAX_GAP_X: 200,  // Maximum horizontal distance  
  MIN_GAP_Y: 60,   // Minimum vertical distance
  MAX_GAP_Y: 120,  // Maximum vertical distance (scales with difficulty)
};
```

### 6.2 Color Distribution

Early game → fewer colors. Late game → all colors.

```typescript
// systems/PlatformSpawner.ts
getAvailableColors(height: number): GameColor[] {
  // Height is negative (higher = more negative)
  const absHeight = Math.abs(height);
  
  if (absHeight < 1000) {
    // Phase 1: Primary colors only
    return [GameColor.RED, GameColor.GREEN, GameColor.BLUE];
  } else if (absHeight < 3000) {
    // Phase 2: Add secondary colors
    return [
      GameColor.RED, GameColor.GREEN, GameColor.BLUE,
      GameColor.YELLOW, GameColor.MAGENTA, GameColor.CYAN,
    ];
  } else {
    // Phase 3: All colors including white
    return Object.values(GameColor).filter(c => c !== GameColor.NONE);
  }
}
```

### 6.3 Procedural Algorithm

```typescript
spawnPlatformsAbove(currentY: number): void {
  const spawnUntil = currentY - 800; // Spawn 800px ahead
  
  while (this.lastSpawnY > spawnUntil) {
    const gapY = Phaser.Math.Between(PLATFORM.MIN_GAP_Y, this.currentMaxGapY);
    this.lastSpawnY -= gapY;
    
    const x = Phaser.Math.Between(50, 430); // Keep on screen
    const colors = this.getAvailableColors(this.lastSpawnY);
    const color = Phaser.Math.RND.pick(colors);
    
    this.createPlatform(x, this.lastSpawnY, color);
  }
}
```

### 6.4 Cleanup

```typescript
// In update() - remove platforms below screen
const cullY = this.cameras.main.scrollY + 800;
this.platforms.children.iterate((platform: Platform) => {
  if (platform.y > cullY) {
    platform.destroy();
  }
});
```

---

## 7. Difficulty Progression

### 7.1 Parameters

```typescript
export const DIFFICULTY = {
  // Scroll speed (camera push)
  INITIAL_SCROLL_SPEED: 0,      // No forced scroll at start
  MAX_SCROLL_SPEED: 100,        // pixels/second
  SCROLL_ACCELERATION: 0.5,    // per second
  
  // Platform spacing
  INITIAL_MAX_GAP_Y: 80,
  FINAL_MAX_GAP_Y: 150,
  
  // Platform size
  INITIAL_PLATFORM_WIDTH: 120,
  FINAL_PLATFORM_WIDTH: 60,
  
  // Timeline (in pixels of height climbed)
  PHASE_2_HEIGHT: 1000,  // Secondary colors appear
  PHASE_3_HEIGHT: 3000,  // White platforms appear
  MAX_DIFFICULTY_HEIGHT: 8000,  // Full difficulty reached
};
```

### 7.2 Scroll Speed Curve

The game gradually forces upward movement after initial grace period.

```typescript
// systems/DifficultyManager.ts
getScrollSpeed(heightClimbed: number): number {
  // Grace period: no forced scroll for first 500 pixels
  if (heightClimbed < 500) return 0;
  
  const progress = Math.min(
    (heightClimbed - 500) / (DIFFICULTY.MAX_DIFFICULTY_HEIGHT - 500),
    1
  );
  
  // Ease-in curve for smooth ramp
  return DIFFICULTY.MAX_SCROLL_SPEED * progress * progress;
}
```

### 7.3 Target Timeline

| Time | Height | Difficulty | Notes |
|------|--------|------------|-------|
| 0:00 | 0 | Easy | Primary colors only, large platforms |
| 0:30 | ~1000 | Medium | Secondary colors appear |
| 1:30 | ~3000 | Hard | All colors, smaller platforms |
| 3:00 | ~6000 | Expert | Max scroll speed, tight gaps |
| 5:00+ | 10000+ | Mastery | Survival mode |

---

## 8. Visual Design

### 8.1 Rendering (No Sprites)

Generate all visuals programmatically:

```typescript
// In PreloadScene.create()
createPlatformTextures(): void {
  const graphics = this.make.graphics({ x: 0, y: 0 });
  
  // Create texture for each color
  Object.entries(COLOR_HEX).forEach(([color, hex]) => {
    graphics.clear();
    graphics.fillStyle(hex, 1);
    graphics.fillRoundedRect(0, 0, PLATFORM.WIDTH, PLATFORM.HEIGHT, 4);
    graphics.generateTexture(`platform_${color}`, PLATFORM.WIDTH, PLATFORM.HEIGHT);
  });
  
  graphics.destroy();
}
```

### 8.2 Platform States

| State | Alpha | Effect |
|-------|-------|--------|
| **Solid** (color matches) | 1.0 | Full opacity, subtle glow (optional) |
| **Non-solid** (color differs) | 0.4 | Semi-transparent, desaturated |

### 8.3 Player Feedback

```typescript
// Player aura matches active color
this.playerAura = this.add.circle(0, 0, 24, 0xffffff, 0.3);
this.playerAura.setBlendMode(Phaser.BlendModes.ADD);

// In update()
const activeColor = this.colorSystem.getActiveColor();
this.playerAura.setFillStyle(COLOR_HEX[activeColor], 0.3);
```

### 8.4 Color Transitions

Smooth alpha transitions when colors change (not instant):

```typescript
// Tween platform alpha over 100ms
this.tweens.add({
  targets: platform,
  alpha: isSolid ? 1.0 : 0.4,
  duration: 100,
  ease: 'Power2',
});
```

---

## 9. UI / HUD

### 9.1 Elements

```
┌─────────────────────────────┐
│  [R] [G] [B]     Score: 0   │  ← Top bar (fixed)
│                             │
│                             │
│        (gameplay)           │
│                             │
│                             │
│      ┌───────────┐          │
│      │ [ACTIVE]  │          │  ← Active color indicator near player
│      └───────────┘          │
└─────────────────────────────┘
```

### 9.2 Color Toggle Indicators

```typescript
// ui/ColorIndicator.ts
export class ColorIndicator extends Phaser.GameObjects.Container {
  private redBox: Phaser.GameObjects.Rectangle;
  private greenBox: Phaser.GameObjects.Rectangle;
  private blueBox: Phaser.GameObjects.Rectangle;
  
  constructor(scene: Phaser.Scene) {
    super(scene, 20, 20);
    
    // Three boxes showing R, G, B state
    this.redBox = scene.add.rectangle(0, 0, 30, 30, 0xff3333);
    this.greenBox = scene.add.rectangle(40, 0, 30, 30, 0x33ff33);
    this.blueBox = scene.add.rectangle(80, 0, 30, 30, 0x3333ff);
    
    this.add([this.redBox, this.greenBox, this.blueBox]);
    this.setScrollFactor(0); // Fixed to screen
  }
  
  update(colorSystem: ColorSystem): void {
    this.redBox.setAlpha(colorSystem.isRedEnabled() ? 1 : 0.3);
    this.greenBox.setAlpha(colorSystem.isGreenEnabled() ? 1 : 0.3);
    this.blueBox.setAlpha(colorSystem.isBlueEnabled() ? 1 : 0.3);
  }
}
```

### 9.3 Score Display

```typescript
this.scoreText = this.add.text(400, 20, 'Score: 0', {
  fontFamily: 'monospace',
  fontSize: '24px',
  color: '#ffffff',
});
this.scoreText.setScrollFactor(0);

// In update()
const score = Math.abs(Math.floor(this.highestY));
this.scoreText.setText(`Score: ${score}`);
```

---

## 10. Audio (Optional / Time Permitting)

### 10.1 Sound Effects

| Event | Sound | Priority |
|-------|-------|----------|
| Color toggle | Short blip/click | Medium |
| Land on platform | Soft thud | High |
| Fall through platform | Whoosh / empty | High |
| Game over | Descending tone | High |

### 10.2 Implementation

```typescript
// In PreloadScene
this.load.audio('toggle', 'audio/toggle.mp3');
this.load.audio('land', 'audio/land.mp3');
this.load.audio('fall', 'audio/fall.mp3');

// In GameScene
this.sound.play('toggle', { volume: 0.5 });
```

---

## 11. Scenes

### 11.1 Scene Flow

```
PreloadScene → GameScene ←→ GameOverScene
                   ↑              │
                   └──── Restart ─┘
```

### 11.2 GameOverScene

```typescript
// scenes/GameOverScene.ts
export class GameOverScene extends Phaser.Scene {
  create(data: { score: number }): void {
    const { width, height } = this.scale;
    
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2, `Height: ${data.score}`, {
      fontSize: '32px',
      color: '#ffff00',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height * 0.7, 'Press SPACE to restart', {
      fontSize: '20px',
      color: '#888888',
    }).setOrigin(0.5);
    
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
```

---

## 12. Performance Considerations

### 12.1 Object Limits

- **Active platforms**: Max ~50 on screen at once
- **Destroy off-screen**: Platforms below camera + 100px
- **Pre-spawn**: Generate 800px ahead of player

### 12.2 Gotchas

| Issue | Solution |
|-------|----------|
| Memory leaks | Always `destroy()` off-screen platforms |
| Static body desync | Call `refreshBody()` after position changes |
| Physics jitter | Use `setBounce(0)` on player, `setFriction(1)` |
| Key repeat | Use `JustDown()` for toggle keys |

---

## 13. Implementation Order (Jam Priority)

### Hour 1-2: Core Loop
1. Vite + Phaser setup
2. Player movement + jump
3. Static platforms (single color)
4. Basic collision

### Hour 3-4: Color System
5. ColorSystem class
6. Color toggle input
7. Collision enable/disable based on color
8. Visual feedback (alpha)

### Hour 5-6: Endless
9. Camera follow (vertical ratchet)
10. Platform spawner
11. Death detection
12. Game over + restart

### Hour 7-8: Polish
13. Difficulty curve
14. UI (color indicators, score)
15. Color transitions (tweens)
16. Audio (if time)

---

## 14. Future Considerations (Post-Jam)

Not in scope for jam, but noted for future:

- **Multiple color modes**: RBY (paint mixing) mode toggle
- **Mobile support**: Touch controls, screen size adaptation
- **Leaderboards**: High score persistence
- **Accessibility**: Colorblind mode (patterns instead of colors)
- **Power-ups**: Slow-mo, double jump, color freeze

---

## Appendix A: Phaser Cheatsheet

```typescript
// Create static platform group
this.platforms = this.physics.add.staticGroup();

// Add collision
this.physics.add.collider(player, platforms);

// Check if on ground
player.body.touching.down

// Camera follow (vertical only)
this.cameras.main.startFollow(player, true, 0, 1);

// Fixed UI element
element.setScrollFactor(0);

// Tint sprite
sprite.setTint(0xff0000);

// Alpha
sprite.setAlpha(0.5);

// Key just pressed (not held)
Phaser.Input.Keyboard.JustDown(key)

// Random from array
Phaser.Math.RND.pick(array)

// Random integer
Phaser.Math.Between(min, max)
```

---

*Specification version: 1.0*  
*Target: 48-72 hour game jam*  
*Engine: Phaser 3.90 + TypeScript + Vite*
