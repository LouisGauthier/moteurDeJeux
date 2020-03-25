import { Rectangle } from "./rectangle";
import { ColliderComponent } from "./colliderComponent";
import { PositionComponent } from "./positionComponent";

export class QuadTree {
    static maxCapacity: number = 4;

    rectangle: Rectangle;

    colliders: ColliderComponent[] = [];

    northWest?: QuadTree;
    northEast?: QuadTree;
    southWest?: QuadTree;
    southEast?: QuadTree;

    public constructor(rectangle?: Rectangle) {
        this.rectangle = rectangle || new Rectangle({x: 200, y: 0, width: 768, height: 576});
    }

    

    public insert(collider: ColliderComponent): boolean {
        if (!this.rectangle) {
            return false;
        }

        // Get the position of the owner of the collider component
        const position = collider.owner.getComponent<PositionComponent>("Position").worldPosition;

        // Check if the object is really inside this quadtree
        if (!this.rectangle.contains(position)) {
            return false;
        }
        
        // If there's enough space in this node and there isn't any subdivisions
        if (this.colliders.length < QuadTree.maxCapacity && !this.northWest) {
            this.colliders.push(collider);
            return true;
        }

        // Subdivide the node if there isn't any subdivisions
        if (!this.northWest) {
            this.subdivide();
        }

        // Try inserting the collider inside the subdivisions
        if (this.northWest && this.northWest.insert(collider)) {
            return true;
        }
        if (this.northEast && this.northEast.insert(collider)) {
            return true;
        }
        if (this.southWest && this.southWest.insert(collider)) {
            return true;
        }
        if (this.southEast && this.southEast.insert(collider)) {
            return true;
        }

        return false;
    }

    public subdivide() {
        const quadCenter = this.rectangle.getCenter();

        this.northWest = new QuadTree(new Rectangle({xMin: this.rectangle.xMin,
            xMax: quadCenter[0],
            yMin: quadCenter[1],
            yMax: this.rectangle.yMax}));
        
        this.northEast = new QuadTree(new Rectangle({xMin: quadCenter[0],
            xMax: this.rectangle.xMax,
            yMin: quadCenter[1],
            yMax: this.rectangle.yMax}));

        this.southWest = new QuadTree(new Rectangle({xMin: this.rectangle.xMin,
            xMax: quadCenter[0],
            yMin: this.rectangle.yMin,
            yMax: quadCenter[1]}));

        this.southEast = new QuadTree(new Rectangle({xMin: quadCenter[0],
            xMax: this.rectangle.xMax,
            yMin: this.rectangle.yMin,
            yMax: quadCenter[1]}));
        
        for(let i = 0; i < this.colliders.length; i++) {
            if (this.northWest.insert(this.colliders[i])) {
                continue;
            }
            if (this.northEast.insert(this.colliders[i])) {
                continue;
            }
            if (this.southWest.insert(this.colliders[i])) {
                continue;
            }
            if (this.southEast.insert(this.colliders[i])) {
                continue;
            }
        }
        this.colliders = [];
    }

    public getNeighbours(collider: ColliderComponent, size: number = 50): ColliderComponent[] {
        const position = collider.owner.getComponent<PositionComponent>("Position").worldPosition;
        return this.getElementsInArea(
            new Rectangle({x: position[0], 
                            y: position[1], 
                            height: size, 
                            width: size}));
    }

    public getElementsInArea(area: Rectangle): ColliderComponent[] {
        var result: ColliderComponent[] = [];

        // Check if the area intersects with the quadtree
        if (!this.rectangle.intersectsWith(area)) {
            return result;
        }

        for(let i = 0; i < this.colliders.length; i++) {
            const colliderPos = this.colliders[i].owner.getComponent<PositionComponent>("Position").worldPosition;

            if (area.contains(colliderPos)) {
                result.push(this.colliders[i]);
            }
        }

        if (this.northWest) {
            result = result.concat(this.northWest.getElementsInArea(area));
        }
        if (this.northEast) {
            result = result.concat(this.northEast.getElementsInArea(area));
        }
        if (this.southWest) {
            result = result.concat(this.southWest.getElementsInArea(area));
        }
        if (this.southEast) {
            result = result.concat(this.southEast.getElementsInArea(area));
        }

        return result;
    }

    public clear() {
        this.colliders = [];
        this.northWest && this.northWest.clear();
        this.northWest = undefined;
        this.northEast && this.northEast.clear();
        this.northEast = undefined;
        this.southWest && this.southWest.clear();
        this.southWest = undefined;
        this.southEast && this.southEast.clear();
        this.southEast = undefined;
    }
} 