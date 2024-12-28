import { spawnEffect } from "../../../../../util/GameUtil";
import Vector from "../../../../types/Vector";
import AnimatedSprite from "../../../AnimatedSprite";
import Projectile, {
  ProjectileProps,
} from "../../../enemy/projectiles/Projectile";
import FireballExplosion from "./FireballExplosion";

export default class Fireball extends Projectile {
  constructor(fireballProps: ProjectileProps) {
    super({
      ...fireballProps,
      children: [
        ...(fireballProps.children || []),
        new AnimatedSprite({
          id: "Projectile",
          size: new Vector(64, 64),
          origin: new Vector(32, 32),
          position: new Vector(16, 16),
          cellSize: new Vector(32, 32),
          dimensions: new Vector(3, 1),
          timeBetweenFrames: 0.08,
          sheetPath: `res/upgrades/res/FireballProjectile${
            fireballProps.direction.x === 1 ? "Reversed" : ""
          }.png`,
        }),
      ],
    });
  }

  spawnExplosion() {
    spawnEffect(
      new FireballExplosion({
        id: "Explosion",
        position: this.getWorldPosition(),
        size: new Vector(64, 64),
      })
    );
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
