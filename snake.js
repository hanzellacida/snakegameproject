const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const leaderboardElement = document.getElementById('leaderboard');
const playerNameInput = document.getElementById('playerName');
const snakeIcon = document.getElementById('snakeIcon');
const snakeBodyIcon = document.getElementById('snakeBodyIcon');
const snakeTailIcon = document.getElementById('snakeTailIcon');
const fruitIcon = document.getElementById('fruitIcon');
let interval;
let speed = 250; // Initial speed

const scale = 20; // Size of the snake parts
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let fruit;
let score;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = scale;
    this.ySpeed = 0;
    this.total = 0;
    this.tail = [];

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x + scale / 2, this.y + scale / 2);
        ctx.rotate(Math.atan2(this.ySpeed, this.xSpeed));
        ctx.drawImage(snakeIcon, -scale / 2, -scale / 2, scale, scale);
        ctx.restore();
        
        for (let i = 0; i < this.tail.length; i++) {
            ctx.drawImage((i === this.tail.length - 1) ? snakeTailIcon : snakeBodyIcon, this.tail[i].x, this.tail[i].y, scale, scale);
        }
    };

    this.update = function() {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }
        if (this.total >= 1) {
            this.tail[this.total - 1] = { x: this.x, y: this.y };
        }
        
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.x >= canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width - scale;
        if (this.y >= canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height - scale;
    };

    this.changeDirection = function(direction) {
        const mapping = { 'Up': [0, -scale], 'Down': [0, scale], 'Left': [-scale, 0], 'Right': [scale, 0] };
        if ((this.xSpeed !== -mapping[direction][0]) && (this.ySpeed !== -mapping[direction][1])) {
            this.xSpeed = mapping[direction][0];
            this.ySpeed = mapping[direction][1];
        }
    };

    this.checkCollision = function() {
        for (let i = 0; i < this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                return true;
            }
        }
        return false;
    };

    this.eat = function(fruit) {
        if (this.x === fruit.x && this.y === fruit.y) {
            this.total++;
            return true;
        }
        return false;
    };
}

function Fruit() {
    this.pickLocation = function() {
        this.x = (Math.floor(Math.random() * columns) * scale);
        this.y = (Math.floor(Math.random() * rows) * scale);
    };

    this.draw = function() {
        ctx.drawImage(fruitIcon, this.x, this.y, scale, scale);
    }
}

function startGame() {
    if (playerNameInput.value === "") {
        alert("Please enter your name to start playing!");
        return;
    }
    resetGame();
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();
    score = 0;
    updateScore();
    interval = setInterval(gameLoop, speed);

    // Set up D-pad controls
    document.getElementById('upBtn').addEventListener('click', () => snake.changeDirection('Up'));
    document.getElementById('downBtn').addEventListener('click', () => snake.changeDirection('Down'));
    document.getElementById('leftBtn').addEventListener('click', () => snake.changeDirection('Left'));
    document.getElementById('rightBtn').addEventListener('click', () => snake.changeDirection('Right'));
}

function resetGame() {
    if (interval) clearInterval(interval);
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();
    score = 0;
    speed = 250;
    updateScore();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fruit.draw();
    snake.update();
    snake.draw();

    if (snake.eat(fruit)) {
        fruit.pickLocation();
        score++;
        updateScore();
        if (score % 5 === 0) {
            speedUp();
        }
    }

    if (snake.checkCollision()) {
        gameOver();
    }
}

function speedUp() {
    clearInterval(interval);
    speed *= 0.9;
    interval = setInterval(gameLoop, speed);
}

function updateScore() {
    scoreElement.innerHTML = 'Score: ' + score;
}

function updateLeaderboard() {
    const tableBody = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";  // Clear the current contents

    highScores.sort((a, b) => b.score - a.score); // Sort scores in descending order
    highScores.forEach((entry, index) => {
        const row = tableBody.insertRow();
        const rankCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const scoreCell = row.insertCell(2);

        rankCell.innerHTML = index + 1;
        nameCell.innerHTML = entry.name;
        scoreCell.innerHTML = entry.score;

        // Highlight the top scorer
        if (index === 0) {
            row.style.backgroundColor = "#FFD700"; // Gold color for the top scorer
            row.style.color = "#000"; // Text color for visibility
        }
    });
    localStorage.setItem('highScores', JSON.stringify(highScores)); // Save the updated high scores
}


function gameOver() {
    clearInterval(interval);
    alert("Game Over! Your score: " + score);
    highScores.push({ name: playerNameInput.value, score: score });
    updateLeaderboard();
    playerNameInput.value = ""; // Clear the name input for the next game
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove event listeners for the D-pad
    document.getElementById('upBtn').removeEventListener('click', () => snake.changeDirection('Up'));
    document.getElementById('downBtn').removeEventListener('click', () => snake.changeDirection('Down'));
    document.getElementById('leftBtn').removeEventListener('click', () => snake.changeDirection('Left'));
    document.getElementById('rightBtn').removeEventListener('click', () => snake.changeDirection('Right'));
}

window.addEventListener('keydown', (evt) => {
    const direction = evt.key.replace('Arrow', '');
    snake.changeDirection(direction);
});
