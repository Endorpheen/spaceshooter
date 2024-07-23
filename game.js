// Получаем элемент canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Задаем размеры canvas
canvas.width = 800;
canvas.height = 600;

// Задаем размеры и скорости объектов
const shipWidth = 50;
const shipHeight = 50;
const bulletWidth = 5;
const bulletHeight = 15;
const enemyWidth = 40;
const enemyHeight = 40;
const shipSpeed = 5;
const bulletSpeed = 7;
const enemySpeed = 2;

// Создаем корабль игрока
const ship = {
    x: canvas.width / 2 - shipWidth / 2,
    y: canvas.height - shipHeight - 10,
    width: shipWidth,
    height: shipHeight,
    color: 'white'
};

// Массивы для пуль и врагов
let bullets = [];
let enemies = [];

// Игровые переменные
let score = 0;
let lives = 3;
let gameOver = false;

// Загружаем изображение для экрана Game Over
const gameOverImage = new Image();
gameOverImage.src = './images/gas-kvas-com-p-oboi-s-nadpisyu-konets-igri-36.jpg';

// Флаг для отслеживания загрузки изображения
let gameOverImageLoaded = false;

gameOverImage.onload = function() {
    gameOverImageLoaded = true;
};

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

// Заполняем массив врагов
for (let i = 0; i < 5; i++) {
    enemies.push(createEnemy());
}

// Функция для отрисовки прямоугольника
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Функция для отрисовки текста
function drawText(text, x, y, fontSize = '20px', color = 'white', align = 'left') {
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
        if (bullet.y + bulletHeight < 0) {
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
        if (gameOverImageLoaded) {
            ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);
        } else {
            // Если изображение не загрузилось, рисуем черный фон
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Полупрозрачный слой поверх изображения
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40, '48px', 'white', 'center');
        drawText(`Очки: ${score}`, canvas.width / 2, canvas.height / 2 + 20, '24px', 'white', 'center');
        drawText('Нажмите пробел для перезапуска', canvas.width / 2, canvas.height / 2 + 60, '18px', 'white', 'center');
    }
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Обработчик нажатия клавиш
document.addEventListener('keydown', (event) => {
    if (!gameOver) {
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
    } else if (event.key === ' ') {
        // Перезапуск игры
        score = 0;
        lives = 3;
        gameOver = false;
        enemies = [];
        bullets = [];
        ship.x = canvas.width / 2 - shipWidth / 2;
        for (let i = 0; i < 5; i++) {
            enemies.push(createEnemy());
        }
    }
});

// Запускаем игру
gameLoop();