const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const mainMenu = document.getElementById("main-menu");
const settingsMenu = document.getElementById("settings-menu");
const gameOverMenu = document.getElementById("game-over-menu");

const btnPlay = document.getElementById("btn-play");
const btnSettings = document.getElementById("btn-settings");
const btnEasy = document.getElementById("btn-easy");
const btnMedium = document.getElementById("btn-medium");
const btnHard = document.getElementById("btn-hard");
const btnSettingsBack = document.getElementById("btn-settings-back");
const btnReplay = document.getElementById("btn-replay");
const btnGameOverHome = document.getElementById("btn-gameover-home");

// Audio Elements & Sound Settings
const bgMusic = document.getElementById("bgMusic");
const btnSound = document.getElementById("btn-sound");
let isMuted = false;

// Sound Toggle Button Listener
btnSound.addEventListener("click", () => {
    isMuted = !isMuted;
    if (isMuted) {
        bgMusic.pause();
        btnSound.innerText = "SOUND: OFF";
    } else {
        if (gameState === "PLAYING") bgMusic.play();
        btnSound.innerText = "SOUND: ON";
    }
});

let animationFrameId;
let gameState = "MENU";
let score = 0;
let highScore = localStorage.getItem("flappy_high_score") || 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let config = {
    gravity: 0.35,
    jump: -7.5,
    pipeSpeed: 3,
    pipeGap: 180,
    pipeSpawnTime: 110
};

function setDifficulty(level) {
    document.querySelectorAll(".btn-level").forEach(btn => btn.classList.remove("active"));
    if (level === 'easy') {
        config = { gravity: 0.28, jump: -7, pipeSpeed: 2.2, pipeGap: 210, pipeSpawnTime: 130 };
        btnEasy.classList.add("active");
    } else if (level === 'medium') {
        config = { gravity: 0.35, jump: -7.5, pipeSpeed: 3, pipeGap: 180, pipeSpawnTime: 110 };
        btnMedium.classList.add("active");
    } else if (level === 'hard') {
        config = { gravity: 0.42, jump: -8.5, pipeSpeed: 4, pipeGap: 150, pipeSpawnTime: 85 };
        btnHard.classList.add("active");
    }
}

// Background Parallax Objects
let bgOffset = 0;
let cloudOffset = 0;

function drawBackground() {
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#4facfe");
    skyGradient.addColorStop(1, "#00f2fe");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    cloudOffset -= 0.5;
    if (cloudOffset <= -canvas.width) cloudOffset = 0;
    
    for (let i = 0; i < 2; i++) {
        let x = cloudOffset + i * canvas.width;
        ctx.beginPath();
        ctx.arc(x + 100, 100, 40, 0, Math.PI * 2);
        ctx.arc(x + 150, 90, 50, 0, Math.PI * 2);
        ctx.arc(x + 200, 100, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + 500, 180, 30, 0, Math.PI * 2);
        ctx.arc(x + 540, 170, 40, 0, Math.PI * 2);
        ctx.arc(x + 580, 180, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#81d4fa";
    for (let i = 0; i < canvas.width + 100; i += 80) {
        ctx.fillRect(i, canvas.height - 180, 60, 140);
    }
}

// Bird Object
const bird = {
    x: 100,
    y: canvas.height / 2,
    radius: 18,
    velocity: 0,
    rotation: 0,
    wingAngle: 0,
    wingSpeed: 0.2,

    draw: function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(0, 22, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        let birdGradient = ctx.createRadialGradient(-4, -4, 2, 0, 0, this.radius);
        birdGradient.addColorStop(0, "#FFF176");
        birdGradient.addColorStop(1, "#FBC02D");

        ctx.fillStyle = birdGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#D72638";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(8, -6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(10, -6, 3, 0, Math.PI * 2);
        ctx.fill();

        this.wingAngle += this.wingSpeed;
        let wingY = Math.sin(this.wingAngle) * 6;

        ctx.fillStyle = "#E65100";
        ctx.beginPath();
        ctx.ellipse(-6, wingY, 8, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FF5722";
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(22, 4);
        ctx.lineTo(12, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    },
    update: function() {
        this.velocity += config.gravity;
        this.y += this.velocity;

        if (this.velocity < 0) {
            this.rotation = -25 * Math.PI / 180;
        } else {
            this.rotation += 3 * Math.PI / 180;
            if (this.rotation > 70 * Math.PI / 180) {
                this.rotation = 70 * Math.PI / 180;
            }
        }

        if (this.y + this.radius >= canvas.height - 40) {
            this.y = canvas.height - 40 - this.radius;
            endGame();
        }
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocity = 0;
        }
    },
    jump: function() {
        this.velocity = config.jump;
    },
    reset: function() {
        this.y = canvas.height / 2;
        this.velocity = 0;
        this.rotation = 0;
    }
};

let pipes = [];
let frameCount = 0;

function createPipe() {
    const minHeight = 60;
    const maxHeight = canvas.height - 40 - config.pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - 40 - (topHeight + config.pipeGap),
        passed: false
    });
}

function updatePipes() {
    if (frameCount % config.pipeSpawnTime === 0) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= config.pipeSpeed;

        if (
            bird.x + bird.radius > pipes[i].x &&
            bird.x - bird.radius < pipes[i].x + 65 &&
            (bird.y - bird.radius < pipes[i].top || bird.y + bird.radius > canvas.height - 40 - pipes[i].bottom)
        ) {
            endGame();
        }

        if (!pipes[i].passed && pipes[i].x + 65 < bird.x) {
            pipes[i].passed = true;
            score++;
        }

        if (pipes[i].x + 65 < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        let pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + 65, 0);
        pipeGrad.addColorStop(0, "#1b5e20");
        pipeGrad.addColorStop(0.3, "#4caf50");
        pipeGrad.addColorStop(0.7, "#81c784");
        pipeGrad.addColorStop(1, "#1b5e20");

        ctx.fillStyle = pipeGrad;
        ctx.strokeStyle = "#0d3b11";
        ctx.lineWidth = 2.5;

        ctx.fillRect(pipe.x, 0, 65, pipe.top);
        ctx.strokeRect(pipe.x, 0, 65, pipe.top);
        ctx.fillRect(pipe.x - 4, pipe.top - 20, 73, 20);
        ctx.strokeRect(pipe.x - 4, pipe.top - 20, 73, 20);

        const bottomY = canvas.height - 40 - pipe.bottom;
        ctx.fillRect(pipe.x, bottomY, 65, pipe.bottom);
        ctx.strokeRect(pipe.x, bottomY, 65, pipe.bottom);
        ctx.fillRect(pipe.x - 4, bottomY, 73, 20);
        ctx.strokeRect(pipe.x - 4, bottomY, 73, 20);
    });
}

function drawEnvironment() {
    bgOffset -= config.pipeSpeed;
    if (bgOffset <= -20) bgOffset = 0;

    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.fillStyle = "#558b2f";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 12);

    ctx.fillStyle = "#33691e";
    for (let x = bgOffset; x < canvas.width + 20; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 28);
        ctx.lineTo(x + 10, canvas.height - 40);
        ctx.lineTo(x + 15, canvas.height - 28);
        ctx.fill();
    }

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, canvas.height - 40, canvas.width, 40);

    if (gameState === "PLAYING") {
        ctx.fillStyle = "#FFF";
        ctx.font = "900 50px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillText(score, canvas.width / 2, 70);
        ctx.shadowBlur = 0; 
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    if (gameState === "PLAYING") {
        frameCount++;
        bird.update();
        updatePipes();
    }

    drawPipes();
    bird.draw();
    drawEnvironment();

    if (gameState === "PLAYING") {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function handleInput(e) {
    if (gameState === "PLAYING") {
        if (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp")) {
            bird.jump();
        } else if (e.type === "touchstart" || e.type === "mousedown") {
            if (e.target.tagName !== "BUTTON") {
                bird.jump();
            }
        }
    }
}

window.addEventListener("keydown", handleInput);
window.addEventListener("touchstart", handleInput);
window.addEventListener("mousedown", handleInput);

function startGame() {
    score = 0;
    frameCount = 0;
    pipes = [];
    bird.reset();
    gameState = "PLAYING";

    mainMenu.classList.add("hidden");
    settingsMenu.classList.add("hidden");
    gameOverMenu.classList.add("hidden");

    // Play Background Music
    if (!isMuted) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("Audio autoplay blocked by browser"));
    }

    cancelAnimationFrame(animationFrameId);
    gameLoop();
}

function endGame() {
    gameState = "GAMEOVER";
    bgMusic.pause();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappy_high_score", highScore);
    }
    document.getElementById("final-score").innerText = score;
    document.getElementById("best-score").innerText = highScore;
    gameOverMenu.classList.remove("hidden");
}

function openSettings() {
    mainMenu.classList.add("hidden");
    settingsMenu.classList.remove("hidden");
}

function openHome() {
    gameState = "MENU";
    bgMusic.pause();
    
    settingsMenu.classList.add("hidden");
    gameOverMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    bird.reset();
    bird.draw();
    drawEnvironment();
}

btnPlay.addEventListener("click", startGame);
btnSettings.addEventListener("click", openSettings);
btnEasy.addEventListener("click", () => setDifficulty("easy"));
btnMedium.addEventListener("click", () => setDifficulty("medium"));
btnHard.addEventListener("click", () => setDifficulty("hard"));
btnSettingsBack.addEventListener("click", openHome);
btnReplay.addEventListener("click", startGame);
btnGameOverHome.addEventListener("click", openHome);

openHome();