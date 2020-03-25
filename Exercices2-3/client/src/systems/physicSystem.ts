import { ColliderComponent } from "../components/colliderComponent";
import { QuadTree } from "../components/quadtree";
import { Scene } from "../scene";
import { ISystem } from "./system";
import { Rectangle } from "../components/rectangle";

// # Classe *PhysicSystem*
// Représente le système permettant de détecter les collisions
export class PhysicSystem implements ISystem {
  public quadtree: QuadTree = new QuadTree();
  // Méthode *iterate*
  // Appelée à chaque tour de la boucle de jeu
  public iterate(dT: number) {
    const colliders: ColliderComponent[] = [];

    this.quadtree.clear();

    for (const e of Scene.current.entities()) {
      for (const comp of e.components) {
        if (comp instanceof ColliderComponent && comp.enabled) {
          colliders.push(comp);
          this.quadtree.insert(comp);
        }
      }
    }

    const collisions: Array<[ColliderComponent, ColliderComponent]> = [];

    for (let i = 0; i < colliders.length; i++) {
      const c1 = colliders[i];
      if (!c1.enabled || !c1.owner.active) {
        continue;
      }
      
      const neighbours = this.quadtree.getNeighbours(colliders[i]);
      for (let j = 0; j < neighbours.length; j++) {
        const c2 = neighbours[j];
        if (!c2.enabled || !c2.owner.active) {
          continue;
        }

        // Check the collider flag with the mask of the other
        if ((c1.flag & c2.mask) == 0) {
          continue;
        }

        if (c1.area.intersectsWith(c2.area)) {
          collisions.push([c1, c2]);
        }
      }
    }

    for (const [c1, c2] of collisions) {
      if (c1.handler) {
        c1.handler.onCollision(c2);
      }
      if (c2.handler) {
        c2.handler.onCollision(c1);
      }
    }
  }
}
