class Enemy {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;        

        this.canAttack = true;    
        this.attackInterval = 800; // attack interval in ms
        this.path;
        this.foundPath = false;
        this.targetSquare = null;
        this.followingPath = false;
    }

    update(player, tileMap) {
        if (this.isCollidingWith(player)) {
            // change players velocity to its colliding velocity
            player.vel = player.minVel;
            player.diagonalVel = player.minDiagonalVel;
    
            if (!this.canAttack)
                return;
    
            player.health --;
            if (player.healInterval)
                clearInterval(player.healInterval);
            document.getElementById('current-health').style = 'width: ' + player.healthPercent() + '%';

            if (player.health <= 0) 
                return true;

            player.heal();
            this.canAttack = false;
            setTimeout(() => {
                if (this)
                    this.canAttack = true
            }, this.attackInterval);
        }
        else {
            this.moveToPlayer(player, tileMap);
        }
        return false;
    }

    isCollidingWith(player) {
        if (this.x + this.w <= player.x || this.x >= player.x + player.w || 
            this.y + this.h <= player.y || this.y >= player.y + player.h)
            return false;
        return true;
    }

    // home the enemy in the direction of the player
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
        let startPos = {x: Math.round(this.x), y: Math.round(this.y)};
        if (tileMap.array[Math.floor(startPos.y)][Math.floor(startPos.x)] == 1)
            startPos = {x: Math.floor(this.x), y: Math.floor(this.y)};

        let endPos = {x: Math.round(player.x), y: Math.round(player.y)};
        if (tileMap.array[endPos.y][endPos.x] == 1)
            endPos = {x: Math.floor(this.x), y: Math.floor(this.y)};
            
        this.path = solver.solve(startPos, endPos);
        if (this.path.length == 1) // error prevention
            this.path.push(this.path[0]);
        this.foundPath = true;
    }

    // returns true if there is an obstacle between the enemy and the player or a tile square
    isObstacleBetween(corners, tileMap) {
        const enemyCorners = [];
        enemyCorners.push({x: this.x, y: this.y});
        enemyCorners.push({x: this.x + this.w * 0.999, y: this.y});
        enemyCorners.push({x: this.x, y: this.y + this.h * 0.999});
        enemyCorners.push({x: this.x + this.w * 0.999, y: this.y + this.h * 0.999});

        for (let i = 0; i < 4; i++) {
            const differenceX = corners[i].x - enemyCorners[i].x;
            const differenceY = corners[i].y - enemyCorners[i].y;
            const distance = Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2));

            const ray = new Ray(enemyCorners[i], {x: differenceX, y: differenceY});
            const intersection = ray.castWalls(tileMap.boundaries);
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

    moveToPlayer(player, tileMap) {
        const playerCorners = [];
        playerCorners.push({x: player.x, y: player.y});
        playerCorners.push({x: player.x + player.w, y: player.y});
        playerCorners.push({x: player.x, y: player.y + player.h});
        playerCorners.push({x: player.x + player.w, y: player.y + player.h});

        // if no walls directly between enemy and player, move straight to player
        if (!this.isObstacleBetween(playerCorners, tileMap)) {
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

                if (this.isObstacleBetween(corners, tileMap)) 
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

    // draw enemy relative to player
    drawRelativeTo(ctx, visibleTiles, player, tileWidth, tileHeight) {
        ctx.fillStyle = 'red';
        const drawPos = player.drawRelativeTo({x: this.x, y: this.y}, visibleTiles);
        ctx.fillRect(drawPos.x * tileWidth, drawPos.y * tileHeight, this.w * tileWidth, this.h * tileHeight);
    }

}