const board = []; // board[row*9+col] = { value, color }

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
