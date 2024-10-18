import GameObject, { ImplementedObjectProps } from "../types/GameObject";
import RenderableGameObject from "../types/RenderableGameObject";

interface LayerProps extends ImplementedObjectProps {
  zIndex: number;
}

export default class Layer extends RenderableGameObject {
  zIndex: number;

  constructor({ id, parent, children, position, zIndex = 0 }: LayerProps) {
    super({
      id: id,
      className: "Scene",
      parent: parent,
      children: children,
      position: position,
    });
    this.zIndex = zIndex;
  }

  render(_: CanvasRenderingContext2D) {}
}
