let currentPlayer = 'blue';
let lastPlayer = null;
let gameOver = false;

// --- Gold placement ---
function placeGoldDigits() {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  for (const d of digits) {
    const candidates = [];
    for (let i = 0; i < 81; i++) {
      if (!board[i].value && legalDigits(i).includes(d)) candidates.push(i);
    }
    if (candidates.length === 0) return false; // shouldn't happen but safety
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    board[pick] = { value: d, color: 'gold' };
  }
  return true;
}

// --- Game logic ---
function placeDigit(r, c, digit) {
  board[idx(r, c)] = { value: digit, color: currentPlayer };
  lastPlayer = currentPlayer;
  currentPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
  renderBoard();

  // Check game end
  const emptyCells = board.filter(cell => !cell.value).length;
  if (emptyCells === 0 || !anyLegalMoveExists()) {
    endGame();
  } else {
    updateStatus();
    updateScoreDetail();
    aiTurn();
  }
}

function endGame() {
  gameOver = true;
  if (aiTimeoutId) { clearTimeout(aiTimeoutId); aiTimeoutId = null; }
  aiThinking = false;
  const { blueScore, redScore } = computeScores();
  const statusEl = document.getElementById('status');
  let result;
  if (blueScore > redScore) result = '<span class="blue">Blue wins!</span>';
  else if (redScore > blueScore) result = '<span class="red">Red wins!</span>';
  else result = `<span class="${lastPlayer}">Tie — ${capitalize(lastPlayer)} wins</span> (last placement)`;
  statusEl.innerHTML = `Game Over — ${result}`;
  updateScoreDetail();
}

// --- Init ---
function initGame() {
  if (aiTimeoutId) { clearTimeout(aiTimeoutId); aiTimeoutId = null; }
  aiThinking = false;
  hidePicker();
  gameOver = false;
  currentPlayer = 'blue';
  lastPlayer = null;
  document.getElementById('score-detail').textContent = '';
  for (let i = 0; i < 81; i++) board[i] = { value: null, color: null };
  // Retry gold placement if it somehow fails
  let ok = false;
  for (let attempt = 0; attempt < 100 && !ok; attempt++) {
    for (let i = 0; i < 81; i++) board[i] = { value: null, color: null };
    ok = placeGoldDigits();
  }
  renderBoard();
  updateStatus();
  updateScoreDetail();
}

document.getElementById('new-game').addEventListener('click', initGame);
document.getElementById('opponent').addEventListener('change', function () {
  aiEnabled = this.value === 'ai';
  initGame();
});
aiEnabled = document.getElementById('opponent').value === 'ai';
initGame();
