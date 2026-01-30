# Chromask Documentation

Chromask is an endless vertical climber with additive color-mixing mechanics. Built with Phaser 3, TypeScript, and Vite, the game challenges players to match their character's color to platforms by holding color keys (1=Red, 2=Green, 3=Blue) that combine using RGB color theory. Platforms are only solid when they exactly match the player's active color. As players climb higher, the difficulty progressively increases through faster scrolling, more complex color combinations, and tighter platform spacing.

## Table of Contents

### Core Documentation
- [Architecture](./architecture.md) - System design, component relationships, and technical architecture
- [Development Guide](./development-guide.md) - Setup, workflow, testing, and contribution guidelines
- [Game Mechanics](./game-mechanics.md) - Detailed gameplay rules, color mixing, and scoring
- [API Reference](./api-reference.md) - Class documentation and method signatures

### System Deep-Dives
- [Color System](./systems/color-system.md) - RGB color mixing, validation, and visual feedback
- [Platform Spawning](./systems/platform-spawning.md) - Generation algorithms, patterns, and difficulty scaling
- [Difficulty Progression](./systems/difficulty-progression.md) - Scroll speed, spawn rates, and challenge curves

## Quick Links

- [README.md](../README.md) - Project overview and quick start guide
- [SPEC.md](../SPEC.md) - Detailed technical specification
- [GAME_DESIGN.md](../GAME_DESIGN.md) - Complete game design document

## Quick Start

### Controls

| Action | Keys |
|--------|------|
| Move | Arrow keys / WASD |
| Jump | Up / W / Space |
| Hold Red | 1 |
| Hold Green | 2 |
| Hold Blue | 3 |

Color combinations: 1+2=Yellow, 1+3=Magenta, 2+3=Cyan, 1+2+3=White

### Running the Game
```bash
npm install
npm run dev
```

Open http://localhost:8080 in your browser.

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Game Engine | Phaser 3.90 | 2D game framework with Arcade physics |
| Language | TypeScript 5.7 | Type-safe development |
| Build Tool | Vite 6.0 | Fast development server and bundling |

## Project Structure

```
chromask/
├── src/
│   ├── main.ts          # Entry point, Phaser config
│   ├── constants.ts     # Game constants (colors, physics, difficulty)
│   ├── scenes/          # Game scenes (Preload, Game, GameOver)
│   ├── entities/        # Game objects (Player, Platform)
│   ├── systems/         # Core systems (ColorSystem, PlatformSpawner, DifficultyManager)
│   └── ui/              # HUD components (ColorIndicator)
├── docs/                # Documentation (you are here)
└── public/              # Static assets
```

## Getting Help

- Check the [Development Guide](./development-guide.md) for common workflows
- Review [Game Mechanics](./game-mechanics.md) for gameplay questions
- See [Architecture](./architecture.md) for system design decisions
- Consult [API Reference](./api-reference.md) for implementation details

## Contributing

See the [Development Guide](./development-guide.md) for:
- Code style guidelines
- Testing requirements
- Pull request process
- Development workflow
