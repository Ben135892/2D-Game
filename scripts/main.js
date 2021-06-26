const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.onselectstart = () => false;

const keysDown = [];
let mouseCoords = {x: 0, y: 0};
let mouseDown = false;

document.addEventListener('keypress', function(e) {
    if (e.key == ' ') {
        // spacebar pressed
        if (!game.started) {
            document.getElementById('start').hidden = true;
            enemies = [];
            player = new HumanPlayer(0, 0, 1, 1);
            game = new Game();
            game.init(enemies, player, tileMap);
            gameLoop();
        }
    }
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
    const differenceX = mouseCoords.x - tileMap.visibleTiles / 2;
    const differenceY = mouseCoords.y - tileMap.visibleTiles / 2;
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
                if (keysDown.includes('d') || keysDown.includes('a')) // moving diagonally
                    player.vel = player.diagonalVel;
                player.moveUp(tileMap);
                break;
            case 'd':
                if (keysDown.includes('w') || keysDown.includes('s'))
                    player.vel = player.diagonalVel;
                player.moveRight(tileMap);
                break;
            case 's':
                if (keysDown.includes('a') || keysDown.includes('d'))
                    player.vel = player.diagonalVel;
                player.moveDown(tileMap);
                break;
            case 'a':
                if (keysDown.includes('w') || keysDown.includes('s'))
                    player.vel = player.diagonalVel;
                player.moveLeft(tileMap);
                break;
        }
    }

    // round the coordinates of the player to 2 d.p and reset velocities
    player.roundCoords();
    player.vel = player.maxVel;
    player.diagonalVel = player.maxDiagonalVel;

    if (mouseDown) 
        player.shootBullet(getMouseAngle());

    player.updateBullets(enemies, tileMap);

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].update(player, tileMap)) // if game over
            break; 
    }

    if (player.health <= 0) {
        // game over
        game.finish();
        const start = document.getElementById('start');
        start.hidden = false;
        start.innerText = 'Game Over - Press Space to Play Again';
        // return to exit game loop
        return;
    }

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // cast rays to boundaries, drawing yellow polygon of light
    player.look(ctx, tileMap, getMouseAngle(), tileWidth, tileHeight);

    // draw visible enemies and bullets, only the parts of them intersecting with yellow polygon (the light)
    ctx.globalCompositeOperation = 'source-atop';

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].drawRelativeTo(ctx, tileMap.visibleTiles, player, tileWidth, tileHeight);
    }
    player.drawBullets(ctx, tileMap.visibleTiles, tileWidth, tileHeight);

    // draw shadows in the background
    ctx.globalCompositeOperation = 'destination-over'; 
    ctx.fillStyle = '#0c0c0c'; // grey
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw player
    ctx.globalCompositeOperation = 'source-over';
    player.draw(ctx, tileMap.visibleTiles, getMouseAngle(), tileWidth, tileHeight);
    
    // draw the walls
    tileMap.drawWalls(ctx, tileMap.visibleTiles, player, tileWidth, tileHeight);

    if (game.started)
        window.requestAnimationFrame(gameLoop);
}

const tileMap = new TileMap();
const tileWidth = canvas.clientWidth / tileMap.visibleTiles;
const tileHeight = canvas.clientHeight / tileMap.visibleTiles;
let player = new HumanPlayer(0, 0, 1, 1);

let enemies = [];
let game = new Game();

// call game loop, which will draw the canvas a single time
gameLoop();





