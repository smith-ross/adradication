import { draw } from "../../util/DrawUtil";
import Color from "../types/Color";
import GameObject from "../types/GameObject";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";

export default class Hitbox extends GameObject {
  constructor(hitboxProps: ImplementedRenderableObjectProps) {
    super({
      ...hitboxProps,
      className: "Hitbox",
    });
  }

  intersectsWith(collidingHitbox: Hitbox) {
    const [thisX, thisY] = this.getWorldPosition().asCoords();
    const [otherX, otherY] = collidingHitbox.getWorldPosition().asCoords();
    const [thisW, thisH] = this.size.asCoords();
    const [otherW, otherH] = collidingHitbox.size.asCoords();
    return (
      thisX + thisW < otherX ||
      otherX + otherW < thisX ||
      thisY + thisH < otherY ||
      otherY + otherH < thisY
    );
  }
}
