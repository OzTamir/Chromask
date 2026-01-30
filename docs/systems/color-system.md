# Color System

## Overview

Chromask implements additive RGB color mixing using bitwise operations. The player controls three independent color channels (Red, Green, Blue) that combine to form secondary colors (Yellow, Magenta, Cyan) and White. Platforms are only solid when the player's active color **exactly matches** the platform's color.

## Bitwise Implementation

Colors are represented as 3-bit values where each bit corresponds to a primary color channel:

```typescript
enum GameColor {
  NONE    = 0b000,  // 0
  RED     = 0b001,  // 1  (bit 0)
  GREEN   = 0b010,  // 2  (bit 1)
  BLUE    = 0b100,  // 4  (bit 2)
  YELLOW  = 0b011,  // 3  (RED | GREEN)
  MAGENTA = 0b101,  // 5  (RED | BLUE)
  CYAN    = 0b110,  // 6  (GREEN | BLUE)
  WHITE   = 0b111,  // 7  (RED | GREEN | BLUE)
}
```

**Why bitwise?** This representation allows efficient color combination using the bitwise OR operator (`|`). When the player holds multiple color keys, the system combines them by OR-ing the corresponding bit flags:

- Holding Red (0b001) + Green (0b010) → Yellow (0b011)
- Holding Red (0b001) + Blue (0b100) → Magenta (0b101)
- Holding all three → White (0b111)

## ColorSystem Class

The `ColorSystem` class manages the player's active color state:

```typescript
class ColorSystem {
  private redEnabled = false;
  private greenEnabled = false;
  private blueEnabled = false;

  setColors(red: boolean, green: boolean, blue: boolean): void {
    this.redEnabled = red;
    this.greenEnabled = green;
    this.blueEnabled = blue;
  }

  getActiveColor(): GameColor {
    let color = GameColor.NONE;
    if (this.redEnabled) color |= GameColor.RED;
    if (this.greenEnabled) color |= GameColor.GREEN;
    if (this.blueEnabled) color |= GameColor.BLUE;
    return color;
  }

  isColorActive(platformColor: GameColor): boolean {
    return this.getActiveColor() === platformColor;
  }
}
```

The `getActiveColor()` method builds the composite color by OR-ing each enabled channel. The `isColorActive()` method performs exact equality checks for collision detection.

## Collision Rule

Platforms are only solid when the player's active color **exactly matches** the platform's color:

```typescript
activeColor === platformColor
```

**Example:** A Yellow platform (color value 3) is only solid when the player holds both Red and Green:
- Red enabled (1) | Green enabled (2) = Yellow (3) → **Match, solid**
- Only Red enabled (1) → **No match, passthrough**
- Red + Green + Blue (7) = White → **No match, passthrough**

Partial matches do **not** work. The player must activate the exact combination of primary colors that compose the platform's color.

## Visual Feedback

Platforms provide visual feedback based on color matching:

**Matching (solid):**
- Opacity: `alpha = 1.0`
- Collision: Enabled
- Border: Solid

**Non-matching (passthrough):**
- Opacity: `alpha = 0.4`
- Collision: Disabled
- Border: Dashed (2px dash, 4px gap)

This feedback is updated every frame in the render loop, allowing real-time visual response as the player changes their active color.

## Key Bindings

Color channels are controlled via keyboard input:

- **1 key:** Red channel
- **2 key:** Green channel
- **3 key:** Blue channel

Keys are **hold-based**, not toggle-based. The color is active only while the key is pressed. Releasing a key immediately disables that channel and recalculates the active color.

## Implementation Details

The color system integrates with:

- **Input handling:** Keyboard events update channel states via `setColors()`
- **Physics:** Collision detection queries `isColorActive()` for each platform
- **Rendering:** Visual feedback uses `getActiveColor()` to determine opacity and border style

For full class implementation and method signatures, see the [API Reference](../api-reference.md).
