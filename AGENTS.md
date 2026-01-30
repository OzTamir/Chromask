# AGENTS.md - Agent Collaboration Guidelines

Guidelines for AI agents collaborating on the Chromask codebase.

## Project Context

Chromask is an endless vertical climber with additive color-mixing mechanics.

**Stack:** Phaser 3.90 + TypeScript 5.7 + Vite 6.0

**Core mechanic:** Platforms are only solid when their color exactly matches the player's active color. Players hold keys 1/2/3 to activate Red/Green/Blue, which combine additively (1+2=Yellow, etc.).

## Essential Reading

Before working on this codebase, agents MUST read:

1. **[CLAUDE.md](./CLAUDE.md)** - Code style, patterns, and requirements
2. **[docs/architecture.md](./docs/architecture.md)** - System design and data flow
3. **[docs/api-reference.md](./docs/api-reference.md)** - Classes and interfaces

For gameplay context:
- **[docs/game-mechanics.md](./docs/game-mechanics.md)** - How the game works
- **[SPEC.md](./SPEC.md)** - Detailed technical specification

## Agent Responsibilities

### 1. Understand Before Acting

- Read relevant docs before modifying code
- Check existing patterns in similar files
- Understand the module you're changing and its dependencies

### 2. Maintain Code Quality

- TypeScript strict mode - no `any`, no `@ts-ignore`
- Run `npm run build` to verify changes compile
- Match existing code patterns and naming conventions
- Keep constants in `src/constants.ts`

### 3. Keep Documentation Updated

**This is critical.** When you change code, update the docs:

```
Code Change                    → Documentation Update
─────────────────────────────────────────────────────
New/modified constant          → docs/api-reference.md
New/modified class or method   → docs/api-reference.md
Architecture change            → docs/architecture.md
Gameplay mechanic change       → docs/game-mechanics.md
Build/dev workflow change      → docs/development-guide.md
Color system change            → docs/systems/color-system.md
Spawning logic change          → docs/systems/platform-spawning.md
Difficulty curve change        → docs/systems/difficulty-progression.md
```

### 4. Verify Your Work

Before reporting completion:
1. `npm run build` passes
2. Game runs without console errors
3. Changed functionality works as expected
4. Relevant docs are updated

## Codebase Structure

```
chromask/
├── src/
│   ├── main.ts              # Entry point (Phaser config)
│   ├── constants.ts         # ALL game constants
│   ├── scenes/              # Phaser scenes
│   │   ├── PreloadScene.ts  # Asset generation
│   │   ├── GameScene.ts     # Main gameplay loop
│   │   └── GameOverScene.ts # Death screen
│   ├── entities/            # Game objects
│   │   ├── Player.ts        # Player sprite
│   │   └── Platform.ts      # Colored platforms
│   ├── systems/             # Game logic
│   │   ├── ColorSystem.ts   # Color state management
│   │   ├── PlatformSpawner.ts # Procedural generation
│   │   └── DifficultyManager.ts # Progression
│   └── ui/
│       └── ColorIndicator.ts # HUD
├── docs/                    # Documentation (KEEP UPDATED)
├── public/                  # Static assets
└── CLAUDE.md               # Detailed coding guidelines
```

## Key Patterns

### GameColor Enum (Bitwise Flags)
```typescript
enum GameColor {
  NONE    = 0b000,  // 0
  RED     = 0b001,  // 1
  GREEN   = 0b010,  // 2
  BLUE    = 0b100,  // 4
  YELLOW  = 0b011,  // 3 (RED | GREEN)
  MAGENTA = 0b101,  // 5 (RED | BLUE)
  CYAN    = 0b110,  // 6 (GREEN | BLUE)
  WHITE   = 0b111,  // 7 (all)
}
```

### Color Matching
```typescript
// Platforms are solid ONLY on exact match
const isSolid = colorSystem.getActiveColor() === platform.platformColor;
```

### Coordinate System
- Phaser uses top-left origin
- Y increases downward
- Climbing = moving to more negative Y values
- Height climbed = startY - currentY

## Common Pitfalls

1. **Forgetting to update docs** - Always check if your changes need doc updates
2. **Adding `any` types** - Find the proper type or create an interface
3. **Hardcoding values** - Put them in `constants.ts`
4. **Modifying `main.ts`** - Game logic belongs in scenes/systems
5. **Ignoring TypeScript errors** - Fix them, don't suppress them

## Testing Changes

No automated test framework. Manual testing required:

1. Run `npm run dev`
2. Open http://localhost:8080
3. Test controls: Arrow/WASD to move, Up/W/Space to jump
4. Test colors: Hold 1/2/3 for R/G/B, combinations for secondary
5. Verify platforms are solid only when colors match
6. Check browser console for errors

## Questions?

If unclear about:
- **Architecture decisions** → Check `docs/architecture.md` or `SPEC.md`
- **Game rules** → Check `docs/game-mechanics.md` or `GAME_DESIGN.md`
- **Code patterns** → Check `CLAUDE.md` or existing similar code
- **Constants/APIs** → Check `docs/api-reference.md`
