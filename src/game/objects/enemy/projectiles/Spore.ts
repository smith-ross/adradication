import Color from "../../../types/Color";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../../types/RenderableGameObject";
import Vector from "../../../types/Vector";
import Box from "../../Box";
import Sprite from "../../Sprite";
import Projectile, { ProjectileProps } from "./Projectile";

export default class Spore extends Projectile {
  constructor(sporeProps: ProjectileProps) {
    super({
      ...sporeProps,
      children: [
        ...(sporeProps.children || []),
        new Sprite({
          id: "Projectile",
          size: new Vector(20, 20),
          imagePath: "res/enemy-sprites/Sponspore/Projectile.png",
        }),
      ],
    });
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
