import * as GraphicsAPI from "../graphicsAPI";
import { IEntity } from "../entity";
import { IDisplayComponent } from "../systems/displaySystem";
import { Component } from "./component";
import { SpriteComponent } from "./spriteComponent";
import { TextureComponent } from "./textureComponent";

let GL: WebGLRenderingContext;

// # Classe *LayerComponent*
// Ce composant représente un ensemble de sprites qui
// doivent normalement être considérées comme étant sur un
// même plan.
export class LayerComponent extends Component<object> implements IDisplayComponent {
  // ## Méthode *display*
  // La méthode *display* est appelée une fois par itération
  // de la boucle de jeu.
  public display(dT: number) {
    const layerSprites = this.listSprites();    
    if (layerSprites.length === 0) {
      return;
    }

    const nbVerticesPerSprite = 4;
    const spriteVerticesSize = nbVerticesPerSprite * TextureComponent.vertexSize;

    var listVertices = new Float32Array(layerSprites.length * spriteVerticesSize);
    var listIndices = new Uint16Array(layerSprites.length * 6);

    // Pour chaque sprite
    for(var i = 0; i < layerSprites.length; i++) {
      // Pour chaque float des vertices du sprite (position 3d et coordonnées de texture)
      for(var j = 0; j < spriteVerticesSize; j++) {
        listVertices[i * spriteVerticesSize + j] = layerSprites[i].vertices[j];
      }

      // Pour chaque indice du sprite
      for(var k = 0; k < layerSprites[i].indices.length; k++) {
        listIndices[i * layerSprites[i].indices.length + k] = layerSprites[i].indices[k] + i * nbVerticesPerSprite;
      }
    }

    const spriteSheet = layerSprites[0].spriteSheet;

    var vertexBuffer: WebGLBuffer;
    var indexBuffer: WebGLBuffer;
    GL = GraphicsAPI.context;

    vertexBuffer = GL.createBuffer()!;
    indexBuffer = GL.createBuffer()!;


    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);

    GL.bufferData(GL.ARRAY_BUFFER, listVertices, GL.DYNAMIC_DRAW);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, listIndices, GL.DYNAMIC_DRAW);

    spriteSheet.bind();

    GL.drawElements(GL.TRIANGLES, listIndices.length, GL.UNSIGNED_SHORT, 0);

    spriteSheet.unbind();
    
  }

  // ## Fonction *listSprites*
  // Cette fonction retourne une liste comportant l'ensemble
  // des sprites de l'objet courant et de ses enfants.
  private listSprites() {
    const sprites: SpriteComponent[] = [];

    const queue: IEntity[] = [this.owner];
    while (queue.length > 0) {
      const node = queue.shift() as IEntity;
      for (const child of node.children) {
        if (child.active) {
          queue.push(child);
        }
      }

      for (const comp of node.components) {
        if (comp instanceof SpriteComponent && comp.enabled) {
          sprites.push(comp);
        }
      }
    }

    return sprites;
  }
}
