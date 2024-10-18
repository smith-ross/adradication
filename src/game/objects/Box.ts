import { draw } from "../../util/DrawUtil";
import Color from "../types/Color";
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
    draw(context, this.getWorldPosition(), this.size, "Box", this.color);
  }
}
