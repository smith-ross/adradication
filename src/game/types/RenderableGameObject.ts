import Color from "./Color";
import GameObject, {
  GameObjectProps,
  ImplementedObjectProps,
} from "./GameObject";
import { IRenderable } from "./interfaces/IRenderable";
import Vector from "./Vector";

export enum Corner {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

export interface RenderableGameObjectProps extends GameObjectProps {
  color?: Color;
}
export interface ImplementedRenderableObjectProps
  extends ImplementedObjectProps {
  color?: Color;
}

export default abstract class RenderableGameObject
  extends GameObject
  implements IRenderable
{
  #color: Color;

  constructor(renderableGameObjectProps: RenderableGameObjectProps) {
    super(renderableGameObjectProps);
    this.#color = renderableGameObjectProps.color || new Color();
  }

  get color() {
    return this.#color;
  }

  set color(newColor: Color) {
    this.#color = newColor;
  }

  getCornerWorldPosition(corner: Corner) {
    switch (corner) {
      case Corner.TOP_LEFT:
        return this.position;
      case Corner.TOP_RIGHT:
        return this.position.add(new Vector(this.size.x, 0));
      case Corner.BOTTOM_LEFT:
        return this.position.add(new Vector(0, this.size.y));
      case Corner.BOTTOM_RIGHT:
        return this.position.add(new Vector(this.size.x, this.size.y));
    }
  }

  recursiveRender(context: CanvasRenderingContext2D, deltaTime: number) {
    this.render(context, deltaTime);
    for (const child of this.children) {
      if (child instanceof RenderableGameObject) {
        child.recursiveRender(context, deltaTime);
      }
    }
  }

  // Triggered after onUpdate is complete on every component
  abstract render(context: CanvasRenderingContext2D, deltaTime: number): void;
}
