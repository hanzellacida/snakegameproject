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
    leaderboardElement.innerHTML = "Leaderboard:<br>";
    highScores.sort((a, b) => b.score - a.score);
    highScores.forEach((entry, index) => {
        leaderboardElement.innerHTML += (index + 1) + ". " + entry.name + ": " + entry.score + "<br>";
    });
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function gameOver() {
    clearInterval(interval);
    alert("Game Over! Your score: " + score);
    highScores.push({ name: playerNameInput.value, score: score });
    updateLeaderboard();
    playerNameInput.value = ""; // Clear the name input for the next game
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('keydown', (evt) => {
    const direction = evt.key.replace('Arrow', '');
    snake.changeDirection(direction);
    
// After defining the Snake and Fruit functions

function handleDirectionChange(direction) {
    if (direction) {
        snake.changeDirection(direction);
    }
}

// Adding control event listeners after the game objects have been defined
document.getElementById('upButton').addEventListener('click', () => handleDirectionChange('Up'));
document.getElementById('leftButton').addEventListener('click', () => handleDirectionChange('Left'));
document.getElementById('downButton').addEventListener('click', () => handleDirectionChange('Down'));
document.getElementById('rightButton').addEventListener('click', () => handleDirectionChange('Right'));

// Adding touch event listeners for touch devices
document.getElementById('upButton').addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents scrolling on touch devices
    handleDirectionChange('Up');
});
document.getElementById('leftButton').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDirectionChange('Left');
});
document.getElementById('downButton').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDirectionChange('Down');
});
document.getElementById('rightButton').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDirectionChange('Right');
});

// Existing game initialization and control code continues here

});
