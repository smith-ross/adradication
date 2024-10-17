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

  onUpdate(deltaTime: number): void {
    console.log("Box update");
    this.color = new Color(
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    );
  }

  render(context: CanvasRenderingContext2D) {
    console.log("Rendering Box");
    draw(context, this.position, this.size, "Box", this.color);
  }
}
