class AStar {
    constructor(tileMap) {
        this.tileMap = tileMap;
        this.cells = new Array(tileMap.mapHeight);
        for (let y = 0; y < tileMap.mapHeight; y++) {
            this.cells[y] = new Array(tileMap.mapWidth);
            for (let x = 0; x < tileMap.mapWidth; x++) {
                if (tileMap.array[y][x] == 1) // if a wall
                    continue;
                const node = {x: x, y: y, gCost: 999999, hCost: -1, fCost: -1, visited: false, parent: null};
                this.cells[y][x] = node;
            }
        }
    }

    getNeighbours(cell) {
        // no diagonals yet
        const neighbours = [];
        if (cell.x > 0)
            neighbours.push(this.cells[cell.y][cell.x - 1]);
        if (cell.y > 0)
            neighbours.push(this.cells[cell.y - 1][cell.x]);
        if (cell.x + 1 < this.tileMap.mapWidth) 
            neighbours.push(this.cells[cell.y][cell.x + 1]);
        if (cell.y + 1 < this.tileMap.mapHeight)
            neighbours.push(this.cells[cell.y + 1][cell.x]);
        
        // diagonals
        const x = cell.x;
        const y = cell.y;
        if (cell.x > 0 && cell.y > 0 && this.cells[y][x - 1] && this.cells[y - 1][x]) 
            neighbours.push(this.cells[y - 1][x - 1]);
        if (cell.x + 1 < this.tileMap.mapWidth && cell.y > 0 && this.cells[y][x + 1] && this.cells[y - 1][x])
            neighbours.push(this.cells[y - 1][x + 1]);
        if (cell.x > 0 && cell.y + 1 < this.tileMap.mapHeight && this.cells[y][x - 1] && this.cells[y + 1][x])
            neighbours.push(this.cells[y + 1][x - 1]);
        if (cell.x + 1 < this.tileMap.mapWidth && cell.y + 1 < this.tileMap.mapHeight && this.cells[y][x + 1] && this.cells[y + 1][x])
            neighbours.push(this.cells[y + 1][x + 1]);
        
        return neighbours;
    }
    
    heuristic(a, b) {
        return Math.floor(10 * Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
    }

    solve(startPos, endPos) {   
        const start = this.cells[startPos.y][startPos.x];
        start.gCost = 0;

        const open = [];
        open.push(start);

        while (open.length > 0) {
            open.sort((a, b) => {
                if (a.fCost == b.fCost)
                    return a.hCost - b.hCost;
                return a.fCost - b.fCost;
            });

            const current = open.shift();
            current.visited = true;

            if (current.x == endPos.x && current.y == endPos.y) {
                break;
            }

            // for each neighbour of current node
            const neighbours = this.getNeighbours(current);
            for (let i = 0; i < neighbours.length; i++) {
                const neighbour = neighbours[i];
                if (neighbour == null || neighbour.visited)
                    continue;

                const distance = this.heuristic(neighbour.x - current.x, neighbour.y - current.y);
                if (current.gCost + distance < neighbour.gCost) {
                    neighbour.gCost = current.gCost + distance;
                    neighbour.hCost = this.heuristic(endPos.x - neighbour.x, endPos.y - neighbour.y);
                    neighbour.fCost = neighbour.gCost + neighbour.hCost;
                    neighbour.parent = current;

                    if (!open.includes(neighbour))
                        open.push(neighbour);
                }
            }
        }
        return this.reconstructPath(this.cells[endPos.y][endPos.x]);
    }

    reconstructPath(cell) {
        let node = cell;
        const path = [];
        while (node != null) {
            path.push({x: node.x, y: node.y});
            node = node.parent;
        }
        path.reverse();
        return path;
    }
}