// class responsible for spawning enemies if game has started
class Game {
    constructor() {
        this.started = false;
        this.intervalHandler;

        this.spawnInterval = 1000;
        this.intervalDecrease = 20;
        this.spawnRandomness = 500;
        this.minSpawnInterval = 50;

        this.maxEnemies = 30;
        this.vel = 0.02;
        this.maxVel = 0.045;
        this.velRand = 0.005;
        this.velIncrease = (this.maxVel - this.vel) / 100; // enemies will reach max velocity after 100 have spawned

        this.width = 0.3;
        this.widthRand = 0.5;
    }

    spawnEnemy(enemies, player, tileMap) { 
        if (enemies.length >= this.maxEnemies)
            return;
        let x, y;
        while (true) {
            x = Math.floor(Math.random() * tileMap.mapWidth);
            y = Math.floor(Math.random() * tileMap.mapHeight);

            // don't spawn enemy on a wall
            if (tileMap.array[y][x] == 1)
                continue;

            // spawn enemy a certain distance away from player
            if (Math.abs(player.x + player.w / 2 - x) < tileMap.visibleTiles / 2 ||
                Math.abs(player.y + player.h / 2 - y) < tileMap.visibleTiles / 2)
                continue;

            const width = this.width + Math.random() * this.widthRand;
            const enemy = new Enemy(x, y, width, width);
            let vel = this.vel;
            if (vel > this.maxVel)
                vel = this.maxVel

            vel += Math.random() * this.velRand;
            enemy.vel = vel;
            enemies.push(enemy);
            break;
        }

        this.vel += this.velIncrease;
        this.spawnInterval -= this.intervalDecrease;
        if (this.spawnInterval < this.minSpawnInterval)
            this.spawnInterval = this.minSpawnInterval;

        this.intervalHandler = setInterval(() => this.spawnEnemy(enemies, player, tileMap), this.spawnInterval + Math.random() * this.spawnRandomness);
    }

    init(enemies, player, tileMap) {
        this.started = true;
        this.spawnEnemy(enemies, player, tileMap);
    }

    finish() {
        this.started = false;
        clearInterval(this.intervalHandler);
    }
}