// Инициализация Telegram Mini App
const tg = window.Telegram.WebApp;
tg.expand();

// Добавьте эти переменные в начало файла
const backgroundLayers = [
    { image: new Image(), speed: 0.2, y: 0 },
    { image: new Image(), speed: 0.5, y: 0 },
    { image: new Image(), speed: 0.8, y: 0 }
];

// Загрузка изображений для слоев
backgroundLayers[0].image.src = 'images/background_stars.png';
backgroundLayers[1].image.src = 'images/background_nebula.png';
backgroundLayers[2].image.src = 'images/background_planets.png';

// Функция для обновления позиций слоев фона
function updateBackgroundLayers() {
    backgroundLayers.forEach(layer => {
        layer.y += layer.speed;
        if (layer.y >= canvas.height) {
            layer.y = 0;
        }
    });
}

// Загружаем изображение космического корабля
const shipImage = new Image();
shipImage.src = 'images/ship.png';

// Загружаем изображение фона
const backgroundImage = new Image();
backgroundImage.src = 'images/background.jpg';

// Загружаем изображение врага
const enemyImage = new Image();
enemyImage.src = 'images/enemy.png';

// Загружаем изображение для экрана Game Over
const gameOverImage = new Image();
gameOverImage.src = 'images/gas-kvas-com-p-oboi-s-nadpisyu-konets-igri-36.jpg';

// Флаги для отслеживания загрузки изображений
let backgroundImageLoaded = false;
let shipImageLoaded = false;
let enemyImageLoaded = false;
let gameOverImageLoaded = false;

backgroundImage.onload = function() {
    backgroundImageLoaded = true;
};

shipImage.onload = function() {
    shipImageLoaded = true;
};

enemyImage.onload = function() {
    enemyImageLoaded = true;
};

gameOverImage.onload = function() {
    gameOverImageLoaded = true;
};

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
let bossShots = [];

// Игровые переменные
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let gameLoopRunning = false;

// Переменные для усилений
let powerUps = [];
let powerUpChance = 0.005; // 0.5% шанс появления усиления на каждом кадре
let powerUpDuration = 5000; // 5 секунд
let isSpeedBoostActive = false;
let speedBoostFactor = 2; // Удвоение скорости при активации
let normalShipSpeed;

// Массив для хранения активных частиц
let particles = [];

// Обновим объект bossState
const bossState = {
    isBossFight: false,
    bossDefeated: false,
    boss: null,
    bossImage: new Image(),
    bossAppearanceScore: 10,
    bossDefeatBonus: 2,
    nextBossScore: 10,
    debugInfo: ''
};

bossState.bossImage.src = 'images/boss.png'; // Убедитесь, что у вас есть изображение босса


// Функция для создания частицы
function createParticle(x, y) {
    return {
        x: x,
        y: y,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 4 - 2,
        lifetime: Math.random() * 30 + 30, // Время жизни частицы в кадрах
    };
}

// Функция для создания взрыва
function createExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
        particles.push(createParticle(x, y));
    }
}

// Загрузка звука взрыва
const explosionSound = new Audio('sounds/explosion.mp3');

// Функция для воспроизведения вступительной музыки
function playIntroMusic() {
    if (!isMusicPlaying) {
        console.log('Attempting to play Intro music');
        introMusic.play().then(() => {
            isMusicPlaying = true;
            console.log('Intro music started playing');
        }).catch(error => {
            console.error("Ошибка воспроизведения вступительной музыки:", error);
        });
    }
}

// Функция для остановки вступительной музыки
function stopIntroMusic() {
    console.log('Stopping Intro music');
    introMusic.pause();
    introMusic.currentTime = 0;
    isMusicPlaying = false;
}

// Функция для воспроизведения музыки Game Over
function playGameOverMusic() {
    console.log('Attempting to play Game Over music');
    gameOverMusic.play().catch(error => {
        console.error("Ошибка воспроизведения музыки Game Over:", error);
    });
}

// Функция для воспроизведения звука выстрела
function playShotSound() {
    console.log('Attempting to play Shot sound');
    shotSound.currentTime = 0;
    shotSound.play().catch(error => {
        console.error("Ошибка воспроизведения звука выстрела:", error);
    });
}

// Функция для сохранения высокого счета
function saveHighScore(score) {
    const highScore = getHighScore();
    if (score > highScore) {
        localStorage.setItem('highScore', score);
    }
}

// Функция для получения высокого счета
function getHighScore() {
    return parseInt(localStorage.getItem('highScore')) || 0;
}

// Функция для начала игры
function startGame() {
    console.log('Starting game');
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
    console.log('Initializing game');
    ship = {
        x: canvas.width / 2 - shipWidth / 2,
        y: canvas.height - shipHeight - 10,
        width: shipWidth,
        height: shipHeight,
        color: 'white'
    };
    bullets = [];
    enemies = [];
    powerUps = [];
    score = 0;
    lives = 3;
    gameOver = false;
    gameStarted = true;

    // Сбрасываем состояние босса
    bossState.isBossFight = false;
    bossState.bossDefeated = false;
    bossState.boss = null;
    bossState.nextBossScore = bossState.bossAppearanceScore;

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

    // Обновляем позиции врагов и пуль
    enemies.forEach(enemy => {
        enemy.width = enemyWidth;
        enemy.height = enemyHeight;
        enemy.x = enemy.x * scaleX;
        enemy.y = enemy.y * scaleY;
    });

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
    };
}

// Функция для создания усиления
function createPowerUp() {
    return {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        type: 'speedBoost',
        speed: 2
    };
}

// Функция для обработки сбора усиления
function collectPowerUp(powerUp) {
    if (powerUp.type === 'speedBoost') {
        activateSpeedBoost();
    }
    // Добавьте больше типов усилений здесь в будущем
}

// Функция для активации ускорения
function activateSpeedBoost() {
    if (!isSpeedBoostActive) {
        normalShipSpeed = shipSpeed;
        shipSpeed *= speedBoostFactor;
        isSpeedBoostActive = true;
        setTimeout(() => {
            shipSpeed = normalShipSpeed;
            isSpeedBoostActive = false;
        }, powerUpDuration);
    }
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
    ctx.fillText(text, x, y, maxWidth);
}

// Функция для получения адаптивного размера шрифта
function getFontSize() {
    return Math.max(12, Math.floor(canvas.width / 30)) + 'px';
}

// Функция для создания босса
function createBoss() {
    console.log('Создание босса');
    return {
        x: canvas.width / 2 - 75,
        y: 50,  // Изменено с -150 на 50, чтобы босс был виден сразу
        width: 150,
        height: 150,
        health: 100,
        maxHealth: 100,
        speedX: 2,
        speedY: 0.5,
        movementTimer: 0,
        movementInterval: 120
    };
}

// Функция для обновления состояния босса
function updateBoss() {
    if (!bossState.boss || bossState.bossDefeated) {
        console.log('updateBoss called with no active boss');
        bossState.isBossFight = false;
        bossState.debugInfo = 'Нет активного босса';
        return;
    }

    // Движение босса
    bossState.boss.x += bossState.boss.speedX;
    bossState.boss.y += bossState.boss.speedY;

    // Ограничение движения
    if (bossState.boss.x <= 0 || bossState.boss.x + bossState.boss.width >= canvas.width) {
        bossState.boss.speedX *= -1;
    }
    if (bossState.boss.y <= 0 || bossState.boss.y >= canvas.height / 3) {
        bossState.boss.speedY *= -1;
    }

    // Случайное изменение направления движения
    bossState.boss.movementTimer++;
    if (bossState.boss.movementTimer >= bossState.boss.movementInterval) {
        bossState.boss.speedX = (Math.random() - 0.5) * 4;  // Случайная скорость от -2 до 2
        bossState.boss.speedY = (Math.random() - 0.5) * 2;  // Случайная скорость от -1 до 1
        bossState.boss.movementTimer = 0;
    }

    // Стрельба босса
    if (Math.random() < 0.02) {  // 2% шанс выстрела на каждом кадре
        const bossShot = {
            x: bossState.boss.x + bossState.boss.width / 2,
            y: bossState.boss.y + bossState.boss.height,
            width: 10,
            height: 20,
            speed: 5,
            color: 'red'
        };
        bossShots.push(bossShot);
    }

    // Обновление позиций выстрелов босса
    for (let i = bossShots.length - 1; i >= 0; i--) {
        bossShots[i].y += bossShots[i].speed;
        
        // Удаление выстрелов, вышедших за пределы экрана
        if (bossShots[i].y > canvas.height) {
            bossShots.splice(i, 1);
        } else {
            // Проверка столкновения с игроком
            if (
                ship.x < bossShots[i].x + bossShots[i].width &&
                ship.x + ship.width > bossShots[i].x &&
                ship.y < bossShots[i].y + bossShots[i].height &&
                ship.y + ship.height > bossShots[i].y
            ) {
                createExplosion(ship.x + ship.width / 2, ship.y + ship.height / 2);
                bossShots.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    saveHighScore(score);
                }
                break;
            }
        }
    }

    // Проверка столкновений с пулями игрока
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i] && bossState.boss &&
            bullets[i].x < bossState.boss.x + bossState.boss.width &&
            bullets[i].x + bullets[i].width > bossState.boss.x &&
            bullets[i].y < bossState.boss.y + bossState.boss.height &&
            bullets[i].y + bullets[i].height > bossState.boss.y
        ) {
            bossState.boss.health -= 10;
            createExplosion(bullets[i].x, bullets[i].y);
            bullets.splice(i, 1);
        }
    }

    // Проверка поражения босса
    if (bossState.boss && bossState.boss.health <= 0) {
        console.log('Boss defeated, calling defeatedBoss');
        defeatedBoss();
        return;
    }

    bossState.debugInfo = `Босс: x=${Math.round(bossState.boss.x)}, y=${Math.round(bossState.boss.y)}, Выстрелов: ${bossShots.length}`;
}

// Функция для обработки поражения босса
// Обновим функцию defeatedBoss
function defeatedBoss() {
    if (bossState.boss) {
        score += bossState.bossDefeatBonus;
        createExplosion(bossState.boss.x + bossState.boss.width / 2, bossState.boss.y + bossState.boss.height / 2);
    }
    bossState.isBossFight = false;
    bossState.bossDefeated = false;  // Изменено с true на false
    bossState.boss = null;
    bossState.nextBossScore = score + bossState.bossAppearanceScore;  // Устанавливаем счет для следующего босса
    enemies = [];  // Очищаем массив врагов после победы над боссом

    // Очистка пуль босса
    bossShots = [];
    console.log('Босс побежден, пули босса очищены');
}   

function update() {
    if (gameOver) {
        if (isMusicPlaying) {
            stopIntroMusic();
            playGameOverMusic();
        }
        return;
    }

    updateBackgroundLayers();

    // Обновление частиц
    particles = particles.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.lifetime--;
        return particle.lifetime > 0;
    });

    // Обновляем положение пуль игрока
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
        }
    }

    // Проверяем, нужно ли начать бой с боссом
    if (score >= bossState.nextBossScore && !bossState.isBossFight) {
        console.log(`Инициализация босса. Счет: ${score}, nextBossScore: ${bossState.nextBossScore}`);
        bossState.isBossFight = true;
        bossState.boss = createBoss();
        bossState.debugInfo = 'Босс создан';
    }

    if (bossState.isBossFight && bossState.boss) {
        updateBoss();
    } else {
        // Если бой с боссом не активен, удаляем все пули босса
        if (bossShots.length > 0) {
            bossShots = [];
            console.log('Бой с боссом неактивен, пули босса очищены');
        }
        
        // Обновляем положение врагов и проверяем столкновения
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemySpeed;

            // Проверяем столкновение с кораблем игрока
            if (
                ship.x < enemies[i].x + enemies[i].width &&
                ship.x + ship.width > enemies[i].x &&
                ship.y < enemies[i].y + enemies[i].height &&
                ship.y + ship.height > enemies[i].y
            ) {
                createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
                explosionSound.currentTime = 0;
                explosionSound.play().catch(error => console.error("Ошибка воспроизведения звука взрыва:", error));
                enemies.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    saveHighScore(score);
                    console.log('Game Over triggered');
                    
                    if (isMusicPlaying) {
                        stopIntroMusic();
                        playGameOverMusic();
                    }
                }
                continue;
            }

            // Проверяем столкновение с пулями игрока
            for (let j = bullets.length - 1; j >= 0; j--) {
                if (
                    bullets[j].x < enemies[i].x + enemies[i].width &&
                    bullets[j].x + bullets[j].width > enemies[i].x &&
                    bullets[j].y < enemies[i].y + enemies[i].height &&
                    bullets[j].y + bullets[j].height > enemies[i].y
                ) {
                    createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch(error => console.error("Ошибка воспроизведения звука взрыва:", error));
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    score++;
                    break;
                }
            }

            // Если враг вышел за пределы экрана, перемещаем его наверх
            if (enemies[i] && enemies[i].y > canvas.height) {
                enemies[i].y = -enemyHeight;
                enemies[i].x = Math.random() * (canvas.width - enemyWidth);
            }
        }

        // Добавляем новых врагов, если их меньше 5 и нет боя с боссом
        while (enemies.length < 5) {
            enemies.push(createEnemy());
        }
    }

    // Обновление пуль босса
    for (let i = bossShots.length - 1; i >= 0; i--) {
        bossShots[i].y += bossShots[i].speed;
        
        // Удаление выстрелов, вышедших за пределы экрана
        if (bossShots[i].y > canvas.height) {
            bossShots.splice(i, 1);
        } else {
            // Проверка столкновения с игроком
            if (
                ship.x < bossShots[i].x + bossShots[i].width &&
                ship.x + ship.width > bossShots[i].x &&
                ship.y < bossShots[i].y + bossShots[i].height &&
                ship.y + ship.height > bossShots[i].y
            ) {
                createExplosion(ship.x + ship.width / 2, ship.y + ship.height / 2);
                bossShots.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    saveHighScore(score);
                }
            }
        }
    }

    // Обновление усилений
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.speed;
        
        // Проверка столкновения с игроком
        if (
            ship.x < powerUp.x + powerUp.width &&
            ship.x + ship.width > powerUp.x &&
            ship.y < powerUp.y + powerUp.height &&
            ship.y + ship.height > powerUp.y
        ) {
            collectPowerUp(powerUp);
            powerUps.splice(index, 1);
        }
        
        // Удаление усиления, если оно вышло за пределы экрана
        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
    });

    // Появление новых усилений
    if (Math.random() < powerUpChance) {
        powerUps.push(createPowerUp());
    }
}

function draw() {
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовываем слои фона
    backgroundLayers.forEach((layer, index) => {
        if (index === 2) { // Предполагаем, что слой с планетами - третий
            const scale = 0.8; // Уменьшаем до 80% от исходного размера
            const newWidth = canvas.width * scale;
            const newHeight = canvas.height * scale;
            const offsetX = (canvas.width - newWidth) / 2;
            const offsetY = (canvas.height - newHeight) / 2;
            ctx.drawImage(layer.image, offsetX, layer.y + offsetY, newWidth, newHeight);
            ctx.drawImage(layer.image, offsetX, layer.y - canvas.height + offsetY, newWidth, newHeight);
        } else {
            ctx.drawImage(layer.image, 0, layer.y, canvas.width, canvas.height);
            ctx.drawImage(layer.image, 0, layer.y - canvas.height, canvas.width, canvas.height);
        }
    });

    if (!gameOver) {
        // Отрисовываем корабль игрока
        if (shipImageLoaded) {
            ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
        } else {
            drawRect(ship.x, ship.y, ship.width, ship.height, ship.color);
        }

        // Отрисовываем пули игрока
        bullets.forEach(bullet => {
            drawRect(bullet.x, bullet.y, bullet.width, bullet.height, 'yellow');
        });

        // Отрисовываем выстрелы босса
        bossShots.forEach(shot => {
            drawRect(shot.x, shot.y, shot.width, shot.height, shot.color);
        });

        // Отрисовываем босса или врагов
        if (bossState.isBossFight && bossState.boss) {
            console.log('Попытка отрисовки босса', bossState.boss);
            // Отрисовка босса
            if (bossState.bossImage.complete) {
                ctx.drawImage(bossState.bossImage, bossState.boss.x, bossState.boss.y, bossState.boss.width, bossState.boss.height);
                console.log('Босс отрисован');
            } else {
                drawRect(bossState.boss.x, bossState.boss.y, bossState.boss.width, bossState.boss.height, 'red');
                console.log('Отрисован прямоугольник вместо босса');
            }
            
            // Отрисовка полоски здоровья босса
            const healthBarWidth = 200;
            const healthBarHeight = 20;
            const healthBarX = (canvas.width - healthBarWidth) / 2;
            const healthBarY = 10;
            
            ctx.fillStyle = 'red';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            
            ctx.fillStyle = 'green';
            const currentHealthWidth = (bossState.boss.health / bossState.boss.maxHealth) * healthBarWidth;
            ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
            
            ctx.strokeStyle = 'white';
            ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        } else {
            enemies.forEach(enemy => {
                if (enemyImageLoaded) {
                    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
                } else {
                    drawRect(enemy.x, enemy.y, enemy.width, enemy.height, 'red');
                }
            });
        }

        // Отрисовываем усиления
        powerUps.forEach(powerUp => {
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.moveTo(powerUp.x + powerUp.width / 2, powerUp.y);
            ctx.lineTo(powerUp.x + powerUp.width, powerUp.y + powerUp.height);
            ctx.lineTo(powerUp.x, powerUp.y + powerUp.height);
            ctx.closePath();
            ctx.fill();
        });

        // Отрисовка частиц
        particles.forEach(particle => {
            ctx.fillStyle = `rgba(255, 200, 0, ${particle.lifetime / 60})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Отрисовываем счет, жизни и рекорд
        drawText(`Очки: ${score}`, 10, 30);
        drawText(`Жизни: ${lives}`, 10, 60);
        drawText(`Рекорд: ${getHighScore()}`, 10, 90);

        // Отрисовка индикатора ускорения
        if (isSpeedBoostActive) {
            drawText('УСКОРЕНИЕ!', canvas.width / 2, 60, getFontSize(), 'yellow', 'center');
        }

        // Отрисовка отладочной информации
        drawText(bossState.debugInfo, 10, canvas.height - 20, '14px', 'white', 'left');
    } else {
        // Отрисовываем экран Game Over
        if (gameOverImageLoaded) {
            ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Отрисовываем текст поверх фона
        drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60, '48px', 'white', 'center');
        drawText(`Очки: ${score}`, canvas.width / 2, canvas.height / 2, '24px', 'white', 'center');
        drawText(`Рекорд: ${getHighScore()}`, canvas.width / 2, canvas.height / 2 + 40, '24px', 'white', 'center');
        drawText('Нажмите пробел для перезапуска', canvas.width / 2, canvas.height / 2 + 80, getFontSize(), 'white', 'center');
        drawText('Нажмите T, чтобы отправить счет в Telegram', canvas.width / 2, canvas.height / 2 + 120, getFontSize(), 'white', 'center');
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