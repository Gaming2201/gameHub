const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const finalScore = document.getElementById('finalScore');

const tileSize = 20;
let score = 0;
let totalPellets = 0;
let pelletsEaten = 0;
let isGameOver = false;

// Web Audio Sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playEatSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

function playGameOverSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// 22x22 Grid Map
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,1,2,2,1,1,1,1,0,1,1,1,1,1],
  [2,2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
  [1,1,1,1,1,0,1,2,1,1,2,2,1,1,2,1,0,1,1,1,1,1],
  [2,2,2,2,2,0,2,2,1,2,2,2,2,1,2,2,0,2,2,2,2,2],
  [1,1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1,1],
  [2,2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
  [1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

for (let r = 0; r < map.length; r++) {
  for (let c = 0; c < map[r].length; c++) {
    if (map[r][c] === 0) totalPellets++;
  }
}

// Pacman
const pacman = {
  x: 10 * tileSize,
  y: 14 * tileSize,
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  speed: 2,
  mouthAngle: 0.2,
  mouthSpeed: 0.02,
  rotation: 0
};

// 5 Ghosts with Random AI Logic
const ghosts = [
  { x: 10 * tileSize, y: 8 * tileSize, dx: 1, dy: 0, speed: 2, color: '#FF0000' }, // Red
  { x: 11 * tileSize, y: 8 * tileSize, dx: -1, dy: 0, speed: 2, color: '#FFB8FF' }, // Pink
  { x: 9 * tileSize,  y: 8 * tileSize, dx: 0, dy: -1, speed: 2, color: '#00FFFF' }, // Cyan
  { x: 10 * tileSize, y: 10 * tileSize, dx: 0, dy: 1, speed: 2, color: '#FFB852' }, // Orange
  { x: 11 * tileSize, y: 10 * tileSize, dx: 1, dy: 0, speed: 2, color: '#00FF00' }  // Green
];

// Check Movement Collision
function canEntityMove(x, y, dx, dy) {
  const nextX = x + dx * 2;
  const nextY = y + dy * 2;
  
  const margin = 1;
  const tX1 = Math.floor((nextX + margin) / tileSize);
  const tY1 = Math.floor((nextY + margin) / tileSize);
  const tX2 = Math.floor((nextX + tileSize - 1 - margin) / tileSize);
  const tY2 = Math.floor((nextY + tileSize - 1 - margin) / tileSize);

  if (tY1 < 0 || tY2 >= map.length || tX1 < 0 || tX2 >= map[0].length) return false;

  return (
    map[tY1][tX1] !== 1 &&
    map[tY1][tX2] !== 1 &&
    map[tY2][tX1] !== 1 &&
    map[tY2][tX2] !== 1
  );
}

function setDirection(dx, dy, rot) {
  pacman.nextDirX = dx;
  pacman.nextDirY = dy;
  pacman.rotation = rot;
}

// Keyboards Controls
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') setDirection(0, -1, 1.5 * Math.PI);
  if (e.key === 'ArrowDown' || e.key === 's') setDirection(0, 1, 0.5 * Math.PI);
  if (e.key === 'ArrowLeft' || e.key === 'a') setDirection(-1, 0, Math.PI);
  if (e.key === 'ArrowRight' || e.key === 'd') setDirection(1, 0, 0);
});

function showGameOverModal(title) {
  isGameOver = true;
  modalTitle.innerText = title;
  modalTitle.style.color = title === "YOU WIN!" ? "#00ff00" : "#ff3333";
  finalScore.innerText = score;
  gameModal.classList.remove('hidden');
}

function restartGame() {
  location.reload();
}

function update() {
  if (isGameOver) return;

  // Pacman Movement
  if (canEntityMove(pacman.x, pacman.y, pacman.nextDirX, pacman.nextDirY)) {
    pacman.dirX = pacman.nextDirX;
    pacman.dirY = pacman.nextDirY;
  }

  if (canEntityMove(pacman.x, pacman.y, pacman.dirX, pacman.dirY)) {
    pacman.x += pacman.dirX * pacman.speed;
    pacman.y += pacman.dirY * pacman.speed;

    pacman.mouthAngle += pacman.mouthSpeed;
    if (pacman.mouthAngle > 0.4 || pacman.mouthAngle < 0.05) {
      pacman.mouthSpeed = -pacman.mouthSpeed;
    }
  }

  // Eating Dots
  const tileC = Math.floor((pacman.x + tileSize / 2) / tileSize);
  const tileR = Math.floor((pacman.y + tileSize / 2) / tileSize);

  if (map[tileR] && map[tileR][tileC] === 0) {
    map[tileR][tileC] = 2;
    score += 10;
    pelletsEaten++;
    scoreEl.innerText = score;
    playEatSound();

    if (pelletsEaten === totalPellets) {
      showGameOverModal("YOU WIN!");
    }
  }

  // Ghost AI Movement & Collision
  ghosts.forEach(g => {
    const isAtGridCenter = (g.x % tileSize === 0) && (g.y % tileSize === 0);

    if (isAtGridCenter) {
      const possibleDirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ].filter(d => canEntityMove(g.x, g.y, d.dx, d.dy) && !(d.dx === -g.dx && d.dy === -g.dy));

      if (possibleDirs.length > 0) {
        const randomDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
        g.dx = randomDir.dx;
        g.dy = randomDir.dy;
      } else if (!canEntityMove(g.x, g.y, g.dx, g.dy)) {
        g.dx = -g.dx;
        g.dy = -g.dy;
      }
    }

    if (canEntityMove(g.x, g.y, g.dx, g.dy)) {
      g.x += g.dx * g.speed;
      g.y += g.dy * g.speed;
    } else {
      g.dx = -g.dx;
      g.dy = -g.dy;
    }

    // Hit Test
    const dist = Math.hypot((pacman.x + 10) - (g.x + 10), (pacman.y + 10) - (g.y + 10));
    if (dist < 12) {
      playGameOverSound();
      showGameOverModal("GAME OVER");
      // बटन्स को क्लिक या टच करने पर Pac-Man की दिशा बदलो
document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('up'); });
document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('down'); });
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('left'); });
document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('right'); });

// Normal Click For Testing on PC
document.getElementById('btn-up').addEventListener('click', () => changeDirection('up'));
document.getElementById('btn-down').addEventListener('click', () => changeDirection('down'));
document.getElementById('btn-left').addEventListener('click', () => changeDirection('left'));
document.getElementById('btn-right').addEventListener('click', () => changeDirection('right'));

// ==========================================
// Mobile Touch Controls (Fix for Mobile Touch)
// ==========================================
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

function triggerKey(keyName) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: keyName }));
}

if (btnUp && btnDown && btnLeft && btnRight) {
    // Up Button
    btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); triggerKey('ArrowUp'); });
    btnUp.addEventListener('click', () => triggerKey('ArrowUp'));

    // Down Button
    btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); triggerKey('ArrowDown'); });
    btnDown.addEventListener('click', () => triggerKey('ArrowDown'));

    // Left Button
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); triggerKey('ArrowLeft'); });
    btnLeft.addEventListener('click', () => triggerKey('ArrowLeft'));

    // Right Button
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); triggerKey('ArrowRight'); });
    btnRight.addEventListener('click', () => triggerKey('ArrowRight'));
}
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Map
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 1) {
        ctx.fillStyle = '#1919a6';
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      } else if (map[r][c] === 0) {
        ctx.fillStyle = '#ffb8ae';
        ctx.beginPath();
        ctx.arc(c * tileSize + 10, r * tileSize + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw Pacman
  ctx.save();
  ctx.translate(pacman.x + 10, pacman.y + 10);
  ctx.rotate(pacman.rotation);
  ctx.fillStyle = '#FFCC00';
  ctx.beginPath();
  ctx.arc(0, 0, 9, pacman.mouthAngle, Math.PI * 2 - pacman.mouthAngle);
  ctx.lineTo(0, 0);
  ctx.fill();
  ctx.restore();

  // Draw 5 Ghosts
  ghosts.forEach(g => {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(g.x + 10, g.y + 8, 8, Math.PI, 0, false);
    ctx.lineTo(g.x + 18, g.y + 18);
    ctx.lineTo(g.x + 14, g.y + 15);
    ctx.lineTo(g.x + 10, g.y + 18);
    ctx.lineTo(g.x + 6,  g.y + 15);
    ctx.lineTo(g.x + 2,  g.y + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(g.x + 7, g.y + 7, 2.5, 0, Math.PI * 2);
    ctx.arc(g.x + 13, g.y + 7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00F';
    ctx.beginPath();
    ctx.arc(g.x + 7, g.y + 7, 1, 0, Math.PI * 2);
    ctx.arc(g.x + 13, g.y + 7, 1, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ==========================================
// PC + MOBILE UNIVERSAL CONTROLS
// ==========================================

function movePacman(directionKey) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: directionKey }));
}

const controls = [
    { id: 'btn-up', key: 'ArrowUp' },
    { id: 'btn-down', key: 'ArrowDown' },
    { id: 'btn-left', key: 'ArrowLeft' },
    { id: 'btn-right', key: 'ArrowRight' }
];

controls.forEach(control => {
    const btn = document.getElementById(control.id);
    if (btn) {
        // मोबाइल टच सपोर्ट
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            movePacman(control.key);
        });

        // PC माउस क्लिक सपोर्ट
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            movePacman(control.key);
        });
    }
});

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();