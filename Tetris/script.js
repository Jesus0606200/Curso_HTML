const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const grid = 30;
const cols = canvas.width / grid;
const rows = canvas.height / grid;

const tetrominoes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

const colors = ['#00FFFF', '#FFFF00', '#800080', '#00FF00', '#FF0000', '#0000FF', '#FFA500'];

let board, tetromino, x, y, color, score, gameInterval, gameOverFlag;

function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * grid, y * grid, grid, grid);
    context.strokeStyle = '#333';
    context.strokeRect(x * grid, y * grid, grid, grid);
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col]) {
                drawSquare(col, row, colors[board[row][col] - 1]);
            }
        }
    }
    context.strokeStyle = '#444';
    for (let i = 0; i < rows; i++) {
        context.beginPath();
        context.moveTo(0, i * grid);
        context.lineTo(canvas.width, i * grid);
        context.stroke();
    }
    for (let i = 0; i < cols; i++) {
        context.beginPath();
        context.moveTo(i * grid, 0);
        context.lineTo(i * grid, canvas.height);
        context.stroke();
    }
}

function drawTetromino() {
    tetromino.forEach((row, yOffset) => {
        row.forEach((value, xOffset) => {
            if (value) {
                drawSquare(x + xOffset, y + yOffset, color);
            }
        });
    });
}

function collide() {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col] && 
                (board[y + row] && board[y + row][x + col]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge() {
    tetromino.forEach((row, yOffset) => {
        row.forEach((value, xOffset) => {
            if (value) {
                board[y + yOffset][x + xOffset] = colors.indexOf(color) + 1;
            }
        });
    });
}

function rotate() {
    const temp = tetromino;
    tetromino = tetromino[0].map((_, i) => tetromino.map(row => row[i])).reverse();
    if (collide()) {
        tetromino = temp;
    }
}

function move(dir) {
    x += dir;
    if (collide()) {
        x -= dir;
    }
}

function drop() {
    y++;
    if (collide()) {
        y--;
        merge();
        clearLines();
        if (y === 0) {
            gameOver();
        } else {
            updateScore();
            reset();
        }
    }
}

function clearLines() {
    for (let row = rows - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(cols).fill(0));
            score += 100;
        }
    }
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

function reset() {
    tetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    x = Math.floor((cols - tetromino[0].length) / 2);
    y = 0;
    color = colors[Math.floor(Math.random() * colors.length)];
    if (collide()) {
        gameOver();
    }
}

function startGame() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('start-btn').style.display = 'none';
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score = 0;
    updateScore();
    gameOverFlag = false;
    reset();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 500);
}

function gameOver() {
    clearInterval(gameInterval);
    gameOverFlag = true;
    document.getElementById('game-over').style.display = 'block';
}

function restartGame() {
    startGame();
}

function gameLoop() {
    if (!gameOverFlag) {
        drawBoard();
        drawTetromino();
        drop();
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'ArrowDown') drop();
    if (event.key === 'ArrowUp') rotate();
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', restartGame);
