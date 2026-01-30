# Game Mechanics

## Core Concept

Chromask is an endless vertical climber inspired by Icy Tower. The player ascends an infinite tower of colored platforms while the camera continuously scrolls upward. The unique twist: platforms are only solid when they match the player's currently active color. Players must constantly switch between colors to land on the right platforms and avoid falling through mismatched ones.

The game ends when the player falls off the bottom of the screen. Success requires quick reflexes, color recognition, and strategic planning to maintain upward momentum while managing the color-switching mechanic.

As the player climbs higher, the difficulty increases through faster camera scrolling, more complex color combinations, and smaller platform sizes. The challenge lies in coordinating movement, jumping, and real-time color mixing under increasing time pressure.

## Color System

The game uses an additive RGB color mixing system. Players hold down combinations of three base color keys to create their active color:

| Keys Held | Active Color |
|-----------|--------------|
| None | None (all platforms pass-through) |
| 1 | Red |
| 2 | Green |
| 3 | Blue |
| 1+2 | Yellow |
| 1+3 | Magenta |
| 2+3 | Cyan |
| 1+2+3 | White |

The active color determines which platforms are solid. Players can change their color instantly by pressing or releasing the color keys, allowing for mid-air color switches.

## Platform Rules

Platforms follow strict color-matching rules:

- **Exact Match Required**: A platform is only solid when it exactly matches the player's active color. There is no partial matching or color similarity.
- **Non-Matching Platforms**: Platforms that don't match the active color become semi-transparent and allow the player to pass through them completely.
- **Matching Platforms**: Platforms that match the active color are fully opaque and provide solid collision for standing and jumping.

This binary solid/pass-through behavior creates the core challenge: players must constantly evaluate upcoming platforms and switch colors to match them before landing.

## Controls

| Action | Keys |
|--------|------|
| Move | Arrow keys / WASD |
| Jump | Up / W / Space |
| Hold Red | 1 |
| Hold Green | 2 |
| Hold Blue | 3 |
| Show Help | / (hold) |

Color keys can be held in any combination. Movement and jumping work independently of color selection, allowing players to move and switch colors simultaneously.

## Difficulty Progression

The game increases in difficulty as the player climbs higher:

**Early Game (0-100 platforms)**
- Only primary colors appear: Red, Green, Blue
- Slow camera scroll speed
- Large, generously-sized platforms
- Ample time to react and plan color switches

**Mid Game (100-300 platforms)**
- Secondary colors introduced: Yellow, Magenta, Cyan
- Moderate camera scroll speed
- Medium-sized platforms
- Requires two-key combinations and faster decision-making

**Late Game (300+ platforms)**
- All colors including White (three-key combination)
- Fast camera scroll speed
- Small platforms with tighter spacing
- Demands mastery of all color combinations and precise timing

The scroll speed gradually increases, forcing players to climb faster and make quicker color-switching decisions to survive.

## Scoring

Score is based on the height climbed, measured in platform units. Each platform successfully reached adds to the player's score. Higher scores indicate greater mastery of the color-switching mechanic and platforming skills.

The game tracks the highest score achieved across sessions, encouraging players to improve their performance and climb higher with each attempt.

## Additional Resources

For complete design specifications, technical implementation details, and development roadmap, see [GAME_DESIGN.md](../GAME_DESIGN.md).
