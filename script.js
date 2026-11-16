
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const score1Element = document.getElementById("score1");
const score2Element = document.getElementById("score2");
const statusElement = document.getElementById("gameStatus");
const overlay = document.getElementById("overlay");

const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayButton = document.getElementById("overlayButton");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");

const gameMode = document.getElementById("gameMode");
const difficulty = document.getElementById("difficulty");
const winningScore = document.getElementById("winningScore");

const modeTitle = document.getElementById("modeTitle");
const player2Name = document.getElementById("player2Name");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const paddle = {
    width: 12,
    height: 95,
    speed: 7
};

let player1 = {
    x: 25,
    y: HEIGHT / 2 - paddle.height / 2,
    score: 0
};

let player2 = {
    x: WIDTH - 37,
    y: HEIGHT / 2 - paddle.height / 2,
    score: 0
};

let ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 9,
    speedX: 5,
    speedY: 3
};

let running = false;
let gameOver = false;
let animationId = null;

let keys = {};

let lastTime = 0;

const difficultySettings = {
    easy: {
        speed: 3.5,
        reaction: 0.045
    },

    medium: {
        speed: 5,
        reaction: 0.075
    },

    hard: {
        speed: 7,
        reaction: 0.11
    }
};

// Desenha o campo
function drawField() {

    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Linha central
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();

    ctx.setLineDash([]);

    // Círculo central
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, 55, 0, Math.PI * 2);
    ctx.strokeStyle = "#1e3a50";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Desenha as raquetes
function drawPaddles() {

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f5d4";

    ctx.fillStyle = "#00f5d4";

    ctx.fillRect(
        player1.x,
        player1.y,
        paddle.width,
        paddle.height
    );

    ctx.shadowColor = "#a855f7";
    ctx.fillStyle = "#a855f7";

    ctx.fillRect(
        player2.x,
        player2.y,
        paddle.width,
        paddle.height
    );

    ctx.shadowBlur = 0;
}

// Desenha a bola
function drawBall() {

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ffffff";

    ctx.fill();

    ctx.shadowBlur = 0;
}

// Atualiza o placar
function updateScore() {

    score1Element.textContent = player1.score;
    score2Element.textContent = player2.score;
}

// Centraliza a bola
function resetBall(direction) {

    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;

    ball.speedX = 5 * direction;

    ball.speedY = (Math.random() * 5) - 2.5;
}

// Reseta a partida
function resetGame() {

    player1.score = 0;
    player2.score = 0;

    player1.y = HEIGHT / 2 - paddle.height / 2;
    player2.y = HEIGHT / 2 - paddle.height / 2;

    resetBall(Math.random() > 0.5 ? 1 : -1);

    gameOver = false;

    updateScore();
    draw();

    if (running) {
        statusElement.textContent = "EM PARTIDA";
    } else {
        statusElement.textContent = "AGUARDANDO";
    }
}

// Movimento do jogador
function movePlayers(delta) {

    const movement = paddle.speed * delta;

    if (keys["w"] || keys["W"]) {
        player1.y -= movement;
    }

    if (keys["s"] || keys["S"]) {
        player1.y += movement;
    }

    // Segundo jogador
    if (gameMode.value === "player") {

        if (keys["ArrowUp"]) {
            player2.y -= movement;
        }

        if (keys["ArrowDown"]) {
            player2.y += movement;
        }

    } else {

        moveComputer(delta);
    }

    // Limites da tela
    player1.y = Math.max(
        0,
        Math.min(HEIGHT - paddle.height, player1.y)
    );

    player2.y = Math.max(
        0,
        Math.min(HEIGHT - paddle.height, player2.y)
    );
}

// Inteligência artificial do computador
function moveComputer(delta) {

    const settings = difficultySettings[difficulty.value];

    const target = ball.y - paddle.height / 2;

    const difference = target - player2.y;

    const maxMovement = settings.speed * delta;

    player2.y += Math.max(
        -maxMovement,
        Math.min(maxMovement, difference * settings.reaction * delta)
    );

    player2.y = Math.max(
        0,
        Math.min(HEIGHT - paddle.height, player2.y)
    );
}

// Colisão da bola com as raquetes
function checkPaddleCollision() {

    // Raquete esquerda
    if (
        ball.speedX < 0 &&
        ball.x - ball.radius <= player1.x + paddle.width &&
        ball.x + ball.radius >= player1.x &&
        ball.y >= player1.y &&
        ball.y <= player1.y + paddle.height
    ) {

        ball.x = player1.x + paddle.width + ball.radius;

        const impact =
            (ball.y - (player1.y + paddle.height / 2)) /
            (paddle.height / 2);

        ball.speedX = Math.abs(ball.speedX) * 1.06;
        ball.speedY = impact * 5;
    }

    // Raquete direita
    if (
        ball.speedX > 0 &&
        ball.x + ball.radius >= player2.x &&
        ball.x - ball.radius <= player2.x + paddle.width &&
        ball.y >= player2.y &&
        ball.y <= player2.y + paddle.height
    ) {

        ball.x = player2.x - ball.radius;

        const impact =
            (ball.y - (player2.y + paddle.height / 2)) /
            (paddle.height / 2);

        ball.speedX = -Math.abs(ball.speedX) * 1.06;
        ball.speedY = impact * 5;
    }

    // Limita a velocidade
    ball.speedX = Math.max(-12, Math.min(12, ball.speedX));
    ball.speedY = Math.max(-9, Math.min(9, ball.speedY));
}

// Movimento da bola
function moveBall(delta) {

    ball.x += ball.speedX * delta;
    ball.y += ball.speedY * delta;

    // Colisão com teto e chão
    if (ball.y - ball.radius <= 0) {

        ball.y = ball.radius;
        ball.speedY = Math.abs(ball.speedY);

    }

    if (ball.y + ball.radius >= HEIGHT) {

        ball.y = HEIGHT - ball.radius;
        ball.speedY = -Math.abs(ball.speedY);

    }

    checkPaddleCollision();

    // Ponto do jogador 2
    if (ball.x < 0) {

        player2.score++;

        updateScore();

        checkWinner();

        if (!gameOver) {
            resetBall(1);
        }

    }

    // Ponto do jogador 1
    if (ball.x > WIDTH) {

        player1.score++;

        updateScore();

        checkWinner();

        if (!gameOver) {
            resetBall(-1);
        }

    }
}

// Verifica o vencedor
function checkWinner() {

    const target = Number(winningScore.value);

    if (
        player1.score >= target ||
        player2.score >= target
    ) {

        gameOver = true;
        running = false;

        cancelAnimationFrame(animationId);

        statusElement.textContent = "PARTIDA FINALIZADA";

        const winner =
            player1.score > player2.score
                ? "JOGADOR 1"
                : gameMode.value === "computer"
                    ? "COMPUTADOR"
                    : "JOGADOR 2";

        overlayTitle.textContent = winner + " VENCEU!";

        overlayText.textContent =
            `Placar final: ${player1.score} x ${player2.score}`;

        overlayButton.textContent = "JOGAR NOVAMENTE";

        overlay.classList.remove("hidden");

    }
}

// Desenha todos os elementos
function draw() {

    drawField();
    drawPaddles();
    drawBall();

}

// Loop principal
function gameLoop(timestamp) {

    if (!running) return;

    const delta = lastTime
        ? Math.min((timestamp - lastTime) / 16.67, 2)
        : 1;

    lastTime = timestamp;

    movePlayers(delta);
    moveBall(delta);

    draw();

    if (running) {
        animationId = requestAnimationFrame(gameLoop);
    }

}

// Inicia o jogo
function startGame() {

    if (running || gameOver) return;

    running = true;

    lastTime = 0;

    overlay.classList.add("hidden");

    statusElement.textContent = "EM PARTIDA";

    animationId = requestAnimationFrame(gameLoop);

}

// Pausa o jogo
function pauseGame() {

    if (!running) return;

    running = false;

    cancelAnimationFrame(animationId);

    statusElement.textContent = "PAUSADO";

    overlayTitle.textContent = "JOGO PAUSADO";

    overlayText.textContent =
        "Sua partida está pausada. Continue quando quiser.";

    overlayButton.textContent = "CONTINUAR";

    overlay.classList.remove("hidden");

}

// Atualiza modo de jogo
function updateMode() {

    if (gameMode.value === "computer") {

        modeTitle.textContent = "Jogador vs Computador";
        player2Name.textContent = "COMPUTADOR";

    } else {

        modeTitle.textContent = "Dois jogadores";
        player2Name.textContent = "JOGADOR 2";

    }

    resetGame();

    if (!running && !gameOver) {
        overlay.classList.remove("hidden");
    }

}

// Controles do teclado
document.addEventListener("keydown", function(event) {

    keys[event.key] = true;

    if (
        ["ArrowUp", "ArrowDown", " "].includes(event.key)
    ) {
        event.preventDefault();
    }

    if (event.key === " " && !running && !gameOver) {
        startGame();
    }

});

document.addEventListener("keyup", function(event) {

    keys[event.key] = false;

});

// Botões
startButton.addEventListener("click", startGame);

pauseButton.addEventListener("click", pauseGame);

restartButton.addEventListener("click", function() {

    running = false;

    cancelAnimationFrame(animationId);

    resetGame();

    overlayTitle.textContent = "PRONTO PARA JOGAR?";

    overlayText.textContent =
        "Clique no botão abaixo para começar.";

    overlayButton.textContent = "INICIAR PARTIDA";

    overlay.classList.remove("hidden");

});

overlayButton.addEventListener("click", function() {

    if (running) return;

    if (gameOver) {
        resetGame();
    }

    startGame();

});

gameMode.addEventListener("change", function() {

    running = false;

    cancelAnimationFrame(animationId);

    updateMode();

    overlayTitle.textContent = "PRONTO PARA JOGAR?";
    overlayText.textContent = "Clique para iniciar uma nova partida.";
    overlayButton.textContent = "INICIAR PARTIDA";

});

difficulty.addEventListener("change", function() {

    if (!running) {
        return;
    }

});

winningScore.addEventListener("change", function() {

    if (player1.score >= Number(winningScore.value) ||
        player2.score >= Number(winningScore.value)) {

        resetGame();

    }

});

// Inicialização
updateMode();

resetBall(1);

draw();

updateScore();
