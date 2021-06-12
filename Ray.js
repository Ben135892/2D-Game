class Ray {
    constructor(pos, dir) {
        this.pos = pos;
        this.dir = dir
    }

    cast(wall) {
        const x1 = this.pos.x;
        const y1 = this.pos.y;
        const x2 = this.pos.x + this.dir.x;
        const y2 = this.pos.y + this.dir.y;

        const x3 = wall.x1;
        const y3 = wall.y1;
        const x4 = wall.x2;
        const y4 = wall.y2;

        const denom = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);

        if (denom == 0) {
            return null; // parallel
        }

        const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / denom;
        const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / denom;
    
        if (t > 0 && u > 0 && u < 1) {
            const intersectionX = x1 + t * (x2 - x1);
            const intersectionY = y1 + t * (y2 - y1);
            return {x: intersectionX, y: intersectionY};            
        }
        return null;
    }

    castWalls(boundaries) {
        let smallestDistance;
        let closestIntersection = null;

        for (let i = 0; i < boundaries.length; i++) {
            const intersection = this.cast(boundaries[i]);
            if (intersection == null) // no intersection
                continue;

            const distanceSquared = Math.pow(intersection.x - this.pos.x, 2) + Math.pow(intersection.y - this.pos.y, 2);
            if (smallestDistance == undefined || distanceSquared < smallestDistance) {
                smallestDistance = distanceSquared;
                closestIntersection = intersection;
            }
        } 
        return closestIntersection;
    }
}