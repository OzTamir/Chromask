/**
 * Chromask Game Constants
 * All game configuration values in one place
 */

// =============================================================================
// COLOR SYSTEM
// =============================================================================

/**
 * GameColor uses bitwise flags for additive color mixing.
 * RED=1, GREEN=2, BLUE=4
 * Combinations are OR'd together: YELLOW = RED | GREEN = 3
 */
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

/** Hex color values for rendering - bold, vibrant, candy-like colors */
export const COLOR_HEX: Record<GameColor, number> = {
  [GameColor.NONE]:    0x888888, // Light gray (for UI only)
  [GameColor.RED]:     0xFF0044, // Bright cherry red
  [GameColor.GREEN]:   0x00FF55, // Electric green
  [GameColor.BLUE]:    0x0088FF, // Electric blue
  [GameColor.YELLOW]:  0xFFDD00, // Sunny yellow
  [GameColor.MAGENTA]: 0xFF00AA, // Hot magenta
  [GameColor.CYAN]:    0x00FFFF, // Cyan
  [GameColor.WHITE]:   0xFFFFFF, // Pure white
};

// =============================================================================
// CHARACTER DEFINITIONS
// =============================================================================

export interface CharacterDefinition {
  id: string;
  name: string;
  texture: string;
  scale: number;
  hasAnimations: boolean;
  hasEyes: boolean;
  hitbox: { width: number; height: number; offsetX: number; offsetY: number };
}

export const CHARACTER = {
  RUNNER: {
    id: 'runner',
    name: 'Runner',
    texture: 'player-sprite',
    scale: 1.5,
    hasAnimations: true,
    hasEyes: false,
    hitbox: { width: 24, height: 32, offsetX: 4, offsetY: 0 },
  } as CharacterDefinition,
  CLASSIC: {
    id: 'classic',
    name: 'Classic',
    texture: 'player',
    scale: 1,
    hasAnimations: false,
    hasEyes: true,
    hitbox: { width: 24, height: 48, offsetX: 0, offsetY: 0 },
  } as CharacterDefinition,
  CAT: {
    id: 'cat',
    name: 'Cat',
    texture: 'cat-sprite',
    scale: 1.5,
    hasAnimations: true,
    hasEyes: false,
    hitbox: { width: 24, height: 20, offsetX: 4, offsetY: 8 },
  } as CharacterDefinition,
};

export const CHARACTER_DEFINITIONS: CharacterDefinition[] = [
  CHARACTER.RUNNER,
  CHARACTER.CLASSIC,
  CHARACTER.CAT,
];

// =============================================================================
// PLAYER PHYSICS
// =============================================================================

export const PLAYER = {
  /** Horizontal movement speed (pixels/second) */
  MOVE_SPEED: 300,
  /** Jump velocity (negative = up) */
  JUMP_VELOCITY: -500,
  /** Gravity applied to player (pixels/second^2) */
  GRAVITY: 800,
  /** Player hitbox dimensions - rectangular like Thomas was Alone characters */
  WIDTH: 24,
  HEIGHT: 48,
} as const;

// =============================================================================
// PLATFORM CONFIGURATION
// =============================================================================

export const PLATFORM = {
  /** Default platform dimensions */
  WIDTH: 100,
  HEIGHT: 16,
  /** Horizontal spacing between platforms */
  MIN_GAP_X: 60,
  MAX_GAP_X: 200,
  /** Vertical spacing between platforms */
  MIN_GAP_Y: 60,
  MAX_GAP_Y: 120,
} as const;

// =============================================================================
// DIFFICULTY PROGRESSION
// =============================================================================

export const DIFFICULTY = {
  // Scroll speed (camera push)
  INITIAL_SCROLL_SPEED: 30,     // Starting speed when floor mechanic kicks in
  MAX_SCROLL_SPEED: 100,        // pixels/second at max difficulty
  SCROLL_ACCELERATION: 0.5,     // per second
  
  // Platform spacing
  INITIAL_MAX_GAP_Y: 80,
  FINAL_MAX_GAP_Y: 150,
  
  // Platform size
  INITIAL_PLATFORM_WIDTH: 120,
  FINAL_PLATFORM_WIDTH: 60,
  
  // Timeline (in pixels of height climbed)
  PHASE_2_HEIGHT: 1000,   // Secondary colors appear
  PHASE_3_HEIGHT: 3000,   // White platforms appear
  MAX_DIFFICULTY_HEIGHT: 8000,  // Full difficulty reached
  
  // Grace period before forced scroll
  GRACE_PERIOD: 500,
  
  // Rising floor mechanic
  /** Height in pixels before forced camera scroll starts (~10 platforms) */
  FLOOR_START_HEIGHT: 750,
  /** Average pixels per platform for height display conversion */
  HEIGHT_PER_PLATFORM: 75,
  
  // Early game (tutorial-like) phase
  /** Height in pixels for easy phase (~5 platforms) */
  EASY_PHASE_HEIGHT: 375,
  /** Probability (0-1) of keeping same color as previous platform in easy phase */
  EASY_PHASE_SAME_COLOR_CHANCE: 0.7,
  /** Max vertical gap during easy phase (smaller = easier) */
  EASY_PHASE_MAX_GAP_Y: 70,
  /** Max horizontal distance from previous platform during easy phase */
  EASY_PHASE_MAX_X_DRIFT: 150,
} as const;

// =============================================================================
// GAME CANVAS
// =============================================================================

export const GAME = {
  WIDTH: 480,
  HEIGHT: 720,
  BACKGROUND_COLOR: 0xFFF8E7, // Warm cream
} as const;

// =============================================================================
// CAMERA
// =============================================================================

export const CAMERA = {
  /** Look-ahead buffer for camera deadzone */
  DEADZONE_HEIGHT: 100,
  /** How far ahead to spawn platforms */
  SPAWN_AHEAD: 800,
  /** How far behind to cull platforms */
  CULL_BEHIND: 100,
} as const;

// =============================================================================
// VISUAL SETTINGS
// =============================================================================

export const VISUAL = {
  /** Alpha for non-solid (mismatched color) platforms */
  PLATFORM_INACTIVE_ALPHA: 0.3,
  /** Alpha for solid (matched color) platforms */
  PLATFORM_ACTIVE_ALPHA: 1.0,
  /** Duration of alpha transition in ms */
  ALPHA_TRANSITION_MS: 150,
  /** Shadow opacity (0-1) - very soft Thomas Was Alone style */
  SHADOW_ALPHA: 0.08,
  /** Shadow light source angle in degrees - randomized each game (30 = light from top-right, shadow down-left) */
  SHADOW_LIGHT_ANGLE: 90,
  /** Minimum random shadow angle (light from top-right) */
  SHADOW_ANGLE_MIN: 30,
  /** Maximum random shadow angle (light from top-left) */
  SHADOW_ANGLE_MAX: 150,
  /** Shadow spread at the end (perspective width) */
  SHADOW_SPREAD: 15,
};

// =============================================================================
// STORAGE
// =============================================================================

export const STORAGE = {
  /** LocalStorage key for selected character index */
  SELECTED_CHARACTER_INDEX: 'chromask_selected_character',
} as const;

// =============================================================================
// HELP DIALOG
// =============================================================================

export const HELP_DIALOG = {
  /** Background color (dark) */
  BACKGROUND_COLOR: 0x000000,
  /** Background transparency */
  BACKGROUND_ALPHA: 0.5,
  /** Padding inside the dialog */
  PADDING: 24,
  /** Border radius */
  BORDER_RADIUS: 12,
  /** Text color */
  TEXT_COLOR: '#ffffff',
  /** Title font size */
  TITLE_FONT_SIZE: '24px',
  /** Body font size */
  BODY_FONT_SIZE: '16px',
  /** Line spacing */
  LINE_HEIGHT: 1.4,
} as const;

// =============================================================================
// AUDIO
// =============================================================================

/** Maps GameColor enum values to string names for sound file keys */
export const COLOR_NAMES: Record<GameColor, string> = {
  [GameColor.NONE]: 'NONE',
  [GameColor.RED]: 'RED',
  [GameColor.GREEN]: 'GREEN',
  [GameColor.BLUE]: 'BLUE',
  [GameColor.YELLOW]: 'YELLOW',
  [GameColor.MAGENTA]: 'MAGENTA',
  [GameColor.CYAN]: 'CYAN',
  [GameColor.WHITE]: 'WHITE',
};

export const AUDIO = {
  // Sound keys for Phaser
  KEYS: {
    JUMP: ['sfx-jump', 'sfx-jump-yahhh', 'sfx-jump-whooo', 'sfx-jump-yipi'],
    PLATFORM_HIT: 'sfx-platform-hit', // Will be suffixed with color name
    GAME_START: 'sfx-game-start',
    GAME_OVER: 'sfx-game-over',
    COLOR_TOGGLE: 'sfx-color-toggle',
    BRUH: ['sfx-bruh1', 'sfx-bruh2', 'sfx-bruh3'],
    WARNING: 'sfx-warning',
    MUSIC: 'sfx-music',
  },
  // File paths (relative to public/)
  FILES: {
    'sfx-jump': 'assets/sounds/SFX JUMP.wav',
    'sfx-jump-yahhh': 'assets/sounds/SFX JUMP YAHHH.wav',
    'sfx-jump-whooo': 'assets/sounds/SFX JUMP WHOOO.wav',
    'sfx-jump-yipi': 'assets/sounds/SFX JUMP YIPI.wav',
    'sfx-platform-hit-RED': 'assets/sounds/SFX PF HIT - RED.wav',
    'sfx-platform-hit-GREEN': 'assets/sounds/SFX PF HIT - GREEN.wav',
    'sfx-platform-hit-BLUE': 'assets/sounds/SFX PF HIT - BLUE.wav',
    'sfx-platform-hit-YELLOW': 'assets/sounds/SFX PF HIT - YELLOW.wav',
    'sfx-platform-hit-MAGENTA': 'assets/sounds/SFX PF HIT - MAGENTA.wav',
    'sfx-platform-hit-CYAN': 'assets/sounds/SFX PF HIT - CYAN.wav',
    'sfx-platform-hit-WHITE': 'assets/sounds/SFX PF HIT - WHITE.wav',
    'sfx-game-start': 'assets/sounds/SFX GAME START.wav',
    'sfx-game-over': 'assets/sounds/SFX GAME OVER.wav',
    'sfx-color-toggle': 'assets/sounds/SFX COLOR TOGGLE ON_OFF.wav',
    'sfx-bruh1': 'assets/sounds/SFX BRUH1.wav',
    'sfx-bruh2': 'assets/sounds/SFX BRUH2.wav',
    'sfx-bruh3': 'assets/sounds/SFX BRUH3.wav',
    'sfx-warning': 'assets/sounds/SFX APPROACHING THE BOTTOM WARNING.wav',
    'sfx-music': 'assets/sounds/SFX SCROLL SPEED INCREASE.wav',
  },
  // Configuration
  CONFIG: {
    MUSIC_MIN_RATE: 1.0,
    MUSIC_MAX_RATE: 1.5,
    WARNING_COOLDOWN_MS: 3000,
    WARNING_IDLE_TIME_MS: 2000,
    WARNING_ZONE_PERCENT: 0.2, // Bottom 20% of screen
    NEAR_MISS_THRESHOLD: 50, // Pixels from death line
    BRUH_COOLDOWN_MS: 2000,
  },
} as const;
