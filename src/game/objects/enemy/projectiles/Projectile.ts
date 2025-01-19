import { spawnEffect } from "../../../../util/GameUtil";
import { isDebugMode } from "../../../../util/GeneralUtil";
import Adradication, { GAME_SIZE } from "../../../core/Adradication";
import GameObject from "../../../types/GameObject";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../../types/RenderableGameObject";
import Vector from "../../../types/Vector";
import Hitbox from "../../Hitbox";
import Player from "../../player/Player";
import Adbomination, { EnemyState } from "../Adbomination";
import SporeExplosion from "./SporeExplosion";

export interface ProjectileProps extends ImplementedRenderableObjectProps {
  damage: number;
  direction: Vector;
  speed: number;
  playerRef: Player;
  targets?: Adbomination[];
  spawner?: Adbomination;
}
export default class Projectile extends RenderableGameObject {
  #direction: Vector;
  #speed: number;
  #damage: number;
  #playerRef: Player;
  #targets: Adbomination[];
  playerSpawned: boolean = false;
  spawner: Adbomination | undefined;

  constructor(projectileProps: ProjectileProps) {
    super({
      ...projectileProps,
      className: "Projectile",
      children: [
        ...(projectileProps.children || []),

        new Hitbox({
          id: "ProjectileHitbox",
          size: projectileProps.size,
          showVisual: isDebugMode(),
        }),
      ],
    });
    this.#direction = projectileProps.direction;
    this.#speed = projectileProps.speed;
    this.#damage = projectileProps.damage;
    this.#playerRef = projectileProps.playerRef;
    this.#targets = projectileProps.targets || [];
    this.spawner = projectileProps.spawner;
  }

  invertDirection(newTargets: Adbomination[], newDirection?: Vector) {
    this.#direction = (newDirection || this.#direction.mul(-1)).mul(1.5);
    this.#damage *= 2;
    this.#targets = newTargets;
  }

  onUpdate(deltaTime: number) {
    this.position = this.position.add(
      this.#direction.mul(this.#speed * deltaTime)
    );
    if (
      this.getWorldPosition().x < -this.size.x ||
      this.getWorldPosition().y < -this.size.y ||
      this.getWorldPosition().x > GAME_SIZE.x ||
      this.getWorldPosition().y > GAME_SIZE.y
    ) {
      this.destroy();
    }
    const chosenHitbox = this.getChild("ProjectileHitbox") as Hitbox;
    const target = this.#playerRef;
    if (this.#targets.length === 0 && !this.playerSpawned) {
      if (
        chosenHitbox.intersectsWith(target.getChild("PlayerHurtbox") as Hitbox)
      ) {
        this.destroy();
        this.spawnExplosion();
        target.onHit(this.#damage, this.spawner!);
      }
    } else {
      this.#targets.forEach((enemy) => {
        if (
          chosenHitbox.intersectsWith(
            enemy.getChild("EnemyHurtbox") as Hitbox
          ) &&
          enemy.state !== EnemyState.DEATH
        ) {
          this.destroy();
          this.spawnExplosion();
          enemy.onHit(this.#damage, 0.2);
        }
      });
    }
  }

  spawnExplosion() {
    spawnEffect(
      new SporeExplosion({
        id: "Explosion",
        position: this.getWorldPosition(),
        size: new Vector(32, 32),
      })
    );
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
