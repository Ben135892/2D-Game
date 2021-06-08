class Enemy {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.canAttack = true;    
        this.attackInterval = 800; // attack interval in ms
        this.vel = 0.02;
    }

    isCollidingWithWall(map) {
        return this.x < 0 || this.y < 0 ||
            this.x + this.w >= map[0].length || this.y + this.h >= map.length || 
            map[Math.floor(this.y)][Math.floor(this.x)] == 1 ||
            map[Math.floor(this.y)][Math.floor(this.x + 0.99 * this.w)] == 1 ||
            map[Math.floor(this.y + 0.99 * this.h)][Math.floor(this.x)] == 1 ||
            map[Math.floor(this.y + 0.99 * this.h)][Math.floor(this.x + 0.99 * this.w)] == 1;
    }

    // find out if enemy is colliding with another player
    isCollidingWith(player) {
        if (this.x + this.w < player.x || this.x > player.x + player.w || 
            this.y + this.h < player.y || this.y > player.y + player.h)
            return false;
        return true;
    }

    // home the enemy in the general direction of the player
    homingDirection(player) {
        const differenceX = (player.x + player.w / 2) - this.x;
        const differenceY = (player.y + player.h / 2) - this.y;

        const magnitude = Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2));
        const directionX = differenceX / magnitude * this.vel;
        const directionY = differenceY / magnitude * this.vel;
        return {x: directionX, y: directionY};
    }

    // draw enemy relative to player
    drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight) {
        const drawPos = player.drawRelativeTo({x: this.x, y: this.y}, visibleTiles);
        ctx.fillRect(drawPos.x * tileWidth, drawPos.y * tileHeight, this.w * tileWidth, this.h * tileHeight);
    }

}