// Game State Variables
let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let aiDifficulty = 'hard';

let scores = {
    X: 0,
    O: 0,
    Ties: 0
};

// Winning Combinations (Indexes)
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreTies = document.getElementById('scoreTies');
const scoreBoxX = document.getElementById('scoreBoxX');
const scoreBoxO = document.getElementById('scoreBoxO');

const pvpBtn = document.getElementById('pvpBtn');
const aiBtn = document.getElementById('aiBtn');
const difficultyContainer = document.getElementById('difficultyContainer');
const difficultySelect = document.getElementById('difficulty');

const restartBtn = document.getElementById('restartBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');

const winModal = document.getElementById('winModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');

const soundClick = document.getElementById('soundClick');
const soundWin = document.getElementById('soundWin');
const soundDraw = document.getElementById('soundDraw');

// Play Sound Helper
function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }
}

// Initialize Game Events
function initGame() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', restartRound);
    resetScoresBtn.addEventListener('click', resetAll);
    modalPlayAgainBtn.addEventListener('click', () => {
        winModal.classList.add('hidden');
        restartRound();
    });

    pvpBtn.addEventListener('click', () => setGameMode('pvp'));
    aiBtn.addEventListener('click', () => setGameMode('ai'));
    difficultySelect.addEventListener('change', (e) => {
        aiDifficulty = e.target.value;
        restartRound();
    });
}

// Set Game Mode (PvP or VS AI)
function setGameMode(mode) {
    gameMode = mode;
    if (mode === 'pvp') {
        pvpBtn.classList.add('active');
        aiBtn.classList.remove('active');
        difficultyContainer.classList.add('hidden');
        document.getElementById('labelO').innerText = 'Player O';
    } else {
        aiBtn.classList.add('active');
        pvpBtn.classList.remove('active');
        difficultyContainer.classList.remove('hidden');
        document.getElementById('labelO').innerText = 'AI (O)';
    }
    resetAll();
}

// Handle Cell Click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedIndex] !== '' || !gameActive) return;

    makeMove(clickedIndex, currentPlayer);

    if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 400); // Small delay for realistic AI feel
    }
}

// Make a Move
function makeMove(index, player) {
    boardState[index] = player;
    const cell = cells[index];
    cell.innerText = player;
    cell.classList.add(player.toLowerCase());
    playSound(soundClick);

    checkResult();
}

// Check for Win or Draw
function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        playSound(soundWin);
        scores[currentPlayer]++;
        updateScoreboard();
        showModal(`Player ${currentPlayer} Wins! 🎉`, currentPlayer === 'O' && gameMode === 'ai' ? 'AI Defeated You!' : `Player ${currentPlayer} dominated this round.`);
        gameActive = false;
        return;
    }

    if (!boardState.includes('')) {
        playSound(soundDraw);
        scores.Ties++;
        updateScoreboard();
        showModal("It's a Tie! 🤝", "Great match! Neither side gave up.");
        gameActive = false;
        return;
    }

    // Switch Player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
}

// Update Turn Indicator UI
function updateTurnIndicator() {
    statusMessage.innerText = gameMode === 'ai' && currentPlayer === 'O' ? "AI is thinking..." : `Player ${currentPlayer}'s Turn`;
    if (currentPlayer === 'X') {
        scoreBoxX.classList.add('active');
        scoreBoxO.classList.remove('active');
    } else {
        scoreBoxO.classList.add('active');
        scoreBoxX.classList.remove('active');
    }
}

// AI Logic (Easy, Medium, Hard Unbeatable Minimax)
function makeAIMove() {
    if (!gameActive) return;

    let availableIndices = boardState
        .map((val, idx) => val === '' ? idx : null)
        .filter(val => val !== null);

    let chosenIndex;

    if (aiDifficulty === 'easy') {
        chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else if (aiDifficulty === 'medium') {
        // 50% Minimax, 50% Random
        if (Math.random() > 0.5) {
            chosenIndex = getBestMove().index;
        } else {
            chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }
    } else {
        // Unbeatable Minimax Algorithm
        chosenIndex = getBestMove().index;
    }

    if (chosenIndex !== undefined) {
        makeMove(chosenIndex, 'O');
    }
}

// Minimax Algorithm Implementation
function minimax(newBoard, player) {
    const availSpots = newBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

    if (checkWinState(newBoard, 'X')) return { score: -10 };
    if (checkWinState(newBoard, 'O')) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function getBestMove() {
    return minimax([...boardState], 'O');
}

function checkWinState(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

// Scoreboard Update
function updateScoreboard() {
    scoreX.innerText = scores.X;
    scoreO.innerText = scores.O;
    scoreTies.innerText = scores.Ties;
}

// Show Winner/Tie Modal
function showModal(title, msg) {
    modalTitle.innerText = title;
    modalMessage.innerText = msg;
    winModal.classList.remove('hidden');
}

// Restart Current Round
function restartRound() {
    boardState = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o');
    });
    updateTurnIndicator();
}

// Reset Game & Scores Completely
function resetAll() {
    scores = { X: 0, O: 0, Ties: 0 };
    updateScoreboard();
    restartRound();
}

// Initialize on Load
initGame();