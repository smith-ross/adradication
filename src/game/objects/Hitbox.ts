import { draw } from "../../util/DrawUtil";
import Color from "../types/Color";
import GameObject from "../types/GameObject";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";
import Vector from "../types/Vector";
import Box from "./Box";

interface HitboxProps extends ImplementedRenderableObjectProps {
  showVisual?: boolean;
}

export default class Hitbox extends RenderableGameObject {
  constructor(hitboxProps: HitboxProps) {
    super({
      ...hitboxProps,
      className: "Hitbox",
    });

    if (hitboxProps.showVisual) {
      this.addChild(
        new Box({
          id: "HitboxVisualBox",
          size: this.size,
          color: Color.random(),
        })
      );
    }
  }

  onUpdate(_: number) {
    const child = this.getChild("HitboxVisualBox");
    if (child) child.size = this.size;
  }

  intersectsWith(collidingHitbox: Hitbox) {
    const [thisX, thisY] = this.getWorldPosition().asCoords();
    const [otherX, otherY] = collidingHitbox.getWorldPosition().asCoords();
    const [thisW, thisH] = this.size.asCoords();
    const [otherW, otherH] = collidingHitbox.size.asCoords();
    return !(
      thisX + thisW < otherX ||
      otherX + otherW < thisX ||
      thisY + thisH < otherY ||
      otherY + otherH < thisY
    );
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
