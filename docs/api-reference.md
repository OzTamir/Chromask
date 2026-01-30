# API Reference

Practical reference for Chromask game classes, constants, and interfaces.

For implementation details and architecture, see [SPEC.md](../SPEC.md).

---

## Constants

### GameColor Enum

```typescript
enum GameColor {
  NONE    = 0b000,  // 0
  RED     = 0b001,  // 1
  GREEN   = 0b010,  // 2
  BLUE    = 0b100,  // 4
  YELLOW  = 0b011,  // 3 (R + G)
  MAGENTA = 0b101,  // 5 (R + B)
  CYAN    = 0b110,  // 6 (G + B)
  WHITE   = 0b111,  // 7 (R + G + B)
}
```

Bitwise flags for additive color mixing. Primary colors (RED, GREEN, BLUE) are powers of 2. Secondary colors are created by OR-ing primaries together.

**Example:**
```typescript
const yellow = GameColor.RED | GameColor.GREEN;  // 0b001 | 0b010 = 0b011 = 3
```

### COLOR_HEX

Maps `GameColor` enum values to hex color codes for rendering.

```typescript
const COLOR_HEX: Record<GameColor, number> = {
  [GameColor.RED]:     0xFF3333,
  [GameColor.GREEN]:   0x33FF33,
  [GameColor.BLUE]:    0x3333FF,
  [GameColor.YELLOW]:  0xFFFF33,
  [GameColor.MAGENTA]: 0xFF33FF,
  [GameColor.CYAN]:    0x33FFFF,
  [GameColor.WHITE]:   0xFFFFFF,
  [GameColor.NONE]:    0x333333,  // Dark gray (UI only)
};
```

### PLAYER Constants

```typescript
const PLAYER = {
  MOVE_SPEED: 300,        // Horizontal speed (pixels/second)
  JUMP_VELOCITY: -500,    // Jump velocity (negative = upward)
  GRAVITY: 800,           // Gravity acceleration (pixels/second²)
  WIDTH: 32,              // Hitbox width
  HEIGHT: 32,             // Hitbox height
};
```

### PLATFORM Constants

```typescript
const PLATFORM = {
  WIDTH: 100,             // Default platform width
  HEIGHT: 20,             // Platform height
  MIN_GAP_X: 60,          // Minimum horizontal spacing
  MAX_GAP_X: 200,         // Maximum horizontal spacing
  MIN_GAP_Y: 60,          // Minimum vertical spacing
  MAX_GAP_Y: 120,         // Maximum vertical spacing
};
```

### DIFFICULTY Constants

```typescript
const DIFFICULTY = {
  FLOOR_START_HEIGHT: 750,        // Height when forced scroll begins (~10 platforms)
  PHASE_2_HEIGHT: 1000,           // Secondary colors (Y/M/C) appear
  PHASE_3_HEIGHT: 3000,           // White platforms appear
  MAX_DIFFICULTY_HEIGHT: 8000,    // Full difficulty reached
  
  INITIAL_SCROLL_SPEED: 30,       // Starting scroll speed (px/s)
  MAX_SCROLL_SPEED: 100,          // Maximum scroll speed (px/s)
  
  EASY_PHASE_HEIGHT: 375,         // Tutorial phase duration (~5 platforms)
  EASY_PHASE_SAME_COLOR_CHANCE: 0.7,  // Probability of repeating color
  EASY_PHASE_MAX_GAP_Y: 70,       // Smaller vertical gaps in tutorial
  
  HEIGHT_PER_PLATFORM: 75,        // Average pixels per platform (for display)
};
```

### VISUAL Constants

```typescript
const VISUAL = {
  PLATFORM_INACTIVE_ALPHA: 0.4,   // Alpha for non-solid platforms
  PLATFORM_ACTIVE_ALPHA: 1.0,     // Alpha for solid platforms
  ALPHA_TRANSITION_MS: 100,       // Transition duration
};
```

### HELP_DIALOG Constants

```typescript
const HELP_DIALOG = {
  BACKGROUND_COLOR: 0x000000,     // Dark background
  BACKGROUND_ALPHA: 0.5,          // Semi-transparent overlay
  PADDING: 24,                    // Inner padding
  BORDER_RADIUS: 12,              // Rounded corners
  TEXT_COLOR: '#ffffff',          // White text
  TITLE_FONT_SIZE: '24px',        // Title size
  BODY_FONT_SIZE: '16px',         // Body text size
  LINE_HEIGHT: 1.4,               // Text line spacing
};
```

---

## Classes

### ColorSystem

Manages player's active color state and platform matching logic.

#### Methods

**`setColors(red: boolean, green: boolean, blue: boolean): void`**

Set which color components are active.

```typescript
colorSystem.setColors(true, true, false);  // Yellow (R + G)
```

**`getActiveColor(): GameColor`**

Returns the combined color from active components.

```typescript
const color = colorSystem.getActiveColor();  // GameColor.YELLOW
```

**`isColorActive(platformColor: GameColor): boolean`**

Check if platform color exactly matches active color.

```typescript
if (colorSystem.isColorActive(platform.platformColor)) {
  // Platform is solid
}
```

**`reset(): void`**

Disable all colors (returns to NONE).

---

### Player

Player entity with physics and movement controls. Extends `Phaser.Physics.Arcade.Sprite`.

#### Methods

**`moveLeft(): void`**

Apply leftward velocity.

**`moveRight(): void`**

Apply rightward velocity.

**`stopHorizontal(): void`**

Stop horizontal movement (set velocity to 0).

**`jump(): void`**

Jump if grounded. Only works when `body.blocked.down` or `body.touching.down` is true.

**`isBelowScreen(cameraScrollY: number, cameraHeight: number): boolean`**

Check if player has fallen below visible area (game over condition).

---

### Platform

Colored platform entity. Extends `Phaser.Physics.Arcade.Sprite`.

#### Properties

**`platformColor: GameColor`** (readonly)

The platform's color. Immutable after creation.

**`alwaysSolid: boolean`** (readonly)

If true, platform ignores color matching (e.g., starting floor).

#### Methods

**`setSolid(isSolid: boolean): void`**

Enable or disable collision. Updates visual alpha and border visibility. No effect if `alwaysSolid` is true or platform has been contacted.

```typescript
platform.setSolid(colorSystem.isColorActive(platform.platformColor));
```

**`markContacted(): void`**

Called when player first lands on platform. Makes platform permanently solid and removes dashed border.

**`isContacted(): boolean`**

Returns true if platform has been landed on.

---

### PlatformSpawner

Generates and manages platform lifecycle.

#### Methods

**`createInitialPlatforms(width: number, height: number): void`**

Initialize spawner and create starting floor + initial platforms.

```typescript
spawner.createInitialPlatforms(480, 720);
```

**`spawnPlatformsAbove(currentY: number): void`**

Generate platforms above current Y position to maintain spawn buffer.

```typescript
spawner.spawnPlatformsAbove(player.y);
```

**`cullPlatformsBelow(cameraScrollY: number): void`**

Remove platforms that have scrolled off-screen.

```typescript
spawner.cullPlatformsBelow(camera.scrollY);
```

**`updateDifficulty(heightClimbed: number): void`**

Adjust platform spacing based on height climbed.

```typescript
const heightClimbed = difficultyManager.getHeightClimbed(player.y);
spawner.updateDifficulty(heightClimbed);
```

**`getPlatforms(): Phaser.Physics.Arcade.StaticGroup`**

Returns the platform group for collision detection.

---

### DifficultyManager

Tracks progression and calculates difficulty parameters.

#### Methods

**`getHeightClimbed(currentY: number): number`**

Calculate total height climbed in pixels.

```typescript
const heightClimbed = difficultyManager.getHeightClimbed(player.y);
```

**`getScrollSpeed(heightClimbed: number): number`**

Calculate current forced scroll speed. Returns 0 before `FLOOR_START_HEIGHT`.

```typescript
const scrollSpeed = difficultyManager.getScrollSpeed(heightClimbed);
camera.scrollY += scrollSpeed * delta;
```

**`getPlatformHeight(pixelHeight: number): number`**

Convert pixel height to platform count for display.

```typescript
const platformCount = difficultyManager.getPlatformHeight(heightClimbed);
// Display: "Height: 10"
```

---

### HelpDialog

Displays help overlay with controls and color combinations. Extends `Phaser.GameObjects.Container`.

Shows while the `/` key is held, hidden when released.

#### Methods

**`show(): void`**

Make the dialog visible.

**`hide(): void`**

Hide the dialog.

---

## Interfaces

### PlatformConfig

Optional configuration for platform creation.

```typescript
interface PlatformConfig {
  width?: number;         // Custom width (default: PLATFORM.WIDTH)
  alwaysSolid?: boolean;  // Ignore color matching (default: false)
}
```

**Example:**
```typescript
// Starting floor - full width, always solid
new Platform(scene, x, y, GameColor.NONE, {
  width: 480,
  alwaysSolid: true,
});

// Narrow platform
new Platform(scene, x, y, GameColor.RED, {
  width: 60,
});
```
