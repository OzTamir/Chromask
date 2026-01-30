# Development Guide

This guide covers everything you need to start developing Chromask, from initial setup to deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Quick Setup

Get started in three steps:

```bash
git clone <repo-url>
cd Chromask
npm install
npm run dev
```

The development server will start and the game will be available at **http://localhost:8080**.

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | vite | Development server with HMR |
| build | tsc && vite build | TypeScript check + production build |
| preview | vite preview | Preview production build |

## Project Structure

Chromask follows a modular architecture organized by feature and responsibility. For a complete breakdown of the directory structure and architectural patterns, see [architecture.md](./architecture.md).

Key directories:
- `src/` - All TypeScript source code
- `public/` - Static assets (images, audio)
- `dist/` - Production build output (generated)
- `docs/` - Project documentation

## Development Workflow

### Making Changes

The development server uses Vite's Hot Module Replacement (HMR), which means:
- Save any file and see changes instantly in the browser
- No manual refresh needed in most cases
- Game state may reset on certain changes

### TypeScript

The project uses **strict mode** TypeScript with the following settings:
- Target: ES2020
- Module: ESNext
- Strict type checking enabled
- No implicit `any` types allowed

Run type checking manually:
```bash
npm run build
```

This runs `tsc` to verify all types before building.

### Code Quality

Currently, there are no automated linting or formatting tools configured. Follow these guidelines:
- Match the existing code style
- Use TypeScript strict mode - avoid `any` types
- Keep magic numbers and strings in `constants.ts`
- Organize imports logically

## Build & Deploy

### Production Build

Create an optimized production build:

```bash
npm run build
```

This will:
1. Run TypeScript type checking
2. Bundle and minify all code
3. Output static files to `dist/`

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

### Deployment

The `dist/` folder contains a complete static site that can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

Simply upload the contents of `dist/` to your hosting provider.

## Configuration Files

### vite.config.ts

Vite configuration includes:
- **Server port**: 8080 (development server)
- **Manual chunking**: Phaser library separated into its own chunk for optimal caching
- **Build target**: ES2020

### tsconfig.json

TypeScript configuration:
- **Strict mode**: Enabled for maximum type safety
- **Target**: ES2020
- **Module**: ESNext
- **Lib**: ES2020, DOM

## Testing

**Note**: No test framework is currently configured.

### Manual Testing

Test the game manually using these controls:
- **Arrow Keys / WASD**: Move the player left/right
- **Up / W / Space**: Jump
- **1 / 2 / 3**: Hold to activate Red / Green / Blue colors

Test scenarios to verify:
- Player movement and jumping
- Color matching mechanics (platforms solid only when colors match)
- Platform spawning as you climb
- Camera scrolling and rising floor after ~10 platforms
- Game over when falling off screen
- Score display (height in platform units)

## Contributing

When contributing to Chromask, follow these guidelines:

### Code Standards

- **TypeScript strict mode**: No `any` types - use proper typing
- **Constants**: Keep magic numbers and strings in `constants.ts`
- **Patterns**: Match existing code patterns and structure
- **Modularity**: Keep classes focused and single-purpose

### File Organization

- Add new scenes in `src/scenes/`
- Add new entities in `src/entities/`
- Add new systems in `src/systems/`
- Add new UI components in `src/ui/`
- Keep constants in `src/constants.ts`

### Before Submitting

1. Ensure TypeScript compiles without errors: `npm run build`
2. Test your changes manually in the browser
3. Verify the production build works: `npm run preview`
4. Check that no console errors appear during gameplay

## Adding New Characters

The game supports multiple playable characters with different visual styles. Here's how to add a new character:

### 1. Define the Character in constants.ts

Add a new entry to the `CHARACTER` object:

```typescript
export const CHARACTER = {
  RUNNER: { /* existing */ },
  CLASSIC: { /* existing */ },
  YOUR_CHARACTER: {
    id: 'your-character',           // Unique identifier
    name: 'Your Character',          // Display name in UI
    texture: 'your-texture-key',     // Phaser texture key
    scale: 1,                        // Display scale (1 = native size)
    hasAnimations: false,            // true if using spritesheet animations
    hasEyes: false,                  // true to add floating eye decorations
    hitbox: {
      width: 24,                     // Physics body width
      height: 48,                    // Physics body height
      offsetX: 0,                    // X offset from sprite origin
      offsetY: 0,                    // Y offset from sprite origin
    },
  } as CharacterDefinition,
};
```

Then add it to `CHARACTER_DEFINITIONS`:

```typescript
export const CHARACTER_DEFINITIONS: CharacterDefinition[] = [
  CHARACTER.RUNNER,
  CHARACTER.CLASSIC,
  CHARACTER.YOUR_CHARACTER,  // Add here
];
```

### 2. Create the Texture

**Option A: Procedural texture (like Classic)**

Add to `PreloadScene.createTextures()`:

```typescript
private createYourCharacterTexture(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xYOURCOLOR, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.generateTexture('your-texture-key', width, height);
}
```

**Option B: External spritesheet (like Runner)**

Add to `PreloadScene.preload()`:

```typescript
this.load.spritesheet('your-texture-key', 'assets/YourSprite.png', {
  frameWidth: 32,
  frameHeight: 32,
});
```

### 3. Add Animations (if hasAnimations: true)

Add to `PreloadScene.createAnimations()`:

```typescript
this.anims.create({
  key: 'your-character-idle',
  frames: this.anims.generateFrameNumbers('your-texture-key', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});
// Add run, jump, fall animations as needed
```

**Note**: Currently the Player class expects specific animation keys (`player-run`, `player-idle`, `player-jump`, `player-fall`). To support character-specific animations, you'll need to extend the animation system.

### 4. Test the Character

1. Run `npm run build` to verify TypeScript compiles
2. Start `npm run dev`
3. Press Tab on the ground platform to cycle to your new character
4. Verify hitbox feels correct and visuals display properly

### Character Definition Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the character |
| `name` | string | Display name shown in the character selector UI |
| `texture` | string | Phaser texture key (must match loaded texture) |
| `scale` | number | Visual scale multiplier (1 = native size) |
| `hasAnimations` | boolean | Whether to use animation state machine |
| `hasEyes` | boolean | Whether to add floating eye decorations |
| `hitbox.width` | number | Physics body width in pixels |
| `hitbox.height` | number | Physics body height in pixels |
| `hitbox.offsetX` | number | X offset of hitbox from sprite origin |
| `hitbox.offsetY` | number | Y offset of hitbox from sprite origin |

## Troubleshooting

### Port 8080 Already in Use

If port 8080 is occupied, you can:
- Stop the process using port 8080
- Modify the port in `vite.config.ts`

### Build Errors

If you encounter build errors:
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Clear Vite cache: `rm -rf node_modules/.vite`

### HMR Not Working

If hot reload stops working:
1. Restart the dev server
2. Hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check browser console for errors

## Additional Resources

- [Architecture Documentation](./architecture.md) - Detailed system design
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Documentation](https://vitejs.dev/)
