# Difficulty Progression System

The game becomes progressively harder as the player climbs higher. Difficulty is measured by vertical distance traveled and affects multiple game parameters simultaneously.

## Height Measurement

Height is tracked in pixels from the player's starting Y position. Since Phaser uses a top-down coordinate system, climbing higher means moving to more negative Y values.

The UI displays height in "platform units" for readability:
```
platformHeight = pixelHeight / 75
```

This conversion uses `DIFFICULTY.HEIGHT_PER_PLATFORM` (75px), which represents the average vertical spacing between platforms.

## Difficulty Phases

The game progresses through distinct phases based on height climbed:

| Phase | Height (px) | Height (platforms) | Features |
|-------|-------------|-------------------|----------|
| Easy | 0-375 | 0-5 | 70% same-color bias, max 70px gaps, 150px horizontal drift |
| Primary | 0-1000 | 0-13 | RGB colors only, standard spacing |
| Secondary | 1000-3000 | 13-40 | Yellow, Magenta, Cyan platforms added |
| All Colors | 3000+ | 40+ | White platforms added |
| Max Difficulty | 8000+ | 107+ | All parameters at maximum challenge |

**Easy Phase** (0-375px): Tutorial-like experience with generous spacing and color continuity. Platforms have a 70% chance of matching the previous platform's color (`EASY_PHASE_SAME_COLOR_CHANCE`), allowing players to learn the color-mixing mechanics without constant switching.

**Primary Phase** (0-1000px): Only red, green, and blue platforms spawn. Players learn the three base colors before combinations are introduced.

**Secondary Phase** (1000-3000px): Yellow, magenta, and cyan platforms appear, requiring players to hold two color keys simultaneously.

**All Colors Phase** (3000+px): White platforms spawn, requiring all three color keys held at once.

**Max Difficulty** (8000+px): All difficulty parameters reach their maximum values and remain constant.

## Rising Floor

The game features a "rising floor" mechanic that forces upward progression:

- **Grace Period**: No forced scroll for the first 750px (`FLOOR_START_HEIGHT`), allowing players to learn at their own pace.
- **Initial Speed**: After the grace period, the camera scrolls upward at 30 px/s (`INITIAL_SCROLL_SPEED`).
- **Max Speed**: Scroll speed increases linearly to 100 px/s (`MAX_SCROLL_SPEED`) at max difficulty height.
- **Speed Formula**: Linear interpolation from floor start height to max difficulty height.

```typescript
if (heightClimbed < 750) {
  scrollSpeed = 0;
} else {
  progress = (heightClimbed - 750) / (8000 - 750);
  scrollSpeed = 30 + (100 - 30) * progress;
}
```

The rising floor creates urgency and prevents players from camping on a single platform indefinitely.

## Platform Spacing

Vertical gaps between platforms scale with difficulty:

- **Initial Max Gap**: 80px (`INITIAL_MAX_GAP_Y`)
- **Final Max Gap**: 150px (`FINAL_MAX_GAP_Y`)
- **Scaling**: Linear interpolation based on height climbed

Wider gaps require more precise jumping and color management, as players have less margin for error.

## Ratchet Camera

The camera uses a "ratchet" system that only moves upward:

- Tracks the highest point the player has reached
- Never scrolls down, even if the player falls
- Combined with rising floor, creates a shrinking safe zone
- Falling below the camera's bottom edge = game over

This prevents backtracking and maintains forward pressure on the player.

## Timeline Estimate

Approximate progression for a skilled player:

| Time | Height (px) | Height (platforms) | Difficulty |
|------|-------------|-------------------|------------|
| 0:00 | 0 | 0 | Easy phase, no scroll |
| 0:30 | ~1000 | ~13 | Secondary colors appear, slow scroll |
| 1:30 | ~3000 | ~40 | White platforms, medium scroll |
| 3:00 | ~6000 | ~80 | Near-max difficulty, fast scroll |
| 4:00+ | ~8000+ | ~107+ | Maximum difficulty sustained |

These estimates assume consistent upward movement. Actual times vary based on player skill and risk-taking.

## Implementation

The `DifficultyManager` class handles all difficulty calculations based on the player's current Y position. It provides methods for:

- `getHeightClimbed(currentY)`: Converts Y coordinate to height climbed
- `getPlatformHeight(pixelHeight)`: Converts pixel height to platform units
- `getScrollSpeed(heightClimbed)`: Calculates current rising floor speed

For detailed API documentation, see the [API Reference](../api-reference.md).

## Configuration

All difficulty constants are defined in `src/constants.ts` under the `DIFFICULTY` object:

```typescript
DIFFICULTY = {
  INITIAL_SCROLL_SPEED: 30,
  MAX_SCROLL_SPEED: 100,
  INITIAL_MAX_GAP_Y: 80,
  FINAL_MAX_GAP_Y: 150,
  FLOOR_START_HEIGHT: 750,
  HEIGHT_PER_PLATFORM: 75,
  EASY_PHASE_HEIGHT: 375,
  PHASE_2_HEIGHT: 1000,
  PHASE_3_HEIGHT: 3000,
  MAX_DIFFICULTY_HEIGHT: 8000,
}
```

Tuning these values allows fine-grained control over the difficulty curve without modifying game logic.
