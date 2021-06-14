class Enemy {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.canAttack = true;    
        this.attackInterval = 800; // attack interval in ms
        this.vel = 0.02;
        this.path = [];
        this.foundPath = false;
        this.targetSquare = null;
        this.followingPath = false;
    }

    // find out if enemy is colliding with another player
    isCollidingWith(player) {
        if (this.x + this.w <= player.x || this.x >= player.x + player.w || 
            this.y + this.h <= player.y || this.y >= player.y + player.h)
            return false;
        return true;
    }

    // home the enemy in the general direction of the player
    homingDirection(player) {
        const differenceX = (player.x + player.w / 2) - (this.x + this.w / 2);
        const differenceY = (player.y + player.h / 2) - (this.y + this.h / 2);

        const magnitude = Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2));
        const directionX = differenceX / magnitude * this.vel;
        const directionY = differenceY / magnitude * this.vel;
        return {x: directionX, y: directionY};
    }

    findPath(player, tileMap) {
        // A* algorithm
        const solver = new AStar(tileMap);
        const startPos = {x: Math.floor(this.x), y: Math.floor(this.y)};
        // move enemy towards center of player
        const endPos = {x: Math.floor(player.x), y: Math.floor(player.y)};
        this.path = solver.solve(startPos, endPos);
        this.foundPath = true;
    }

    moveToPlayer(player, tileMap) {
        const playerCorners = [];
        playerCorners.push({x: player.x, y: player.y});
        playerCorners.push({x: player.x + player.w, y: player.y});
        playerCorners.push({x: player.x, y: player.y + player.h});
        playerCorners.push({x: player.x + player.w, y: player.y + player.h});

        // if no walls directly between enemy and player, move straight to player
        if (!this.isObstacleBetween(playerCorners, tileMap.boundaries, tileMap)) {
            this.foundPath = false;
            this.targetSquare = null;
            this.followingPath = false;
            const homingDirection = this.homingDirection(player);
            this.x += homingDirection.x;
            this.y += homingDirection.y;
            return;
        }
        if (!this.foundPath) {
            // find a new path
            this.findPath(player, tileMap);
        }
        if (!this.targetSquare) {
            // find a square to move to, for the A* pathfinding. 
            // If no objects between enemy and second path square, move to that square
            // makes for a smoother transition
            if (this.followingPath) 
                this.targetSquare = this.path[1];
            else {
                const corners = [];
                corners.push({x: this.path[1].x, y: this.path[1].y});
                corners.push({x: this.path[1].x + 1, y: this.path[1].y});
                corners.push({x: this.path[1].x, y: this.path[1].y + 1});
                corners.push({x: this.path[1].x + 1, y: this.path[1].y + 1});

                if (this.isObstacleBetween(corners, tileMap.boundaries, tileMap)) 
                    this.targetSquare = this.path[0];
                else 
                    this.targetSquare = this.path[1];
            }
        }

        const differenceX = this.targetSquare.x - this.x;
        const differenceY = this.targetSquare.y - this.y;
        const magnitude = Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2));
        if (magnitude != 0) {
            this.x += differenceX / magnitude * this.vel;
            this.y += differenceY / magnitude * this.vel;
        }
        if (differenceX == 0 && differenceY == 0 ||
            differenceX > 0 && this.x >= this.targetSquare.x || differenceX < 0 && this.x <= this.targetSquare.x ||
            differenceY > 0 && this.y >= this.targetSquare.y || differenceY < 0 && this.y <= this.targetSquare.y) 
        {
            this.x = this.targetSquare.x;
            this.y = this.targetSquare.y;
            this.foundPath = false;
            this.targetSquare = null;
            this.followingPath = true;
        }
    }
    
    // returns if there is an obstacle between the enemy and a tile square (array of corners)
    isObstacleBetween(corners, boundaries, tileMap) {
        
        const enemyCorners = [];
        enemyCorners.push({x: this.x, y: this.y});
        enemyCorners.push({x: this.x + this.w, y: this.y});
        enemyCorners.push({x: this.x, y: this.y + this.h});
        enemyCorners.push({x: this.x + this.w, y: this.y + this.h});

        for (let i = 0; i < corners.length; i++) {
            const differenceX = corners[i].x - enemyCorners[i].x;
            const differenceY = corners[i].y - enemyCorners[i].y;
            const distance = Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2));

            const ray = new Ray(enemyCorners[i], {x: differenceX, y: differenceY});
            const intersection = ray.castWalls(boundaries);
            if (intersection == null)
                continue;

            const intersectionDistance = Math.sqrt(Math.pow(intersection.x - enemyCorners[i].x, 2) + Math.pow(intersection.y - enemyCorners[i].y, 2));
            if (intersectionDistance < distance) 
                return true;   
            
            // enemy corner may be on a boundary, and casting a ray to the boundary will always give no intersection
            // check if there is a intersection by checking first tile square in direction of ray
            if (enemyCorners[i].x == Math.floor(enemyCorners[i].x) || enemyCorners[i].y == Math.floor(enemyCorners[i].y)) {
                let varianceX, varianceY;
                varianceX = differenceX > 0 ? 0.00001 : -0.00001;
                varianceY = differenceY > 0 ? 0.00001 : -0.00001;
                if (differenceX == 0) 
                    varianceX = 0;
                if (differenceY == 0)
                    varianceY = 0;
                let square;
                if (enemyCorners[i].x == Math.floor(enemyCorners[i].x) && enemyCorners[i].y == Math.floor(enemyCorners[i].y)) {
                    square = tileMap.array[Math.floor(enemyCorners[i].y + varianceY)][Math.floor(enemyCorners[i].x + varianceX)];
                }
                else if (enemyCorners[i].x == Math.floor(enemyCorners[i].x)) {
                    square = tileMap.array[Math.floor(enemyCorners[i].y)][Math.floor(enemyCorners[i].x + varianceX)];
                }
                else if (enemyCorners[i].y == Math.floor(enemyCorners[i].y)) {
                    square = tileMap.array[Math.floor(enemyCorners[i].y + varianceY)][Math.floor(enemyCorners[i].x)];
                }
                if (square == 1) {
                    return true;
                }  
            }
        }
        return false;
    }

    // draw enemy relative to player
    drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight) {
        if (this.isShot) 
            ctx.fillStyle = 'orange';
        else
            ctx.fillStyle = 'red';
        const drawPos = player.drawRelativeTo({x: this.x, y: this.y}, visibleTiles);
        ctx.fillRect(drawPos.x * tileWidth, drawPos.y * tileHeight, this.w * tileWidth, this.h * tileHeight);
    }

}