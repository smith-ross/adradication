import { draw } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import Box from "../Box";

export default class Adbomination extends RenderableGameObject {
  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      className: "Adbomination",
      children: [
        ...(enemyProps.children || []),
        new Box({
          id: "TestEnemyBox",
          color: new Color(255, 0, 0),
          size: enemyProps.size,
        }),
      ],
    });
  }

  spawnAtRandomPoint(canvasSize: Vector) {
    this.position = new Vector(
      Math.random() * (canvasSize.x - this.size.x),
      Math.random() * (canvasSize.y - this.size.y)
    );
  }

  render(context: CanvasRenderingContext2D) {}
}
