# Project Notes for Claude

## Project Overview
Two-player Sudoku game (Blue vs Red) with gold pre-placed digits and a greedy AI (plays Red).

## File Structure & Ownership
Load order: `theme.js` → `engine.js` → `ai.js` → `ui.js` → `game.js`

- **engine.js**: Core game mechanics — board data, Sudoku rules (`legalDigits`, `usedInRegion`, `anyLegalMoveExists`), scoring (`computeScores`). Named "engine" not "board" because it owns all shared mechanics, not just board layout.
- **ai.js**: AI state (`aiEnabled`, `aiThinking`, `aiTimeoutId`), `aiChooseMove`, `aiTurn`
- **ui.js**: `renderBoard`, `updateStatus`, `updateScoreDetail`, picker logic
- **game.js**: `placeGoldDigits`, `placeDigit`, `endGame`, `initGame`

## Known Architectural Issues
**Circular dependency between `ai.js` and `game.js`** (deferred — needs TypeScript to fix cleanly):
- `game.js` (`placeDigit`) → calls `aiTurn` (ai.js)
- `ai.js` (`aiTurn`) → calls `placeDigit`, `endGame` (game.js)

## Ownership Principles
- "Gold" is a game concept → `placeGoldDigits` belongs in `game.js`, not `engine.js`
- `computeScores` is a shared game mechanic → belongs in `engine.js` (accessible to AI, UI, and game logic)
- Pure Sudoku rules (no color/player concepts) belong in `engine.js`
