class HumanPlayer {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.canHeal;
        this.healInterval;
        this.healTime = 5000; // can heal if not attacked for 5 seconds

        this.maxVel = 0.06;
        this.minVel = 0.04; 
        // colliding velocities
        this.maxDiagonalVel = 0.05;
        this.minDiagonalVel = 0.035;
        this.vel = this.maxVel;
        this.diagonalVel = this.maxDiagonalVel;

        this.maxAmmo = 10;
        this.ammo = this.maxAmmo;
        this.canShoot = true;
        this.reloadTime = 750;    // in ms
        this.fireInterval = 200;  // in ms
 
        this.fieldOfView = 360;  // in degrees, can't be in between 180 and 360
        this.fieldOfViewRadians = toRadians(this.fieldOfView);
        this.gunLength = 0.5;
        this.bullets = [];
        this.kills = 0;

        document.getElementById('ammo').innerText = this.ammo;
        document.getElementById('current-health').style = 'width: ' + this.healthPercent() + '%';
        document.getElementById('kills').innerText = this.kills;
    }

    healthPercent() {
        return this.health / this.maxHealth * 100;
    }

    heal() {
        this.healInterval = setInterval(() => {
             if (this.health < this.maxHealth) {
                this.health++;
                document.getElementById('current-health').style = 'width: ' + this.healthPercent() + '%';
             }
        }, this.healTime);
    }

    moveRight(tileMap) {
        this.x += this.vel;
        if (this.x + this.w >= tileMap.mapWidth || 
            tileMap.array[Math.floor(this.y)][Math.floor(this.x + this.w)] == 1 || 
            tileMap.array[Math.floor(this.y + this.h * 0.999)][Math.floor(this.x + this.w)] == 1) {
            this.x = Math.floor(this.x + this.w) - this.w;
        }
    }

    moveLeft(tileMap) {
        this.x -= this.vel;
        if (this.x < 0 || 
            tileMap.array[Math.floor(this.y)][Math.floor(this.x)] == 1 || 
            tileMap.array[Math.floor(this.y + this.h * 0.999)][Math.floor(this.x)] == 1) {
            this.x = Math.floor(this.x) + 1;
        }
    }

    moveUp(tileMap) {
        this.y -= this.vel;
        if (this.y < 0 || 
            tileMap.array[Math.floor(this.y)][Math.floor(this.x)] == 1 || 
            tileMap.array[Math.floor(this.y)][Math.floor(this.x + this.w * 0.999)] == 1) {
            this.y = Math.floor(this.y) + 1;
        }
    }

    moveDown(tileMap) {
        this.y += this.vel;
        if (this.y + this.h >= tileMap.mapHeight ||
            tileMap.array[Math.floor(this.y + this.h)][Math.floor(this.x)] == 1 || 
            tileMap.array[Math.floor(this.y + this.h)][Math.floor(this.x + this.w * 0.999)] == 1) {
            this.y = Math.floor(this.y + this.h) - this.h;
        }
    }

    roundCoords() {
        this.x = roundTo2DP(this.x);
        this.y = roundTo2DP(this.y);
    }

    shootBullet(angle) {
        if (this.canShoot) {
            this.canShoot = false;
            this.ammo--;
            document.getElementById('ammo').innerText = this.ammo;
            if (this.ammo <= 0) { // reload
                setTimeout(() => {
                    if (this) {
                        this.canShoot = true;
                        this.ammo = this.maxAmmo;
                        document.getElementById('ammo').innerText = this.ammo;
                    }
                }, this.reloadTime);
            }
            else {
                setTimeout(() => {
                    if (this)
                        this.canShoot = true
                }, this.fireInterval);
            }
            const bulletPos = {x: this.x + this.w / 2, y: this.y + this.h / 2};
            this.bullets.push(new Bullet(bulletPos, angle));
        }
    }

    updateBullets(enemies, tileMap) {
        for (let i = 0; i < this.bullets.length;) {
            // check for collisions with wall or enemy
            if (this.bullets[i].isCollidingWithWall(tileMap)) {
                this.bullets.splice(i, 1);
                continue;
            } 
            // check for collisions with enemies
            let collided = false;
            for (let j = 0; j < enemies.length; j++) {
                if (this.bullets[i].isCollidingWithEnemy(enemies[j])) {
                    this.bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    this.kills++;
                    document.getElementById('kills').innerText = this.kills;
                    collided = true;
                    break;
                }
            }
            if (collided) {
                continue;
            }
            this.bullets[i].update();
            i++;
        }
    }

    // finds the canvas coordinates of where to draw a point, relative to the player
    drawRelativeTo(pos, visibleTiles) {
        const offsetX = (visibleTiles / 2 - this.w / 2) + (pos.x - this.x);
        const offsetY = (visibleTiles / 2 - this.h / 2) + (pos.y - this.y);
        return {x: offsetX, y: offsetY};
    }

    look(ctx, tileMap, mouseAngle, tileWidth, tileHeight) {
        // method used to cast shadows
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
        
        rays.push({angle: leftRayAngle, intersection: leftRay.castWalls(tileMap.boundaries)});
        rays.push({angle: rightRayAngle, intersection: rightRay.castWalls(tileMap.boundaries)});

        // cast a ray to each corner of every wall, along with two more rays with angle +- 0.00001 radians
        for (let i = 0; i < tileMap.corners.length; i++) {
            const rayDirectionX = tileMap.corners[i].x - rayPos.x;
            const rayDirectionY = tileMap.corners[i].y - rayPos.y;
            
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
                const intersection = ray.castWalls(tileMap.boundaries);
                    
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

        this.drawVisibilityPolygon(ctx, tileMap.visibleTiles, rays, tileWidth, tileHeight);
    }

    drawVisibilityPolygon(ctx, visibleTiles, rays, tileWidth, tileHeight) {
        ctx.beginPath();

        const rayPos = {x: this.x + this.w / 2, y: this.y + this.h / 2};
        const rayDrawPosition = this.drawRelativeTo(rayPos, visibleTiles);
        ctx.moveTo(rayDrawPosition.x * tileWidth, rayDrawPosition.y * tileHeight);

        for (let i = 0; i < rays.length; i++) {
            if (rays[i].intersection == null)
                continue;
            const intersectionDrawPosition = this.drawRelativeTo({x: rays[i].intersection.x, y: rays[i].intersection.y}, visibleTiles);
            ctx.lineTo(intersectionDrawPosition.x * tileWidth, intersectionDrawPosition.y * tileHeight);
        }

        if (this.fieldOfView >= 360 && rays[0].intersection != null) {
            // connect last ray to first ray
            const intersectionDrawPosition = this.drawRelativeTo({x: rays[0].intersection.x, y: rays[0].intersection.y}, visibleTiles);
            ctx.lineTo(intersectionDrawPosition.x * tileWidth, intersectionDrawPosition.y * tileHeight);
        }

        ctx.closePath();
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }

    drawBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].drawRelativeTo(ctx, tileMap.visibleTiles, this, tileWidth, tileHeight);
        }
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
    draw(ctx, visibleTiles, mouseAngle, tileWidth, tileHeight) {
        const offsetX = visibleTiles / 2 - this.w / 2;
        const offsetY = visibleTiles / 2 - this.h / 2;
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.fillRect(offsetX * tileWidth, offsetY * tileHeight, this.w * tileWidth, this.h * tileHeight);
        ctx.stroke();
        this.drawGun(ctx, visibleTiles, mouseAngle, tileWidth, tileHeight);
    }
}