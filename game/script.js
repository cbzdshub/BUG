// Canvas and context setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 7;

// Player paddle (left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 6
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: 4,
    dy: 4,
    speed: 4,
    maxSpeed: 8
};

// Game state
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Mouse position
let mouseY = canvas.height / 2;

// Event listeners
document.getElementById('startBtn').addEventListener('click', toggleGame);
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = false;
    }
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Toggle game
function toggleGame() {
    gameRunning = !gameRunning;
    document.getElementById('startBtn').textContent = gameRunning ? '暂停游戏' : '开始游戏';
    if (gameRunning) {
        gameLoop();
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game state
function update() {
    // Update player paddle
    if (keys.ArrowUp) {
        player.y = Math.max(0, player.y - player.maxSpeed);
    }
    if (keys.ArrowDown) {
        player.y = Math.min(canvas.height - player.height, player.y + player.maxSpeed);
    }
    
    // Also follow mouse Y position
    const mouseTarget = mouseY - player.height / 2;
    const diff = mouseTarget - player.y;
    if (Math.abs(diff) > 2) {
        player.y += diff * 0.15; // Smooth interpolation
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
    
    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    if (ballCenter < computerCenter - 35) {
        computer.y = Math.max(0, computer.y - computer.speed);
    } else if (ballCenter > computerCenter + 35) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    }
    
    // Update ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Ball collision with paddles
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 2;
        
        // Increase ball speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * Math.min(speed + 0.5, ball.maxSpeed);
            ball.dy = (ball.dy / speed) * Math.min(speed + 0.5, ball.maxSpeed);
        }
    }
    
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 2;
        
        // Increase ball speed
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * Math.min(speed + 0.5, ball.maxSpeed);
            ball.dy = (ball.dy / speed) * Math.min(speed + 0.5, ball.maxSpeed);
        }
    }
    
    // Ball out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = (Math.random() - 0.5) * 4;
}

// Update score display
function updateScore() {
    document.querySelector('.player-score').textContent = playerScore;
    document.querySelector('.computer-score').textContent = computerScore;
}

// Draw everything
function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 15]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw player paddle with glow
    drawPaddleWithGlow(player, '#00ff88');
    
    // Draw computer paddle with glow
    drawPaddleWithGlow(computer, '#ff00ff');
    
    // Draw ball with glow
    drawBallWithGlow();
}

// Draw paddle with glow effect
function drawPaddleWithGlow(paddle, color) {
    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Paddle
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.globalAlpha = 1;
}

// Draw ball with glow effect
function drawBallWithGlow() {
    // Glow
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.stroke();
}
