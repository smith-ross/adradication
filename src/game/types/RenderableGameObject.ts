import Color from "./Color";
import GameObject, {
  GameObjectProps,
  ImplementedObjectProps,
} from "./GameObject";
import { IRenderable } from "./interfaces/IRenderable";

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

  recursiveRender(context: CanvasRenderingContext2D, deltaTime: number) {
    this.render(context, deltaTime);
    for (const child of this.children) {
      if (child instanceof RenderableGameObject) {
        child.recursiveRender(context, deltaTime);
      }
    }
  }

  abstract render(context: CanvasRenderingContext2D, deltaTime: number): void;
}
