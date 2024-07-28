// Инициализация Telegram Mini App
const tg = window.Telegram.WebApp;
tg.expand();

// Получаем элементы DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

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

// Загружаем изображение для экрана Game Over
const gameOverImage = new Image();
gameOverImage.src = 'images/gas-kvas-com-p-oboi-s-nadpisyu-konets-igri-36.jpg';

// Флаг для отслеживания загрузки изображения
let gameOverImageLoaded = false;
gameOverImage.onload = function() {
    gameOverImageLoaded = true;
};

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
}

// Добавляем слушатель событий на кнопку "Начать игру"
startButton.addEventListener('click', startGame);

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
function drawText(text, x, y, fontSize, color = 'white', align = 'center') {
    ctx.font = `${fontSize} Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

// Функция для обновления состояния игры
function update() {
    if (gameOver) return;

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
        drawText(`Очки: ${score}`, 10, 30, '20px', 'white', 'left');
        drawText(`Жизни: ${lives}`, 10, 60, '20px', 'white', 'left');
    } else {
        // Отрисовываем экран Game Over
        if (gameOverImageLoaded) {
            ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Полупрозрачный слой поверх изображения
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Адаптивный размер шрифта
        let largeFontSize = Math.max(24, Math.floor(canvas.width / 20)) + 'px';
        let mediumFontSize = Math.max(18, Math.floor(canvas.width / 30)) + 'px';
        let smallFontSize = Math.max(14, Math.floor(canvas.width / 40)) + 'px';

        drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - canvas.height / 8, largeFontSize);
        drawText(`Очки: ${score}`, canvas.width / 2, canvas.height / 2, mediumFontSize);
        
        // Иконки и краткие инструкции
        drawText('🔄 Рестарт', canvas.width / 2, canvas.height / 2 + canvas.height / 8, smallFontSize);
        drawText('📤 Отправить счет', canvas.width / 2, canvas.height / 2 + canvas.height / 6, smallFontSize);
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

// Обработчик нажатия клавиш
document.addEventListener('keydown', (event) => {
    if (gameStarted && !gameOver) {
        if (event.key === 'ArrowLeft' && ship.x > 0) {
            ship.x -= shipSpeed;
        } else if (event.key === 'ArrowRight' && ship.x < canvas.width - ship.width) {
            ship.x += shipSpeed;
        } else if (event.key === ' ') {
            bullets.push({
                x: ship.x + ship.width / 2 - bulletWidth / 2,
                y: ship.y,
                width: bulletWidth,
                height: bulletHeight
            });
        }
    } else if (gameOver && (event.key === ' ' || event.key === 'r' || event.key === 'R')) {
        console.log('Попытка перезапуска игры (клавиатура)');
        initGame();
        if (!gameLoopRunning) {
            gameLoopRunning = true;
            gameLoop();
        }
        console.log('Игра перезапущена (клавиатура)');
    } else if (gameOver && (event.key.toLowerCase() === 't' || event.key === 'Enter')) {
        sendScoreToTelegram();
    }
});

// Обработчик касаний для мобильных устройств
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
        bullets.push({
            x: ship.x + ship.width / 2 - bulletWidth / 2,
            y: ship.y,
            width: bulletWidth,
            height: bulletHeight
        });
    } else if (gameOver) {
        const touch = event.touches[0];
        const touchY = touch.clientY;
        
        if (touchY > canvas.height / 2) {
            if (touchY < canvas.height / 2 + canvas.height / 7) {
                console.log('Попытка перезапуска игры (касание)');
                initGame();
                if (!gameLoopRunning) {
                    gameLoopRunning = true;
                    gameLoop();
                }
                console.log('Игра перезапущена (касание)');
            } else {
                sendScoreToTelegram();
            }
        }
    }
}, {passive: false});

// Обработчик изменения размера окна
window.addEventListener('resize', resizeCanvas);

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    resizeCanvas();
    // Начальный экран уже отображается благодаря HTML структуре
});