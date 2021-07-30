class Bullet {
    constructor(pos, angle) {
        this.pos = pos;
        this.angle = angle;
        this.vel = 0.2;
        this.velX = Math.sin(angle) * this.vel;
        this.velY = Math.cos(angle) * this.vel;
        this.radius = 0.08;
    }

    update() { 
        this.pos.x += this.velX;
        this.pos.y += this.velY;
    }

    isCollidingWithWall(tileMap) {
        return (this.pos.x < 0 || this.pos.y < 0 || 
            this.pos.x >= tileMap.mapWidth || this.pos.y >= tileMap.mapHeight ||
            tileMap.array[Math.floor(this.pos.y)][Math.floor(this.pos.x)] == 1);
    }

    isCollidingWithEnemy(enemy) {
        return !(this.pos.x + this.radius <= enemy.x ||
                this.pos.x - this.radius >= enemy.x + enemy.w ||
                this.pos.y + this.radius <= enemy.y ||
                this.pos.y - this.radius >= enemy.y + enemy.h);
    }

    drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight) {
        const drawPos = player.drawRelativeTo({x: this.pos.x, y: this.pos.y}, visibleTiles);
        ctx.beginPath();
        ctx.arc(drawPos.x * tileWidth, drawPos.y * tileHeight, this.radius * tileWidth, 0, 2 * Math.PI); // circle
        ctx.fillStyle = 'purple';
        ctx.fill(); 
    }

}