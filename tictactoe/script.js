let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick);
});

function handleClick(e) {
    const index = e.target.dataset.index;
    if (board[index] !== "" || !isGameActive) return;

    board[index] = currentPlayer;
    e.target.innerText = currentPlayer;

    if (checkWin()) {
        document.getElementById('status').innerText = `Player ${currentPlayer} Jeet Gaya! 🎉`;
        isGameActive = false;
        return;
    }

    if (!board.includes("")) {
        document.getElementById('status').innerText = "Game Draw Ho Gaya! 😐";
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    document.getElementById('status').innerText = `${currentPlayer} ki baari hai`;
}

function checkWin() {
    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === currentPlayer);
    });
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    document.getElementById('status').innerText = "X ki baari hai";
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = "");
}