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
  [GameColor.RED]:     0xFF0044, // Bright cherry red
  [GameColor.GREEN]:   0x00FF55, // Electric green
  [GameColor.BLUE]:    0x0088FF, // Electric blue
  [GameColor.YELLOW]:  0xFFDD00, // Sunny yellow
  [GameColor.MAGENTA]: 0xFF00AA, // Hot magenta
  [GameColor.CYAN]:    0x00FFFF, // Cyan
  [GameColor.WHITE]:   0xFFFFFF, // Pure white
  [GameColor.NONE]:    0x888888, // Light gray (UI only)
};
```

### PLAYER Constants

```typescript
const PLAYER = {
  MOVE_SPEED: 300,        // Horizontal speed (pixels/second)
  JUMP_VELOCITY: -500,    // Jump velocity (negative = upward)
  GRAVITY: 800,           // Gravity acceleration (pixels/second²)
  WIDTH: 24,              // Hitbox width (Thomas Was Alone style rectangle)
  HEIGHT: 48,             // Hitbox height
};
```

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

### VISUAL Constants

```typescript
const VISUAL = {
  PLATFORM_INACTIVE_ALPHA: 0.3,   // Alpha for non-solid platforms
  PLATFORM_ACTIVE_ALPHA: 1.0,     // Alpha for solid platforms
  ALPHA_TRANSITION_MS: 150,       // Transition duration
  SHADOW_ALPHA: 0.08,             // Very soft shadow (Thomas Was Alone style)
  SHADOW_LIGHT_ANGLE: 45,         // Light source angle (45 = top-right, shadow down-left)
  SHADOW_SPREAD: 15,              // Shadow spread at the end (perspective width)
};
```

---

### Shadow

Thomas Was Alone style shadow - soft, elongated shadows extending from entities to bottom of screen.

#### Methods

**`update(x: number, y: number, width: number, height: number, isGrounded: boolean, cameraScrollY: number): void`**

Update shadow position and visibility. Shadow extends from entity to bottom of screen. Shadow only renders when `isGrounded` is true.

```typescript
shadow.update(this.x, this.y, width, height, isGrounded, camera.scrollY);
```

**`setDepth(depth: number): void`**

Set render depth for the shadow.

**`clear(): void`**

Clear the shadow graphics without destroying them.

**`destroy(): void`**

Clean up graphics resources.

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

**`setSolid(isSolid: boolean, camera?: Phaser.Cameras.Scene2D.Camera): void`**

Enable or disable collision. Updates visual alpha and border visibility. Shadow is only rendered if platform is visible on screen (within camera bounds with 50px margin). No effect if `alwaysSolid` is true or platform has been contacted.

```typescript
platform.setSolid(colorSystem.isColorActive(platform.platformColor), this.cameras.main);
```

**`isOnScreen(camera: Phaser.Cameras.Scene2D.Camera): boolean`**

Check if platform is within camera bounds (with 50px margin).

**`updateShadow(camera?: Phaser.Cameras.Scene2D.Camera): void`**

Update shadow rendering. Shadow only renders if platform is on screen.

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
