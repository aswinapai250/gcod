const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0
};

// Projectiles
const projectiles = [];
const projectileSpeed = 7;

// Enemies
const enemies = [];
const enemySpeed = 2;

// Score
let score = 0;

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    player.x += player.dx;
    player.y += player.dy;

    detectWalls();
}

function detectWalls() {
    // Left wall
    if (player.x < 0) {
        player.x = 0;
    }
    // Right wall
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    // Top wall
    if (player.y < 0) {
        player.y = 0;
    }
    // Bottom wall
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function update() {
    clear();

    drawPlayer();

    newPos();

    requestAnimationFrame(update);
}

function move(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        player.dy = -player.speed;
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        player.dy = player.speed;
    }
}

function stop(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'ArrowLeft' ||
        e.key === 'a' ||
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'ArrowDown' ||
        e.key === 's'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}

document.addEventListener('keydown', move);
document.addEventListener('keyup', stop);

update();

// --- Projectile and Enemy Logic ---

function drawProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        const p = projectiles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
}

function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
    }
}

function shoot(e) {
    const angle = Math.atan2(e.clientY - canvas.offsetTop - player.y - player.height / 2, e.clientX - canvas.offsetLeft - player.x - player.width / 2);
    const velocity = {
        x: Math.cos(angle) * projectileSpeed,
        y: Math.sin(angle) * projectileSpeed
    };
    projectiles.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        radius: 5,
        color: 'red',
        velocity
    });
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * 20 + 10;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const angle = Math.atan2(player.y - y, player.x - x);
        const velocity = {
            x: Math.cos(angle) * enemySpeed,
            y: Math.sin(angle) * enemySpeed
        };
        enemies.push({ x, y, radius, color: 'green', velocity });
    }, 1000);
}

function updateGame() {
    clear();
    drawPlayer();
    drawProjectiles();
    drawEnemies();
    newPos();

    // Update projectiles
    for (let i = 0; i < projectiles.length; i++) {
        const p = projectiles[i];
        p.x += p.velocity.x;
        p.y += p.velocity.y;

        if (p.x + p.radius < 0 || p.x - p.radius > canvas.width || p.y + p.radius < 0 || p.y - p.radius > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Update enemies and collision detection
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.velocity.x;
        e.y += e.velocity.y;

        // Collision with player
        const dist = Math.hypot(player.x + player.width / 2 - e.x, player.y + player.height / 2 - e.y);
        if (dist - e.radius - player.width / 2 < 1) {
            endGame();
        }

        // Collision with projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const p = projectiles[j];
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist - e.radius - p.radius < 1) {
                enemies.splice(i, 1);
                projectiles.splice(j, 1);
                score += 100;
            }
        }
    }
    
    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);


    requestAnimationFrame(updateGame);
}

function endGame() {
    alert(`Game Over! Your score: ${score}`);
    document.location.reload();
}

canvas.addEventListener('click', shoot);
spawnEnemies();
// cancel the previous animation frame to avoid running two loops
cancelAnimationFrame(update);
updateGame();