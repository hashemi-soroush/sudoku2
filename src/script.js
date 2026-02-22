const board = []; // board[row*9+col] = { value, color }
let currentPlayer = 'blue';
let lastPlayer = null;
let gameOver = false;
let aiEnabled = false;
let aiThinking = false;
let aiTimeoutId = null;

// --- Helpers ---
function idx(r, c) { return r * 9 + c; }
function rowOf(i) { return Math.floor(i / 9); }
function colOf(i) { return i % 9; }
function blockOf(i) { return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3); }

function regionCells(type, n) {
  const cells = [];
  if (type === 'row') { for (let c = 0; c < 9; c++) cells.push(idx(n, c)); }
  else if (type === 'col') { for (let r = 0; r < 9; r++) cells.push(idx(r, n)); }
  else { // block
    const br = Math.floor(n / 3) * 3, bc = (n % 3) * 3;
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push(idx(br + dr, bc + dc));
  }
  return cells;
}

function usedInRegion(type, n) {
  const used = new Set();
  for (const i of regionCells(type, n)) {
    if (board[i].value) used.add(board[i].value);
  }
  return used;
}

function legalDigits(cellIdx) {
  const r = rowOf(cellIdx), c = colOf(cellIdx), b = blockOf(cellIdx);
  const used = new Set([...usedInRegion('row', r), ...usedInRegion('col', c), ...usedInRegion('block', b)]);
  const legal = [];
  for (let d = 1; d <= 9; d++) if (!used.has(d)) legal.push(d);
  return legal;
}

function anyLegalMoveExists() {
  for (let i = 0; i < 81; i++) {
    if (!board[i].value && legalDigits(i).length > 0) return true;
  }
  return false;
}

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

// --- Scoring ---
function computeScores() {
  let blueScore = 0, redScore = 0;
  const regions = [];
  const types = ['row', 'col', 'block'];
  const labels = [];
  for (let n = 0; n < 9; n++) labels.push('Row ' + (n + 1));
  for (let n = 0; n < 9; n++) labels.push('Col ' + (n + 1));
  for (let n = 0; n < 9; n++) labels.push('Block ' + (n + 1));

  let li = 0;
  for (const type of types) {
    for (let n = 0; n < 9; n++) {
      let b = 0, r = 0;
      for (const i of regionCells(type, n)) {
        if (board[i].color === 'blue') b++;
        else if (board[i].color === 'red') r++;
      }
      let winner = null;
      if (b > r) { blueScore++; winner = 'blue'; }
      else if (r > b) { redScore++; winner = 'red'; }
      regions.push({ label: labels[li], blue: b, red: r, winner });
      li++;
    }
  }
  return { blueScore, redScore, regions };
}

// --- Rendering ---
function renderBoard() {
  const table = document.getElementById('board');
  table.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 9; c++) {
      const td = document.createElement('td');
      const cell = board[idx(r, c)];
      if (cell.value) {
        td.textContent = cell.value;
        td.className = cell.color + ' filled';
      } else {
        td.addEventListener('click', (e) => onCellClick(r, c, e));
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function updateStatus() {
  const el = document.getElementById('status');
  if (gameOver) return; // handled in endGame
  el.innerHTML = `<span class="${currentPlayer}">${capitalize(currentPlayer)}</span>'s turn`;
}

function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }

// --- Picker ---
function onCellClick(r, c, event) {
  if (gameOver || aiThinking) return;
  const cellIdx = idx(r, c);
  if (board[cellIdx].value) return;
  const digits = legalDigits(cellIdx);
  if (digits.length === 0) return;
  showPicker(r, c, digits, event);
}

function showPicker(r, c, digits, event) {
  const picker = document.getElementById('picker');
  const overlay = document.getElementById('picker-overlay');
  picker.innerHTML = '';
  for (const d of digits) {
    const btn = document.createElement('button');
    btn.textContent = d;
    btn.className = currentPlayer;
    btn.addEventListener('click', () => {
      placeDigit(r, c, d);
      hidePicker();
    });
    picker.appendChild(btn);
  }
  overlay.style.display = 'block';
  picker.style.display = 'block';

  // Position near the clicked cell
  const rect = event.target.getBoundingClientRect();
  picker.style.left = rect.left + 'px';
  picker.style.top = (rect.bottom + 4) + 'px';

  overlay.onclick = hidePicker;
}

function hidePicker() {
  document.getElementById('picker').style.display = 'none';
  document.getElementById('picker-overlay').style.display = 'none';
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

function updateScoreDetail() {
  const { blueScore, redScore, regions } = computeScores();
  const detailEl = document.getElementById('score-detail');
  if (!gameOver) {
    detailEl.innerHTML = `Score: <span class="blue">Blue ${blueScore}</span> — <span class="red">${redScore} Red</span>`;
    return;
  }
  // Show per-region breakdown at game end
  const lines = regions.map(r => {
    const w = r.winner ? `<span class="${r.winner}">${capitalize(r.winner)}</span>` : 'Tie';
    return `${r.label}: B${r.blue} R${r.red} → ${w}`;
  });
  detailEl.innerHTML = `<details><summary>Score: <span class="blue">Blue ${blueScore}</span> — <span class="red">${redScore} Red</span> (click for details)</summary><div style="columns:3;margin-top:6px;font-size:0.85em;line-height:1.6">${lines.join('<br>')}</div></details>`;
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
