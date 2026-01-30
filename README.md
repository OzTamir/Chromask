# Chromask

Endless vertical climber with additive color-mixing mechanics. Built with Phaser 3 + TypeScript.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Controls

| Action | Keys |
|--------|------|
| Move | Arrow keys / WASD |
| Jump | Up / W / Space |
| Hold Red | 1 |
| Hold Green | 2 |
| Hold Blue | 3 |

## How to Play

Platforms are only solid when their color **exactly matches** your active color.

Hold color keys to activate colors. Combine by holding multiple keys:
- 1 = Red
- 2 = Green
- 3 = Blue
- 1+2 = Yellow
- 1+3 = Magenta
- 2+3 = Cyan
- 1+2+3 = White

Climb as high as you can. Fall off the screen = game over.

## Build

```bash
npm run build    # Production build in dist/
npm run preview  # Preview production build
```
