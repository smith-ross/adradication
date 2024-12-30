import { spawnEffect } from "../../../../../util/GameUtil";
import { isDebugMode } from "../../../../../util/GeneralUtil";
import Adradication from "../../../../core/Adradication";
import InputService from "../../../../services/InputService";
import GameObject from "../../../../types/GameObject";
import Vector from "../../../../types/Vector";
import Adbomination from "../../../enemy/Adbomination";
import Projectile from "../../../enemy/projectiles/Projectile";
import HealthBar from "../../../entity/HealthBar";
import HealEffect from "../../../generic-vfx/HealEffect";
import Hitbox from "../../../Hitbox";
import Timer from "../../../Timer";
import Player from "../../Player";
import Fireball from "../projectiles/Fireball";
import Upgrade, { UpgradeTrigger, UpgradeType } from "../Upgrade";
import FlameSwordEffect from "../vfx/FlameSwordEffect";
import PlaceProxyEffect from "../vfx/PlaceProxyEffect";
import ProxyMarker from "../vfx/ProxyMarker";
import ProxySparkEffect from "../vfx/ProxySparkEffect";
import TeleportProxyEffect from "../vfx/TeleportProxyEffect";

const TELEPORT_COOLDOWN = 0.35;

export default class ReverseProxy extends Upgrade {
  #timer: Timer | undefined;
  #markers: ProxyMarker[] = [];
  #cooldown: boolean = false;
  #player: Player | undefined;
  #keyUp: boolean = true;

  constructor() {
    super({
      upgradeName: "Reverse Proxy",
      upgradeType: UpgradeType.STICKY,
      upgradeIconPath: "res/upgrades/ReverseProxy.png",
      stacks: true,
      upgradeDescription: (
        <>
          Whenever you roll, place a Marker in your original position. Press
          CTRL to immediately teleport back to your most recently placed marker,
          damaging any enemies caught in between.
          <br />
          <b>Stack:</b> Gain an additional Marker to place per stack.
        </>
      ),
    });
  }

  hitCheck(startPosition: Vector, endPosition: Vector, width: number) {
    if (!this.#player) return;
    const hitEnemies: GameObject[] = [];
    const directionVector = endPosition.sub(startPosition);
    const normalizedDirection = directionVector.normalize();
    for (let i = 0; i <= directionVector.magnitude; i++) {
      if (i % 10 !== 0 && i !== directionVector.magnitude) continue;
      const hitboxInstance = new Hitbox({
        id: "temp",
        size: new Vector(width, width),
        origin: new Vector(width, width).div(2),
        position: startPosition.add(normalizedDirection.mul(i)),
        showVisual: isDebugMode(),
      });
      if (isDebugMode())
        Adradication.getGame()
          .loadedScene?.getLayer("Game")
          .addChild(hitboxInstance);
      this.#player.getEnemyContainer().children.forEach((enemy) => {
        const direction = enemy.position
          .add(enemy.size.div(2))
          .sub(hitboxInstance.position)
          .normalize();
        if (enemy.className === "Adbomination") {
          const target = enemy as Adbomination;
          const hitbox = target.getChild("EnemyHurtbox") as Hitbox;
          if (
            !hitEnemies.includes(target) &&
            hitboxInstance.intersectsWith(hitbox)
          ) {
            hitEnemies.push(target);
            spawnEffect(
              new ProxySparkEffect({
                id: "ProxySpark",
                size: new Vector(50, 50),
                position: hitboxInstance.position,
              })
            );
            target.onHit(12, 0.35, {
              duration: 0.15,
              force: 425,
              direction: direction,
            });
          }
        } else if (enemy.className === "Projectile") {
          if (
            hitEnemies.includes(enemy) &&
            hitboxInstance.intersectsWith(
              enemy.getChild("ProjectileHitbox") as Hitbox
            )
          ) {
            hitEnemies.push(enemy);
            spawnEffect(
              new ProxySparkEffect({
                id: "ProxySpark",
                size: new Vector(50, 50),
                position: hitboxInstance.position,
              })
            );
            (enemy as Projectile).invertDirection(
              (
                this.#player?.getEnemyContainer().children as Adbomination[]
              ).filter((enemy) => enemy.className === "Adbomination"),
              direction
            );
          }
        }
      });
    }
  }

  update(deltaTime: number) {
    if (this.#timer) this.#timer.service(deltaTime);
    if (!InputService.isKeyDown("Control")) this.#keyUp = true;
    if (this.#cooldown || !this.#player || !this.#keyUp) return;
    if (InputService.isKeyDown("Control") && this.#markers.length > 0) {
      const startPos = this.#player
        .getWorldPosition()
        .add(this.#player.size.div(2));
      this.cooldown();
      this.#keyUp = false;
      const targetMarker = this.#markers.pop();
      if (!targetMarker) return;
      targetMarker.destroy();
      this.#player.position = targetMarker.position.sub(
        this.#player.size.div(2)
      );
      spawnEffect(
        new TeleportProxyEffect({
          id: "TeleportProxyEffect",
          position: this.#player
            .getWorldPosition()
            .add(this.#player.size.div(2)),
          size: new Vector(100, 100),
        })
      );
      this.hitCheck(startPos, targetMarker.position, 25);
      this.updateActive();
    }
  }

  cooldown() {
    this.#cooldown = true;
    this.#timer = new Timer(
      TELEPORT_COOLDOWN,
      false,
      () => (this.#cooldown = false)
    );
  }

  updateActive() {
    if (this.#markers.length === 0) return;
    this.#markers[this.#markers.length - 1].setActive(true);
    if (this.#markers.length > 1)
      this.#markers[this.#markers.length - 2].setActive(false);
  }

  onTrigger(player: Player, triggerType: UpgradeTrigger) {
    if (triggerType !== UpgradeTrigger.ON_ROLL) return;
    this.#player = player;
    if (this.#markers.length >= this.getStacks())
      this.#markers.splice(0, 1)[0].destroy();
    this.#markers.push(
      spawnEffect(
        new ProxyMarker({
          id: "ProxyMarker",
          position: player.getWorldPosition().add(player.size.div(2)),
          size: new Vector(50, 50),
        })
      ) as ProxyMarker
    );
    spawnEffect(
      new PlaceProxyEffect({
        id: "PlaceProxyEffect",
        position: player.getWorldPosition().add(player.size.div(2)),
        size: new Vector(100, 100),
      })
    );
    this.updateActive();
    this.cooldown();
  }
}
