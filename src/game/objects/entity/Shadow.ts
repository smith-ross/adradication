import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import Sprite from "../Sprite";

export default class Shadow extends RenderableGameObject {
  constructor(shadowProps: ImplementedRenderableObjectProps) {
    super({
      ...shadowProps,
      className: "Shadow",
      children: [
        ...(shadowProps.children || []),
        new Sprite({
          id: "Shadow",
          size: shadowProps.size,
          imagePath: "res/Shadow.png",
        }),
      ],
      position: (shadowProps.position || new Vector()).add(
        new Vector((shadowProps.parent?.size.x || 0) / 2, 0).sub(
          new Vector((shadowProps.size?.x || 0) / 2, 0)
        )
      ),
    });
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
