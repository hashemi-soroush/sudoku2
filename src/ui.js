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
