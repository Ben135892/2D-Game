const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// store the keys currently pressed down, and mouse coordinates
const keysDown = [];
let mouseCoords = {x: 0, y: 0};

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
canvas.addEventListener('click', function(e) {
    if (player.canShoot) {
        player.canShoot = false;
        player.ammo--;
        if (player.ammo <= 0) { // reload
            setTimeout(() => {
                player.canShoot = true;
                player.ammo = player.maxAmmo;
            }, player.reloadTime);
        }
        else {
            setTimeout(() => player.canShoot = true, player.fireInterval);
        }
        player.shootBullet(getMouseAngle());
    }
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
                player.moveUp(tileMap.array);
                break;
            case 'd':
                player.moveRight(tileMap.array);
                break;
            case 's':
                player.moveDown(tileMap.array);
                break;
            case 'a':
                player.moveLeft(tileMap.array);
                break;
        }
    }

    // round the coordinates of the player to 2 d.p
    player.roundCoords();

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].isCollidingWith(player)) {
            if (enemies[i].canAttack) {
                player.health--;
                enemies[i].canAttack = false;
                setTimeout(() => {
                    if (enemies[i])
                        enemies[i].canAttack = true
                }, enemies[i].attackInterval);
                document.getElementById('health').innerText = player.health;
            }
        }
        else {
            // find direction leading directly to player
            /*const homingDirection = enemies[i].homingDirection(player);
            enemies[i].x += homingDirection.x;
            enemies[i].y += homingDirection.y;*/
        }
    }

    player.updateBullets(tileMap.array, enemies);

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // cast rays to each boundary, drawing yellow polygon
    //player.look(ctx, visibleTiles, tileMap.boundaries, tileMap.corners, getMouseAngle(), tileWidth, tileHeight);

    // draw visible enemies, only the parts of them intersecting with yellow polygon (the light)
    //ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'red';

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight);
    }
    for (let i = 0; i < player.bullets.length; i++) {
        player.bullets[i].drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight);
    }

    // draw shadows in the background
    //ctx.globalCompositeOperation = 'destination-over'; 
    //ctx.fillStyle = '#0c0c0c'; // grey
    //ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw player
    //ctx.globalCompositeOperation = 'source-over';
    player.draw(ctx, visibleTiles, tileWidth, tileHeight);
    player.drawGun(ctx, visibleTiles, getMouseAngle(), tileWidth, tileHeight);
    
    // draw the walls
    tileMap.drawWalls(ctx, visibleTiles, player);

    // draw out of map walls if in view
    tileMap.drawOuterBounds(ctx, visibleTiles, player, tileWidth, tileHeight);

    for (let i = 0; i < tileMap.boundaries.length; i++) {
        ctx.lineWidth = 2;
        const pos1 = player.drawRelativeTo({x: tileMap.boundaries[i].x1, y: tileMap.boundaries[i].y1}, visibleTiles);
        const pos2 = player.drawRelativeTo({x: tileMap.boundaries[i].x2, y: tileMap.boundaries[i].y2}, visibleTiles);
        ctx.beginPath();
        ctx.arc(pos1.x * tileWidth, pos1.y * tileHeight, 0.01 * tileWidth, 0, 2 * Math.PI); // circle
        ctx.arc(pos2.x * tileWidth, pos2.y * tileHeight, 0.01 * tileWidth, 0, 2 * Math.PI); // circle
        ctx.fillStyle = 'orange';
        ctx.strokeStyle = 'orange';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pos1.x *  tileWidth, pos1.y* tileHeight);
        ctx.lineTo(pos2.x* tileWidth, pos2.y * tileHeight);
        ctx.stroke();
        
    }
    /*for (let i = 0; i < tileMap.corners.length; i++) {
        const pos1 = player.drawRelativeTo({x: tileMap.corners[i].x, y: tileMap.corners[i].y}, visibleTiles);
        ctx.beginPath();
        ctx.arc(pos1.x * tileWidth, pos1.y * tileHeight, 0.05 * tileWidth, 0, 2 * Math.PI); // circle
        ctx.fillStyle = 'orange';
        ctx.fill();
    }*/

    window.requestAnimationFrame(gameLoop);
}

const visibleTiles = 13; // 11 visible tiles across x and y axis, must be odd
const tileWidth = canvas.clientWidth / visibleTiles;
const tileHeight = canvas.clientHeight / visibleTiles;

const tileMap = new TileMap();
const player = new HumanPlayer(Math.floor(tileMap.mapWidth / 2), 0, 1, 1);

// create some enemy objects with random positions, for tesing
const enemies = [];
for (let i = 0; i < 10; i++) {
    let x, y;
    while (true) {
        x = Math.floor(Math.random() * tileMap.mapWidth);
        y = Math.floor(Math.random() * tileMap.mapHeight);
        if (tileMap.array[y][x] != 1)
            break;
    }
    const enemy = new Enemy(x, y, 1, 1);
    enemies.push(enemy);
}

window.requestAnimationFrame(gameLoop);