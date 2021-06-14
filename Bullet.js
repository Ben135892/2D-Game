class Bullet {
    constructor(pos, angle) {
        this.pos = pos;
        this.angle = angle;
        this.vel = 0.3;
        this.velX = Math.sin(angle) * this.vel;
        this.velY = Math.cos(angle) * this.vel;
        this.radius = 0.07;
    }

    update() { 
        this.pos.x += this.velX;
        this.pos.y += this.velY;
    }

    isCollidingWithWall(bullets, map) {
        const mapWidth = map[0].length;
        const mapHeight = map.length;

        // if bullet has collided with a wall
        if (this.pos.x < 0 || this.pos.y < 0 || this.pos.x >= mapWidth || this.pos.y >= mapHeight ||
            map[Math.floor(this.pos.y)][Math.floor(this.pos.x)] == 1) {
            bullets.splice(bullets.indexOf(this), 1);
            return true;
        }
        return false;
    }

    isCollidingWithSingleEnemy(enemy) {
        if (this.pos.x + this.radius < enemy.x ||
            this.pos.x - this.radius > enemy.x + enemy.w ||
            this.pos.y + this.radius < enemy.y ||
            this.pos.y - this.radius > enemy.y + enemy.h)
               return false;
        return true;
    }

    isCollidingWithEnemy(enemies, bullets) {
        for (let i = 0; i < enemies.length; i++) {
            if (this.isCollidingWithSingleEnemy(enemies[i])) {
                // if collided with enemy, remove enemy and bullet
                bullets.splice(bullets.indexOf(this), 1);
                enemies.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight) {
        const drawPos = player.drawRelativeTo({x: this.pos.x, y: this.pos.y}, visibleTiles);
        ctx.beginPath();
        ctx.arc(drawPos.x * tileWidth, drawPos.y * tileHeight, this.radius * tileWidth, 0, 2 * Math.PI); // circle
        ctx.fillStyle = 'purple';
        ctx.fill(); 
    }

}