# CLAUDE.md - AI Agent Guidelines for Chromask

This file provides guidance for AI agents (Claude, Copilot, etc.) working on this codebase.

## Quick Reference

```bash
npm install    # Install dependencies
npm run dev    # Development server at http://localhost:8080
npm run build  # TypeScript check + production build
npm run preview # Preview production build
```

## Documentation First

**Before making changes, read the relevant documentation:**

| Topic | Document |
|-------|----------|
| Project overview | [README.md](./README.md) |
| System architecture | [docs/architecture.md](./docs/architecture.md) |
| Development workflow | [docs/development-guide.md](./docs/development-guide.md) |
| Game mechanics | [docs/game-mechanics.md](./docs/game-mechanics.md) |
| API reference | [docs/api-reference.md](./docs/api-reference.md) |
| Technical specification | [SPEC.md](./SPEC.md) |

For system deep-dives:
- [docs/systems/color-system.md](./docs/systems/color-system.md)
- [docs/systems/platform-spawning.md](./docs/systems/platform-spawning.md)
- [docs/systems/difficulty-progression.md](./docs/systems/difficulty-progression.md)

## Code Style Requirements

### TypeScript Strict Mode

This project uses strict TypeScript. **Non-negotiable rules:**

- No `any` types - use proper typing
- No `@ts-ignore` or `@ts-expect-error`
- No unused variables or parameters
- All switch statements must handle all cases or have default

### Constants

All magic numbers and configuration values go in `src/constants.ts`:

```typescript
// Organized by category: PLAYER, PLATFORM, DIFFICULTY, GAME, CAMERA, VISUAL
import { PLAYER, PLATFORM } from './constants';
```

### File Organization

```
src/
├── main.ts              # Entry point - don't add game logic here
├── constants.ts         # ALL constants go here
├── scenes/              # Phaser scenes only
├── entities/            # Game objects (extend Phaser classes)
├── systems/             # Pure game logic (no rendering)
└── ui/                  # HUD components
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | PascalCase.ts | `GameScene.ts`, `ColorSystem.ts` |
| Classes | PascalCase | `class PlatformSpawner` |
| Methods | camelCase | `spawnPlatformsAbove()` |
| Constants | SCREAMING_SNAKE | `PLAYER.MOVE_SPEED` |
| Enums | PascalCase + SCREAMING values | `GameColor.RED` |

### Import Style

```typescript
// Phaser first
import Phaser from 'phaser';

// Then local imports, grouped by type
import { PLAYER, PLATFORM } from '../constants';
import { Player } from '../entities/Player';
import { ColorSystem } from '../systems/ColorSystem';
```

## Phaser 3 Patterns

### Entities extend Phaser classes
```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}
```

### Systems are pure classes (no Phaser inheritance)
```typescript
export class ColorSystem {
  private redEnabled = false;
  // Pure logic, no scene reference needed
}
```

### Scenes orchestrate everything
```typescript
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private colorSystem!: ColorSystem;
  
  create(): void {
    this.setupSystems();
    this.setupPlayer();
    // ...
  }
}
```

## Before Committing

1. **Build must pass**: `npm run build`
2. **Test manually**: Play the game, verify your changes work
3. **No console errors**: Check browser console during gameplay
4. **Update docs if needed**: See next section

## Keeping Documentation Updated

**When you modify code, update the corresponding docs:**

| Change Type | Update These Docs |
|-------------|-------------------|
| New constant | `docs/api-reference.md` |
| New class/method | `docs/api-reference.md` |
| Architecture change | `docs/architecture.md` |
| Gameplay change | `docs/game-mechanics.md` |
| Build/setup change | `docs/development-guide.md` |
| System logic change | Relevant `docs/systems/*.md` |

## Common Tasks

### Adding a new entity
1. Create file in `src/entities/`
2. Extend appropriate Phaser class
3. Add to `docs/api-reference.md`
4. Update `docs/architecture.md` if it changes module relationships

### Adding a new system
1. Create file in `src/systems/`
2. Keep it pure (no Phaser inheritance if possible)
3. Wire it up in `GameScene`
4. Add to `docs/api-reference.md`
5. Consider adding `docs/systems/[name].md` if complex

### Modifying game constants
1. Edit `src/constants.ts`
2. Update `docs/api-reference.md` if adding new constants
3. Update relevant system docs if it affects gameplay
