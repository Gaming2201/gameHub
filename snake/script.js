// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game UI Elements
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const currentLevelEl = document.getElementById('currentLevel');
const finalScoreEl = document.getElementById('finalScore');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Grid & Board Dimensions
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game Variables
let snake = [];
let food = { x: 0, y: 0, type: 'normal' };
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('cyberSnakeHighScore') || 0;
let level = 1;
let gameSpeed = 120;
let gameInterval;
let isPlaying = false;
let goldenFoodTimer = null;

// Initialize High Score Display
highScoreEl.innerText = highScore;

// Event Listeners
document.addEventListener('keydown', changeDirection);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Start / Restart Game
function startGame() {
  snake = [
    { x: 10 * gridSize, y: 10 * gridSize },
    { x: 9 * gridSize, y: 10 * gridSize },
    { x: 8 * gridSize, y: 10 * gridSize }
  ];
  
  dx = gridSize;
  dy = 0;
  score = 0;
  level = 1;
  gameSpeed = 120;
  
  currentScoreEl.innerText = score;
  currentLevelEl.innerText = level;
  
  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  
  generateFood();
  
  if (gameInterval) clearInterval(gameInterval);
  isPlaying = true;
  gameInterval = setInterval(gameLoop, gameSpeed);
}

// Main Game Loop
function gameLoop() {
  if (!isPlaying) return;
  
  updateSnake();
  if (checkCollision()) {
    handleGameOver();
    return;
  }
  
  drawCanvas();
}

// Update Snake Movement & Eating Logic
function updateSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  
  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    if (food.type === 'golden') {
      score += 50;
      clearTimeout(goldenFoodTimer);
    } else {
      score += 10;
    }
    
    currentScoreEl.innerText = score;
    
    // Update High Score
    if (score > highScore) {
      highScore = score;
      highScoreEl.innerText = highScore;
      localStorage.setItem('cyberSnakeHighScore', highScore);
    }
    
    // Level Up Progression
    checkLevelUp();
    generateFood();
  } else {
    snake.pop(); // Remove tail if no food eaten
  }
}

// Check Level Progression & Speed Boost
function checkLevelUp() {
  const newLevel = Math.floor(score / 50) + 1;
  if (newLevel > level) {
    level = newLevel;
    currentLevelEl.innerText = level;
    
    // Speed up snake with every level up (Min Speed Limit = 50ms)
    gameSpeed = Math.max(50, 120 - (level - 1) * 10);
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Change Direction (Arrow Keys + WASD)
function changeDirection(event) {
  if (!isPlaying) return;
  
  const keyPressed = event.key.toLowerCase();
  
  const goingUp = dy === -gridSize;
  const goingDown = dy === gridSize;
  const goingRight = dx === gridSize;
  const goingLeft = dx === -gridSize;

  if ((keyPressed === 'arrowleft' || keyPressed === 'a') && !goingRight) {
    dx = -gridSize;
    dy = 0;
  }
  if ((keyPressed === 'arrowup' || keyPressed === 'w') && !goingDown) {
    dx = 0;
    dy = -gridSize;
  }
  if ((keyPressed === 'arrowright' || keyPressed === 'd') && !goingLeft) {
    dx = gridSize;
    dy = 0;
  }
  if ((keyPressed === 'arrowdown' || keyPressed === 's') && !goingUp) {
    dx = 0;
    dy = gridSize;
  }
}

// Random Food Generator (Normal & Golden Apples)
function generateFood() {
  let foodOnSnake = true;
  while (foodOnSnake) {
    food.x = Math.floor(Math.random() * tileCount) * gridSize;
    food.y = Math.floor(Math.random() * tileCount) * gridSize;
    
    // Ensure food doesn't spawn inside snake body
    foodOnSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
  
  // 20% Chance to spawn a Golden Bonus Food
  if (Math.random() < 0.2) {
    food.type = 'golden';
    if (goldenFoodTimer) clearTimeout(goldenFoodTimer);
    
    // Golden Apple disappears after 6 seconds
    goldenFoodTimer = setTimeout(() => {
      if (food.type === 'golden') {
        generateFood();
      }
    }, 6000);
  } else {
    food.type = 'normal';
  }
}

// Collision Logic (Walls and Self)
function checkCollision() {
  const head = snake[0];
  
  // Wall collision
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }
  
  // Self collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  
  return false;
}

// Render Elements on Canvas
function drawCanvas() {
  // Clear Canvas (Dark Cyber Background)
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw Grid Lines (Subtle Cyber Grid)
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.03)';
  for (let i = 0; i < canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Draw Food
  if (food.type === 'golden') {
    ctx.fillStyle = '#ffbd00';
    ctx.shadowColor = '#ffbd00';
    ctx.shadowBlur = 15;
  } else {
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 10;
  }
  
  ctx.beginPath();
  ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // Reset Shadow Glow

  // Draw Snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Snake Head (Glowing Cyan)
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
    } else {
      // Snake Body (Neon Green Gradient)
      ctx.fillStyle = '#00ff66';
      ctx.shadowBlur = 0;
    }
    
    ctx.fillRect(segment.x + 1, segment.y + 1, gridSize - 2, gridSize - 2);
  });
  
  ctx.shadowBlur = 0; // Reset
}

// Game Over Handler
function handleGameOver() {
  isPlaying = false;
  clearInterval(gameInterval);
  if (goldenFoodTimer) clearTimeout(goldenFoodTimer);
  
  finalScoreEl.innerText = score;
  gameOverOverlay.classList.remove('hidden');
}