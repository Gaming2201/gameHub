let gameover = false; // מציין אם המשחק נגמר
const boardSize = 10; // גודל הלוח
const shipConfigs = [2, 3, 3, 4, 5]; // אורכי הספינות שיופיעו במשחק
let playerHits = 0, aiHits = 0; // מספר הפגיעות של כל צד
let bumpCount = 2, turnCounter = 0; // כמות באמפים ומונה תורות
const playerGrid = createEmptyGrid(); // לוח השחקן (ריק בהתחלה)
const aiGrid = createEmptyGrid();     // לוח AI (ריק בהתחלה)
let totalPlayerShipCells = 0;
let totalAIShipCells = 0;

// קישור לאלמנטים בדף
const playerBoard = document.getElementById("player-board");
const aiBoard = document.getElementById("ai-board");
const message = document.getElementById("message");
const explosionSound = document.getElementById("explosion-sound");
const waterDropSound = document.getElementById("water-drop-sound");
const bumpSound = document.getElementById("bump-sound");
const aiHitSound = document.getElementById("ai-hit-sound");
const bumpCountSpan = document.getElementById("bump-count");
const bumpBtn = document.getElementById("use-bump");
const gameArea = document.getElementById("game-area");
const winSound = document.getElementById("win-sound");
const loseSound = document.getElementById("lose-sound");
const startSound = document.getElementById("start-sound");

// משמיע קול פתיחה בלחיצה ראשונה
function playStartSoundOnce() {
  startSound.play();
  document.removeEventListener('click', playStartSoundOnce);
}
document.addEventListener('click', playStartSoundOnce);

// משתנים פנימיים למעקב ופעולה
let targetQueue = []; // תור למטרות המשך לאחר פגיעות
let aiShips = [], playerShips = [];
let bumpMode = false;

// משתנים לחוכמת התקיפה של AI
let aiTargetHits = [];
let aiDirection = null;
let aiTried = new Set(); // תאים ש-AI כבר ניסה

// לחיצה על כפתור באמפ
bumpBtn.addEventListener('click', () => {
  if (bumpCount > 0) {
    bumpMode = true;
    message.textContent = "🎯 Click a target for bump (3x3)!";
  } else {
    message.textContent = "❌ No bumps left!";
  }
});

// עדכון תצוגת באמפ
function updateBumpDisplay() {
  bumpCountSpan.textContent = bumpCount;
}

// 10x10 יצירת לוח ריק בגודל 
function createEmptyGrid() {
  return Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
}

// מציב ספינות על לוח עם בדיקה שהן לא צמודות
function placeShips(grid) {
  const ships = [];
  const isCellSafe = (r, c) => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
          if (grid[nr][nc] === 'ship') return false;
        }
      }
    }
    return true;
  };

  let total = 0;
  for (const length of shipConfigs) {
    let placed = false;
    while (!placed) {
      const isHorizontal = Math.random() < 0.5;
      const rStart = Math.floor(Math.random() * (isHorizontal ? boardSize : boardSize - length + 1));
      const cStart = Math.floor(Math.random() * (isHorizontal ? boardSize - length + 1 : boardSize));
      const coords = [];
      let valid = true;

      for (let i = 0; i < length; i++) {
        const r = isHorizontal ? rStart : rStart + i;
        const c = isHorizontal ? cStart + i : cStart;
        if (!isCellSafe(r, c) || grid[r][c] === 'ship') {
          valid = false;
          break;
        }
        coords.push([r, c]);
      }

      if (valid) {
        coords.forEach(([r, c]) => grid[r][c] = 'ship');
        ships.push({ coords: coords, hits: [] });
        total += length;
        placed = true;
      }
    }
  }
  return { total, ships };
}

// מחזירה תאים סמוכים לצורך חיפוש מטרות
function getAdjacentCells(r, c) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const adjacent = [];
  for (const [dr, dc] of directions) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
      const cell = aiBoard.rows[nr].cells[nc];
      if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
        adjacent.push([nr, nc]);
      }
    }
  }
  return adjacent;
}

// מסמן ספינה שטובעה באייקון 💀
function markSunkShip(ship, isPlayer = false) {
  ship.coords.forEach(([r, c]) => {
    const board = isPlayer ? playerBoard : aiBoard;
    const cell = board.rows[r].cells[c];
    cell.textContent = '💀';
  });
}

// משנה את תצוגת תור השחקן או AI
function updateTurnIndicator(isPlayerTurn) {
  if (isPlayerTurn) {
    gameArea.classList.add('player-turn');
    gameArea.classList.remove('ai-turn');
  } else {
    gameArea.classList.add('ai-turn');
    gameArea.classList.remove('player-turn');
  }
}

// ביצוע באמפ - תקיפה סביב תא נבחר
function performBump(r, c) {
  bumpSound.play();
  const bumpPattern = [
    [r, c], [r-1, c], [r+1, c], [r, c-1], [r, c+1]
  ];

  bumpPattern.forEach(([nr, nc]) => {
    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
      playerAttack(nr, nc, true);
    }
  });

  bumpCount--;
  bumpMode = false;
  updateBumpDisplay();
}

// תור השחקן/המשתמש
function playerAttack(r, c, isBump = false) {
  const cell = aiBoard.rows[r].cells[c];
  if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

  if (!isBump) {
    turnCounter++;
    if (turnCounter % 10 === 0) {
      bumpCount++;
      updateBumpDisplay();
    }
  }

  updateTurnIndicator(true);

  if (aiGrid[r][c] === 'ship') {
    cell.classList.add('hit');
    explosionSound.play();
    playerHits++;
    message.textContent = "🎯 Hit on AI ship!";
    targetQueue.unshift(...getAdjacentCells(r, c));

    for (const ship of aiShips) {
      for (const [sr, sc] of ship.coords) {
        if (sr === r && sc === c) {
          ship.hits.push([r, c]);
          if (ship.hits.length === ship.coords.length) {
            markSunkShip(ship);
            message.textContent = "🔥 You sunk a ship!";
          }
          break;
        }
      }
    }
  } else {
    cell.classList.add('miss');
    waterDropSound.play();
    if (!isBump) {
      message.textContent = "💧 You missed!";
      updateTurnIndicator(false);
      setTimeout(aiTurn, 1200);
    }
  }

  if (playerHits === totalAIShipCells) {
    gameover = true;
    winSound.play();
    message.textContent = "🏆 You sank all AI ships!";
  }
}

// תור של ה-AI
function aiTurn() {
  updateTurnIndicator(false);

  function getNextTarget() {
    if (aiTargetHits.length === 0) return null;

    if (aiDirection) {
      const [lastR, lastC] = aiTargetHits[aiTargetHits.length - 1];
      const [dR, dC] = aiDirection;
      const nextR = lastR + dR;
      const nextC = lastC + dC;
      if (nextR >= 0 && nextR < boardSize && nextC >= 0 && nextC < boardSize && !aiTried.has(`${nextR},${nextC}`)) {
        return [nextR, nextC];
      } else {
        aiDirection = [-dR, -dC];
        const [firstR, firstC] = aiTargetHits[0];
        const reverseR = firstR + aiDirection[0];
        const reverseC = firstC + aiDirection[1];
        if (reverseR >= 0 && reverseR < boardSize && reverseC >= 0 && reverseC < boardSize && !aiTried.has(`${reverseR},${reverseC}`)) {
          return [reverseR, reverseC];
        }
      }
      aiTargetHits = [];
      aiDirection = null;
    }

    const directions = [[0,1],[1,0],[-1,0],[0,-1]];
    for (const [r, c] of aiTargetHits) {
      for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && !aiTried.has(`${nr},${nc}`)) {
          return [nr, nc];
        }
      }
    }

    aiTargetHits = [];
    aiDirection = null;
    return null;
  }

  let r, c;
  let target = getNextTarget();
  if (target) {
    [r, c] = target;
  } else {
    do {
      r = Math.floor(Math.random() * boardSize);
      c = Math.floor(Math.random() * boardSize);
    } while (aiTried.has(`${r},${c}`));
  }

  aiTried.add(`${r},${c}`);
  const cell = playerBoard.rows[r].cells[c];

  if (playerGrid[r][c] === 'ship') {
    playerGrid[r][c] = 'hit';
    cell.classList.add('hit');
    aiHitSound.play();
    aiHits++;
    message.textContent = "💥 AI hit your ship!";
    aiTargetHits.push([r, c]);

    if (aiTargetHits.length >= 2 && !aiDirection) {
      const [r1, c1] = aiTargetHits[0];
      const [r2, c2] = aiTargetHits[1];
      aiDirection = [r2 - r1, c2 - c1];
    }

    for (const ship of playerShips) {
      for (const [sr, sc] of ship.coords) {
        if (sr === r && sc === c) {
          if (!ship.hits.some(([hr, hc]) => hr === r && hc === c)) {
            ship.hits.push([r, c]);
          }

          if (ship.hits.length === ship.coords.length) {
            markSunkShip(ship, true);
            message.textContent = "💀 AI sunk one of your ships!";
            aiTargetHits = [];
            aiDirection = null;
          }
          break;
        }
      }
    }

    if (aiHits === totalPlayerShipCells) {
      gameover = true;
      loseSound.play();
      message.textContent = "💀 AI sank all your ships!";
    } else {
      setTimeout(aiTurn, 900);
    }
  } else {
    playerGrid[r][c] = 'miss';
    cell.classList.add('miss');
    waterDropSound.play();
    message.textContent = "😅 AI missed!";
    updateTurnIndicator(true);
  }
}

// יצירת הלוח בפועל בדף
function createBoard(boardElem, grid, isAI = false) {
  for (let r = 0; r < boardSize; r++) {
    const row = boardElem.insertRow();
    for (let c = 0; c < boardSize; c++) {
      const cell = row.insertCell();
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (!isAI && grid[r][c] === 'ship') {
        cell.classList.add('ship');
      }

      if (isAI) {
        cell.addEventListener('click', () => {
          if (gameover) return;

          if (bumpMode) {
            performBump(r, c);
          } else if (targetQueue.length > 0) {
            const [tr, tc] = targetQueue.shift();
            playerAttack(tr, tc);
          } else {
            playerAttack(r, c);
          }
        });
      }
    }
  }
}

// התחלת המשחק: הצבת ספינות ויצירת הלוחות
const playerData = placeShips(playerGrid);
const aiData = placeShips(aiGrid);

totalPlayerShipCells = playerData.total;
totalAIShipCells = aiData.total;

playerShips = playerData.ships;
aiShips = aiData.ships;

createBoard(playerBoard, playerGrid, false);
createBoard(aiBoard, aiGrid, true);

updateTurnIndicator(true);
updateBumpDisplay();
