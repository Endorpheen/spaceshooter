// Инициализация Telegram Mini App
const tg = window.Telegram.WebApp;
tg.expand();

// Получаем элементы DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Аудио элементы
const introMusic = document.getElementById('introMusic');
const gameOverMusic = document.getElementById('gameOverMusic');
const shotSound = document.getElementById('shotSound');
let isMusicPlaying = false;

// Глобальные переменные для масштабирования
let scaleX, scaleY;

// Игровые константы
let shipWidth, shipHeight, bulletWidth, bulletHeight, enemyWidth, enemyHeight;
let shipSpeed, bulletSpeed, enemySpeed;

// Создаем корабль игрока
let ship;

// Массивы для пуль и врагов
let bullets = [];
let enemies = [];

// Игровые переменные
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let gameLoopRunning = false;

// Функция для воспроизведения вступительной музыки
function playIntroMusic() {
    if (!isMusicPlaying) {
        introMusic.play().then(() => {
            isMusicPlaying = true;
        }).catch(error => {
            console.error("Ошибка воспроизведения музыки:", error);
        });
    }
}

// Функция для остановки вступительной музыки
function stopIntroMusic() {
    introMusic.pause();
    introMusic.currentTime = 0;
    isMusicPlaying = false;
}

// Функция для воспроизведения музыки Game Over
function playGameOverMusic() {
    gameOverMusic.play().catch(error => {
        console.error("Ошибка воспроизведения музыки Game Over:", error);
    });
}

// Функция для воспроизведения звука выстрела
function playShotSound() {
    shotSound.currentTime = 0;
    shotSound.play().catch(error => {
        console.error("Ошибка воспроизведения звука выстрела:", error);
    });
}

// Функция для начала игры
function startGame() {
    gameStarted = true;
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    resizeCanvas();
    initGame();
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoop();
    }
    playIntroMusic();
}

// Функция инициализации игры
function initGame() {
    ship = {
        x: canvas.width / 2 - shipWidth / 2,
        y: canvas.height - shipHeight - 10,
        width: shipWidth,
        height: shipHeight,
        color: 'white'
    };
    bullets = [];
    enemies = [];
    score = 0;
    lives = 3;
    gameOver = false;
    gameStarted = true;

    // Создаем начальных врагов
    for (let i = 0; i < 5; i++) {
        enemies.push(createEnemy());
    }
}

// Функция изменения размеров canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scaleX = canvas.width / 800;
    scaleY = canvas.height / 600;
    
    shipWidth = Math.floor(50 * scaleX);
    shipHeight = Math.floor(50 * scaleY);
    bulletWidth = Math.floor(5 * scaleX);
    bulletHeight = Math.floor(15 * scaleY);
    enemyWidth = Math.floor(40 * scaleX);
    enemyHeight = Math.floor(40 * scaleY);
    
    shipSpeed = Math.floor(5 * scaleX);
    bulletSpeed = Math.floor(7 * scaleY);
    enemySpeed = Math.floor(2 * scaleY);

    if (ship) {
        ship.width = shipWidth;
        ship.height = shipHeight;
        ship.x = canvas.width / 2 - ship.width / 2;
        ship.y = canvas.height - ship.height - 10;
    }

    // Обновляем позиции врагов
    enemies.forEach(enemy => {
        enemy.width = enemyWidth;
        enemy.height = enemyHeight;
        enemy.x = enemy.x * scaleX;
        enemy.y = enemy.y * scaleY;
    });

    // Обновляем позиции пуль
    bullets.forEach(bullet => {
        bullet.width = bulletWidth;
        bullet.height = bulletHeight;
        bullet.x = bullet.x * scaleX;
        bullet.y = bullet.y * scaleY;
    });
}

// Функция для создания врагов
function createEnemy() {
    return {
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        color: 'red'
    };
}

// Функция для отрисовки прямоугольника
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Функция для отрисовки текста
function drawText(text, x, y, fontSize = '20px', color = 'white', align = 'left', maxWidth = canvas.width) {
    ctx.font = `${fontSize} Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    
    let words = text.split(' ');
    let line = '';
    let lineHeight = parseInt(fontSize) * 1.2;
    
    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// Функция для получения адаптивного размера шрифта
function getFontSize() {
    return Math.max(12, Math.floor(canvas.width / 30)) + 'px';
}

// Функция для обновления состояния игры
function update() {
    if (gameOver) {
        if (isMusicPlaying) {
            stopIntroMusic();
            playGameOverMusic();
        }
        return;
    }

    // Обновляем положение пуль
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });

    // Обновляем положение врагов и проверяем столкновения
    enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemySpeed;

        // Проверяем столкновение с кораблем игрока
        if (
            ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.y + ship.height > enemy.y
        ) {
            enemies.splice(enemyIndex, 1);
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
        }

        // Проверяем столкновение с пулями
        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score++;
            }
        });

        // Если враг вышел за пределы экрана, перемещаем его наверх
        if (enemy.y > canvas.height) {
            enemy.y = -enemyHeight;
            enemy.x = Math.random() * (canvas.width - enemyWidth);
        }
    });

    // Добавляем новых врагов, если их меньше 5
    while (enemies.length < 5) {
        enemies.push(createEnemy());
    }
}

// Функция для отрисовки игры
function draw() {
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        // Отрисовываем корабль игрока
        drawRect(ship.x, ship.y, ship.width, ship.height, ship.color);

        // Отрисовываем пули
        bullets.forEach(bullet => {
            drawRect(bullet.x, bullet.y, bullet.width, bullet.height, 'yellow');
        });

        // Отрисовываем врагов
        enemies.forEach(enemy => {
            drawRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
        });

        // Отрисовываем счет и жизни
        drawText(`Очки: ${score}`, 10, 30);
        drawText(`Жизни: ${lives}`, 10, 60);
    } else {
        // Отрисовываем экран Game Over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60, '48px', 'white', 'center');
        drawText(`Очки: ${score}`, canvas.width / 2, canvas.height / 2, '24px', 'white', 'center');
        drawText('Нажмите пробел для перезапуска', canvas.width / 2, canvas.height / 2 + 40, getFontSize(), 'white', 'center', canvas.width * 0.8);
        drawText('Нажмите T, чтобы отправить счет в Telegram', canvas.width / 2, canvas.height / 2 + 80, getFontSize(), 'white', 'center', canvas.width * 0.8);
    }
}

// Функция для отправки счета в Telegram
function sendScoreToTelegram() {
    tg.sendData(JSON.stringify({score: score}));
}

// Игровой цикл
function gameLoop() {
    if (gameStarted && !gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        gameLoopRunning = false;
    }
}

// Функция выстрела
function shoot() {
    bullets.push({
        x: ship.x + ship.width / 2 - bulletWidth / 2,
        y: ship.y,
        width: bulletWidth,
        height: bulletHeight
    });
    playShotSound();
}

// Обработчик нажатия клавиш
document.addEventListener('keydown', (event) => {
    if (gameStarted && !gameOver) {
        if (event.key === 'ArrowLeft' && ship.x > 0) {
            ship.x -= shipSpeed;
        } else if (event.key === 'ArrowRight' && ship.x < canvas.width - ship.width) {
            ship.x += shipSpeed;
        } else if (event.key === ' ') {
            shoot();
        }
    } else if (gameOver && event.key === ' ') {
        startGame();
    } else if (gameOver && event.key.toLowerCase() === 't') {
        sendScoreToTelegram();
    }
});

// Добавляем обработчик касаний для мобильных устройств
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (gameStarted && !gameOver) {
        const touch = event.touches[0];
        const touchX = touch.clientX;
        
        if (touchX < canvas.width / 2) {
            // Движение влево
            ship.x = Math.max(0, ship.x - shipSpeed);
        } else {
            // Движение вправо
            ship.x = Math.min(canvas.width - ship.width, ship.x + shipSpeed);
        }
        
        // Стрельба при каждом касании
        shoot();
    } else if (gameOver) {
        startGame();
    }
}, {passive: false});

// Обработчик изменения размера окна
window.addEventListener('resize', resizeCanvas);

// Добавляем слушатель событий на кнопку "Начать игру"
startButton.addEventListener('click', startGame);

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    resizeCanvas();
    // Начальный экран уже отображается благодаря HTML структуре
});

// Добавляем обработчик для воспроизведения музыки при первом взаимодействии с страницей
window.addEventListener('click', playIntroMusic, { once: true });