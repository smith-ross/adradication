import { draw } from "../../util/DrawUtil";
import Color from "../types/Color";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";

export default class Empty extends RenderableGameObject {
  constructor(emptyProps: ImplementedRenderableObjectProps) {
    super({
      ...emptyProps,
      className: "Empty",
    });
  }

  render(context: CanvasRenderingContext2D) {}
}
