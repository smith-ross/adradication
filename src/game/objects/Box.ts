import { draw } from "../../util/DrawUtil";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";

export default class Box extends RenderableGameObject {
  constructor(boxProps: ImplementedRenderableObjectProps) {
    super({
      ...boxProps,
      className: "Box",
    });
  }

  render(context: CanvasRenderingContext2D) {
    draw(context, this.position, this.size, "Box", this.color);
  }
}
