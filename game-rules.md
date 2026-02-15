# Game Rules

Here is a refined ruleset for "Sudoku2".

## The Setup
1. The Board: A standard 9x9 Sudoku grid.
2. The Gold Digits: Place the digits 1 through 9 (one of each) randomly on the board
  * Constraint: These must be placed legally (no row, column, or block conflicts initially).
3. The Players: Blue vs. Red.

## Gameplay
1. Turns: Blue goes first. Players alternate turns.
2. The Move: On your turn, you must place a number (1-9) in an empty cell using your color. Passing is not allowed.
3. Placement Rules: You may place any number as long as it is currently valid according to standard Sudoku rules:
  * The number cannot already exist in that Row, Column, or 3x3 Block (regardless of color—Blue, Red, or Gold).

## Game End
The game ends immediately when one of the following occurs:
1. The board is completely full.
2. No legal move exists (the board is "locked").

## Scoring (The "Area Control" System)
There are 27 Points available (9 Rows + 9 Columns + 9 Blocks).

Count: For every Row, Column, and Block, count how many Blue numbers vs. Red numbers are inside.

Majority Wins: The player with the strictly higher count in that region wins 1 point.

Gold Numbers: Gold numbers count for neither player; they act as "blockers" that reduce the available slots in a region.

Ties: If Blue and Red have the same amount of numbers in a region (e.g., 3 Blue, 3 Red, 3 Gold), no point is awarded for that region.

Victory: The player with the highest total score wins. If the total score is tied, the player who placed the last legal number wins. Since Blue goes first and has a strategic advantage, this tiebreaker gives Red a compensating rule advantage.
