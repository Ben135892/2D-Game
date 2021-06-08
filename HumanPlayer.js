class HumanPlayer {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.health = 100;
        this.vel = 0.05;
        this.maxAmmo = 10;
        this.ammo = this.maxAmmo;
        this.canShoot = true;
        this.reloadTime = 1000;   // in ms
        this.fireInterval = 100;  // in ms
        this.fieldOfView = 90;  // in degrees, can't be in between 1s80 and 360
        this.fieldOfViewRadians = toRadians(this.fieldOfView);
        this.gunLength = 0.5;
        this.bullets = [];
    }

    moveRight(map) {
        const mapWidth = map[0].length;
        this.x += this.vel;
        if (this.x + this.w >= mapWidth || 
            map[Math.floor(this.y)][Math.floor(this.x + this.w)] == 1 || 
            map[Math.floor(this.y + this.h * 0.99)][Math.floor(this.x + this.w)] == 1) {
            this.x = Math.floor(this.x + this.w) - this.w;
        }
    }

    moveLeft(map) {
        this.x -= this.vel;
        if (this.x < 0 || 
            map[Math.floor(this.y)][Math.floor(this.x)] == 1 || 
            map[Math.floor(this.y + this.h * 0.99)][Math.floor(this.x)] == 1) {
            this.x = Math.floor(this.x) + 1;
        }
    }

    moveUp(map) {
        this.y -= this.vel;
        if (this.y < 0 || 
            map[Math.floor(this.y)][Math.floor(this.x)] == 1 || 
            map[Math.floor(this.y)][Math.floor(this.x + this.w * 0.99)] == 1) {
            this.y = Math.floor(this.y) + 1;
        }
    }

    moveDown(map) {
        const mapHeight = map.length;
        this.y += this.vel;
        if (this.y + this.h >= mapHeight ||
            map[Math.floor(this.y + this.h)][Math.floor(this.x)] == 1 || 
            map[Math.floor(this.y + this.h)][Math.floor(this.x + this.w * 0.99)] == 1) {
            this.y = Math.floor(this.y + this.h) - this.h;
        }
    }

    roundCoords() {
        this.x = roundTo2DP(this.x);
        this.y = roundTo2DP(this.y);
    }

    shootBullet(angle) {
        const bulletPos = {x: this.x + this.w / 2 + Math.sin(angle) * this.gunLength, y: this.y + this.h / 2 + Math.cos(angle) * this.gunLength};
        this.bullets.push(new Bullet(bulletPos, angle));
    }

    updateBullets(tileMap, enemies) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
            // if collided with wall 
            if (this.bullets[i].isCollidingWithWall(this.bullets, tileMap) ||
                this.bullets[i].isCollidingWithEnemy(enemies, this.bullets)) {
                i--;
            }
        }
    }

    // finds the tile map coordinates of where to draw a point, relative to the player
    drawRelativeTo(pos, visibleTiles) {
        const offsetX = (visibleTiles / 2 - this.w / 2) + (pos.x - this.x);
        const offsetY = (visibleTiles / 2 - this.h / 2) + (pos.y - this.y);
        return {x: offsetX, y: offsetY};
    }

    look(ctx, visibleTiles, boundaries, corners, mouseAngle, tileWidth, tileHeight) {
        const playerPos = {x: this.x + this.w / 2, y: this.y + this.h / 2};

        // for all angles a, 0 <= a < 2pi
        const rayPos = playerPos;
        const rays = [];
        
        // get angle of left-most ray
        let leftRayAngle = mouseAngle - this.fieldOfViewRadians / 2;
        if (leftRayAngle < 0)
            leftRayAngle += 2 * Math.PI;

        // get angle of right-most ray
        let rightRayAngle = mouseAngle + this.fieldOfViewRadians / 2;
        if (rightRayAngle >= 2 * Math.PI)
            rightRayAngle -= 2 * Math.PI;

        // cast left-most and right-most rays
        const leftRay = new Ray(rayPos, {x: Math.sin(leftRayAngle), y: Math.cos(leftRayAngle)});
        const rightRay = new Ray(rayPos, {x: Math.sin(rightRayAngle), y: Math.cos(rightRayAngle)});
        rays.push({angle: leftRayAngle, intersection: leftRay.castWalls(boundaries)});
        rays.push({angle: rightRayAngle, intersection: rightRay.castWalls(boundaries)});

        // cast a ray to each corner of every wall, along with two more rays with angle +- 0.0001 radians
        for (let i = 0; i < corners.length; i++) {
            const rayDirectionX = corners[i].x - rayPos.x;
            const rayDirectionY = corners[i].y - rayPos.y;
            
            // get rayAngle in form, 0 <= rayAngle < 2pi, measured clockwise from positive y axis
            let rayAngle = Math.atan2(rayDirectionY, rayDirectionX);
            rayAngle = convertAngle(rayAngle);

            // get difference, in radians between the mouse angle and ray angle
            let angleDifference = Math.abs(rayAngle - mouseAngle);
            if (angleDifference > Math.PI)
                angleDifference = 2 * Math.PI - angleDifference;
            if (angleDifference > this.fieldOfViewRadians / 2)
                continue;

            for (let j = 0; j < 3; j++) {
                let ray;
                if (j == 0) 
                    ray = new Ray(rayPos, {x: rayDirectionX, y: rayDirectionY});
                else {
                    if (j == 1) 
                        rayAngle += 0.00001;
                    else 
                        rayAngle -= 0.00002;
                    ray = new Ray(rayPos, {x: Math.sin(rayAngle), y: Math.cos(rayAngle)});
                }
                const intersection = ray.castWalls(boundaries);
                if (intersection == null) {
                    continue;
                }
                    
                // need to store the angle of the ray
                rays.push({angle: rayAngle, intersection: intersection});
            }
        }

        // if mouse is at a certain angle, cannot draw the rays in ascending order of angle yet
        if (mouseAngle < this.fieldOfViewRadians / 2 || mouseAngle >= 2 * Math.PI - this.fieldOfViewRadians / 2) {
            for (let i = 0; i < rays.length; i++) {
                if (rays[i].angle < Math.PI)
                    rays[i].angle = Math.PI - rays[i].angle;
                else 
                    rays[i].angle = 3 * Math.PI - rays[i].angle;
            }
        }

        rays.sort((a, b) => a.angle - b.angle);

        this.drawVisibilityPolygon(ctx, visibleTiles, rays, tileWidth, tileHeight);
    }

    drawVisibilityPolygon(ctx, visibleTiles, rays, tileWidth, tileHeight) {
        ctx.beginPath();

        const rayPos = {x: this.x + this.w / 2, y: this.y + this.h / 2};
        const rayDrawPosition = this.drawRelativeTo(rayPos, visibleTiles);
        ctx.moveTo(rayDrawPosition.x * tileWidth, rayDrawPosition.y * tileHeight);

        for (let i = 0; i < rays.length; i++) {
            const intersectionDrawPosition = this.drawRelativeTo({x: rays[i].intersection.x, y: rays[i].intersection.y}, visibleTiles);
            ctx.lineTo(intersectionDrawPosition.x * tileWidth, intersectionDrawPosition.y * tileHeight);
        }

        if (this.fieldOfViewRadians >= 360) {
            // connect last ray to first ray
            const intersectionDrawPosition = this.drawRelativeTo({x: rays[0].intersection.x, y: rays[0].intersection.y}, visibleTiles);
            ctx.lineTo(intersectionDrawPosition.x * tileWidth, intersectionDrawPosition.y * tileHeight);
        }
        ctx.closePath();
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }

    drawGun(ctx, visibleTiles, mouseAngle, tileWidth, tileHeight) {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'gray';
        ctx.moveTo(visibleTiles / 2 * tileWidth, visibleTiles / 2 * tileHeight);
        ctx.lineTo((visibleTiles / 2 + Math.sin(mouseAngle) * this.gunLength) * tileWidth, (visibleTiles / 2 + Math.cos(mouseAngle) * this.gunLength) * tileHeight);
        ctx.stroke();
    }

    // draw the player
    draw(ctx, visibleTiles, tileWidth, tileHeight) {
        const offsetX = visibleTiles / 2 - this.w / 2;
        const offsetY = visibleTiles / 2 - this.h / 2;
        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.fillRect(offsetX * tileWidth, offsetY * tileHeight, this.w * tileWidth, this.h * tileHeight);
        ctx.stroke();
    }
}