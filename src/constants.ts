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

/** Hex color values for rendering - Thomas was Alone inspired matte colors */
export const COLOR_HEX: Record<GameColor, number> = {
  [GameColor.NONE]:    0x555555, // Gray (for UI only)
  [GameColor.RED]:     0xCC3333, // Muted red
  [GameColor.GREEN]:   0x33AA33, // Muted green
  [GameColor.BLUE]:    0x3366CC, // Muted blue
  [GameColor.YELLOW]:  0xCCCC33, // Muted yellow
  [GameColor.MAGENTA]: 0xAA33AA, // Muted magenta
  [GameColor.CYAN]:    0x33CCCC, // Muted cyan
  [GameColor.WHITE]:   0xEEEEEE, // Off-white
};

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
  BACKGROUND_COLOR: 0x2D2D2D, // Dark warm gray like Thomas was Alone background
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
