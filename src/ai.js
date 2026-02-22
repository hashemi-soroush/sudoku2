let aiEnabled = false;
let aiThinking = false;
let aiTimeoutId = null;

// --- AI player (greedy) ---
function aiChooseMove() {
  let bestScore = -Infinity;
  let bestMoves = [];
  const aiColor = currentPlayer;
  const oppColor = aiColor === 'blue' ? 'red' : 'blue';

  for (let i = 0; i < 81; i++) {
    if (board[i].value) continue;
    const digits = legalDigits(i);
    for (const d of digits) {
      // Simulate
      board[i] = { value: d, color: aiColor };
      const scores = computeScores();
      const delta = scores[aiColor + 'Score'] - scores[oppColor + 'Score'];
      // Undo
      board[i] = { value: null, color: null };

      if (delta > bestScore) {
        bestScore = delta;
        bestMoves = [{ cell: i, digit: d }];
      } else if (delta === bestScore) {
        bestMoves.push({ cell: i, digit: d });
      }
    }
  }
  if (bestMoves.length === 0) return null;
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function aiTurn() {
  if (gameOver || !aiEnabled || currentPlayer !== 'red') return;
  aiThinking = true;
  aiTimeoutId = setTimeout(() => {
    aiTimeoutId = null;
    if (gameOver || !aiEnabled || currentPlayer !== 'red') { aiThinking = false; return; }
    const move = aiChooseMove();
    if (move) {
      placeDigit(rowOf(move.cell), colOf(move.cell), move.digit);
    } else if (!gameOver) {
      // No legal moves for AI: end the game
      endGame();
    }
    aiThinking = false;
  }, 400);
}
