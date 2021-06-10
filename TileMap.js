class TileMap {
    constructor() {
        this.mapWidth = 15;
        this.mapHeight = 15;
        this.array = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        this.boundaries = [];
        this.corners = [];

        this.generateBoundaries();
    }   
    
    generateBoundaries() {
        const NORTH = 0;
        const SOUTH = 1;
        const EAST = 2;
        const WEST = 3;

        const cells = new Array(this.mapHeight);
        for (let y = 0; y < this.mapHeight; y++) {
            cells[y] = new Array(this.mapWidth);
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.array[y][x] == 1) {
                    // wall
                    const c = {hasEdges: [], edgeIDs: []}; // N S E W
                    for (let i = 0; i < 4; i++) 
                        c.hasEdges[i] = false;
                    if (y > 0 && this.array[y - 1][x] == 0)
                        c.hasEdges[NORTH] = true;
                    if (y < this.mapHeight - 1 && this.array[y + 1][x] == 0)
                        c.hasEdges[SOUTH] = true;
                    if (x < this.mapWidth - 1 && this.array[y][x + 1] == 0)
                        c.hasEdges[EAST] = true;
                    if (x > 0 && this.array[y][x - 1] == 0)
                        c.hasEdges[WEST] = true;
                    cells[y][x] = c;
                }
            }
        }

        const edges = [];
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (cells[y][x] == null) // non-wall
                    continue;
                if (cells[y][x].hasEdges[NORTH]) {
                    // needs a northern edge
                    if (cells[y][x - 1] && cells[y][x - 1].hasEdges[NORTH]) {
                        // extend the edge
                        const edgeID = cells[y][x - 1].edgeIDs[NORTH];
                        cells[y][x].edgeIDs[NORTH] = edgeID;
                        edges[edgeID].x2 += 1;
                    }
                    else {
                        // create a new edge
                        const newEdge = {x1: x, y1: y, x2: x + 1, y2: y};
                        edges.push(newEdge);
                        const index = edges.length - 1;
                        cells[y][x].edgeIDs[NORTH] = index;
                    }
                }
                if (cells[y][x].hasEdges[SOUTH]) {
                    if (cells[y][x - 1] && cells[y][x - 1].hasEdges[SOUTH]) {
                        const edgeID = cells[y][x - 1].edgeIDs[SOUTH];
                        cells[y][x].edgeIDs[SOUTH] = edgeID;
                        edges[edgeID].x2 += 1;
                    }
                    else {
                        const newEdge = {x1: x, y1: y + 1, x2: x + 1, y2: y + 1};
                        edges.push(newEdge);
                        const index = edges.length - 1;
                        cells[y][x].edgeIDs[SOUTH] = index;
                    }
                }
                if (cells[y][x].hasEdges[EAST]) {                    
                    if (cells[y - 1] && cells[y-1][x] && cells[y - 1][x].hasEdges[EAST]) {
                        const edgeID = cells[y - 1][x].edgeIDs[EAST];
                        cells[y][x].edgeIDs[EAST] = edgeID;
                        edges[edgeID].y2 += 1;
                    }
                    else {
                        const newEdge = {x1: x + 1, y1: y, x2: x + 1, y2: y + 1};
                        edges.push(newEdge);
                        const index = edges.length - 1;
                        cells[y][x].edgeIDs[EAST] = index;
                    }
                }
                if (cells[y][x].hasEdges[WEST]) {
                    if (cells[y - 1] && cells[y-1][x] && cells[y - 1][x].hasEdges[WEST]) {
                        const edgeID = cells[y - 1][x].edgeIDs[WEST];
                        cells[y][x].edgeIDs[WEST] = edgeID;
                        edges[edgeID].y2 += 1;
                    }
                    else {
                        const newEdge = {x1: x, y1: y, x2: x, y2: y + 1};
                        edges.push(newEdge);
                        const index = edges.length - 1;
                        cells[y][x].edgeIDs[WEST] = index;
                    }
                }
            }
        }
        
        // get corners array from edges
        this.boundaries = edges;

        // add the top, right, left and bottom boundaries covering the edge of the map
        this.boundaries.push({x1: 0, y1: 0, x2: this.mapWidth, y2: 0});
        this.boundaries.push({x1: 0, y1: this.mapHeight, x2: this.mapWidth, y2: this.mapHeight});
        this.boundaries.push({x1: 0, y1: 0, x2: 0, y2: this.mapHeight});
        this.boundaries.push({x1: this.mapWidth, y1: 0, x2: this.mapWidth, y2: this.mapHeight});

        const cornerMap = new Map();

        for (let i = 0; i < this.boundaries.length; i++) {
            const pos1 = {x: this.boundaries[i].x1, y: this.boundaries[i].y1};
            if (!cornerMap.has(pos1)) {
                cornerMap.set(pos1, true);
                this.corners.push(pos1);
            }

            const pos2 = {x: this.boundaries[i].x2, y: this.boundaries[i].y2};
            if (!cornerMap.has(pos2)) {
                cornerMap.set(pos2, true);
                this.corners.push(pos2);
            }

        }
    }

    generateBoundariesBad() {

        // create an array of all wall positions and boundary objects
        this.walls = [];
        this.boundaries = [];

        // add the top, right, left and bottom boundaries covering the edge of the map
        this.boundaries.push({x1: 0, y1: 0, x2: this.mapWidth, y2: 0});
        this.boundaries.push({x1: 0, y1: this.mapHeight, x2: this.mapWidth, y2: this.mapHeight});
        this.boundaries.push({x1: 0, y1: 0, x2: 0, y2: this.mapHeight});
        this.boundaries.push({x1: this.mapWidth, y1: 0, x2: this.mapWidth, y2: this.mapHeight});

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.array[y][x] == 1) {
                    this.walls.push({x: x, y: y});
                    this.boundaries.push({x1: x, y1: y, x2: x + 1, y2: y});           // top
                    this.boundaries.push({x1: x, y1: y + 1, x2: x + 1, y2: y + 1});   // bottom
                    this.boundaries.push({x1: x, y1: y, x2: x, y2: y + 1});           // left
                    this.boundaries.push({x1: x + 1, y1: y, x2: x + 1, y2: y + 1});   // right
                }
            }
        }

        // create an array containing all the corners of every wall
        this.corners = [];
        const cornerMap = new Map();

        for (let i = 0; i < this.boundaries.length; i++) {
            const pos1 = {x: this.boundaries[i].x1, y: this.boundaries[i].y1};
            if (!cornerMap.has(pos1)) {
                cornerMap.set(pos1, true);
                this.corners.push(pos1);
            }

            const pos2 = {x: this.boundaries[i].x2, y: this.boundaries[i].y2};
            if (!cornerMap.has(pos2)) {
                cornerMap.set(pos2, true);
                this.corners.push(pos2);
            }

        }

    }

    getTile(x, y) {
        if (this.array[y] == undefined) 
            return null;
        return this.array[y][x];
    }
    
    drawWalls(ctx, visibleTiles, player) {
        const offsetX = player.x + player.w / 2 - visibleTiles / 2;
        const offsetY = player.y + player.h / 2 - visibleTiles / 2;
        const playerOffsetX = player.x - Math.floor(player.x);
        const playerOffsetY = player.y - Math.floor(player.y);
    
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'orange';
    
        for (let x = 0; x < visibleTiles + 1; x++) {
            for (let y = 0; y < visibleTiles + 1; y++) {
                const tile = this.getTile(Math.floor(x + offsetX), Math.floor(y + offsetY));
                if (tile == 1) {
                    // draw wall
                    ctx.fillRect((x - playerOffsetX) * tileWidth, (y - playerOffsetY) * tileHeight, tileWidth, tileHeight);
                } 
            }
        }
    }

    drawOuterBounds(ctx, visibleTiles, player, tileWidth, tileHeight) {
        const canvasWidth = visibleTiles * tileWidth;
        const canvasHeight = visibleTiles * tileHeight;

        const cameraLeftX = player.x + player.w / 2 - visibleTiles / 2;
        const cameraRightX = player.x + player.w / 2 + visibleTiles / 2;
        if (cameraLeftX < 0) {
            ctx.fillRect(0, 0, -cameraLeftX * tileWidth, canvasHeight);
        }
        if (cameraRightX > tileMap.mapWidth) {
            ctx.fillRect(canvasWidth - (cameraRightX - tileMap.mapWidth) * tileWidth, 0, (cameraRightX - tileMap.mapWidth) * tileWidth, canvasHeight);
        }

        const cameraTopY = player.y + player.h / 2 - visibleTiles / 2;
        const cameraBottomY = player.y + player.h / 2 + visibleTiles / 2;
        if (cameraTopY < 0) {
            ctx.fillRect(0, 0, canvasWidth, -cameraTopY * tileHeight);
        }
        if (cameraBottomY > tileMap.mapHeight) {
            ctx.fillRect(0, canvasHeight - (cameraBottomY - tileMap.mapHeight) * tileHeight, canvasWidth, (cameraBottomY - tileMap.mapHeight) * tileHeight);
        }

    }

}