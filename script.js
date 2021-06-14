const canvas = document.getElementById("canvas");
canvas.onselectstart = () => { return false; }
const ctx = canvas.getContext("2d");

// store the keys currently pressed down, and mouse coordinates
const keysDown = [];
let mouseCoords = {x: 0, y: 0};
let mouseDown = false;

document.addEventListener('keypress', function(e) {
    if (!keysDown.includes(e.key))
        keysDown.push(e.key);
});
document.addEventListener('keyup', function(e) {
    keysDown.splice(keysDown.indexOf(e.key), 1);
});
canvas.addEventListener('mousemove', function(e) {
    mouseCoords = {x: e.offsetX / tileWidth, y: e.offsetY / tileHeight};
});
canvas.addEventListener('mousedown', function(e) {
    mouseDown = true;
});
canvas.addEventListener('mouseup', function(e) {
    mouseDown = false;
});

function getMouseAngle() {
    const differenceX = mouseCoords.x - visibleTiles / 2;
    const differenceY = mouseCoords.y - visibleTiles / 2;

    // get mouseAngle in form, 0 <= mouseAngle < 2pi, measured clockwise from positive y axis
    let mouseAngle = Math.atan2(differenceY, differenceX);
    return convertAngle(mouseAngle);
}

// main game loop
function gameLoop() {

    // account for user input
    for (let i = 0; i < keysDown.length; i++) {
        const key = keysDown[i];
        switch(key) {
            case 'w':
                if (keysDown.includes('d') || keysDown.includes('a'))
                    player.vel = player.diagonalVel;
                player.moveUp(tileMap.array);
                break;
            case 'd':
                if (keysDown.includes('w') || keysDown.includes('s'))
                    player.vel = player.diagonalVel;
                player.moveRight(tileMap.array);
                break;
            case 's':
                if (keysDown.includes('a') || keysDown.includes('d'))
                    player.vel = player.diagonalVel;
                player.moveDown(tileMap.array);
                break;
            case 'a':
                if (keysDown.includes('w') || keysDown.includes('s'))
                    player.vel = player.diagonalVel;
                player.moveLeft(tileMap.array, false);
                break;
        }
    }

    // round the coordinates of the player to 2 d.p
    player.roundCoords();
    player.vel = player.maxVel;
    player.diagonalVel = player.maxDiagonalVel;

    if (mouseDown) 
        player.shootBullet(getMouseAngle());

    player.updateBullets(enemies);

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].isCollidingWith(player)) {
            if (!enemies[i].canAttack)
                continue;
            player.vel = player.minVel;
            player.diagonalVel = player.minDiagonalVel;
            player.health--;
            if (player.health <= 0) {
                // game over
                clearInterval(interval);
                startGame();
            }
            else {
                enemies[i].canAttack = false;
                setTimeout(() => {
                    if (enemies[i])
                        enemies[i].canAttack = true
                }, enemies[i].attackInterval);
                document.getElementById('health').innerText = player.health;
            }
        }
        else {
            enemies[i].moveToPlayer(player, tileMap);
        }
    }

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // cast rays to each boundary, drawing yellow polygon
    player.look(ctx, visibleTiles, tileMap.boundaries, tileMap.corners, getMouseAngle(), tileWidth, tileHeight);

    // draw visible enemies, only the parts of them intersecting with yellow polygon (the light)
    ctx.globalCompositeOperation = 'source-atop';

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight);
    }
    for (let i = 0; i < player.bullets.length; i++) {
        player.bullets[i].drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight);
    }

    // draw shadows in the background
    ctx.globalCompositeOperation = 'destination-over'; 
    ctx.fillStyle = '#0c0c0c'; // grey
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw player
    ctx.globalCompositeOperation = 'source-over';
    player.draw(ctx, visibleTiles, tileWidth, tileHeight);
    player.drawGun(ctx, visibleTiles, getMouseAngle(), tileWidth, tileHeight);
    
    // draw the walls
    tileMap.drawWalls(ctx, visibleTiles, player);

    // draw out of map walls if in view
    tileMap.drawOuterBounds(ctx, visibleTiles, player, tileWidth, tileHeight);

    window.requestAnimationFrame(gameLoop);
}

const visibleTiles = 13; // 13 visible tiles across x and y axis, must be odd
const tileWidth = canvas.clientWidth / visibleTiles;
const tileHeight = canvas.clientHeight / visibleTiles;

const tileMap = new TileMap();
let player;

// testing
let interval;
function startGame() {
    player = new HumanPlayer(1, 1, 1, 1);
    enemies = [];
    let intervalTime = 1000;
    let currentVel = 0.02;
    let maxVel = 0.025;

    function spawnEnemies() {
        for (let i = 0; i < 2; i++) { // spawn two enemies at a time
            let x, y;
            while (true) {
                x = Math.floor(Math.random() * tileMap.mapWidth);
                y = Math.floor(Math.random() * tileMap.mapHeight);
                if (tileMap.array[y][x] == 1)
                    continue;
                if (Math.abs(player.x + player.w / 2 - x) < visibleTiles / 2 ||
                    Math.abs(player.y + player.h / 2 - y) < visibleTiles / 2)
                    continue;

                const width = 0.5 + Math.random() * 0.3;
                const enemy = new Enemy(x, y, width, width);
                let vel = currentVel;
                if (vel > maxVel)
                    vel = maxVel
                vel += Math.random() * 0.01;
                enemy.vel = vel;
                enemies.push(enemy);
                break;
            }
        }
        currentVel += 0.0001;
        intervalTime -= 20;
        if (intervalTime < 50)
            intervalTime = 50;

        clearInterval(interval);
        if (enemies.length >= 30)
            interval = setInterval(() => spawnEnemies(), intervalTime + Math.random() * 2000);
        else 
            interval = setInterval(() => spawnEnemies(), intervalTime);
    }

    interval = setInterval(spawnEnemies, intervalTime);
}

startGame();

window.requestAnimationFrame(gameLoop);