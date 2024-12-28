import { spawnEffect } from "../../../../../util/GameUtil";
import Adradication from "../../../../core/Adradication";
import Vector from "../../../../types/Vector";
import Adbomination from "../../../enemy/Adbomination";
import HealthBar from "../../../entity/HealthBar";
import HealEffect from "../../../generic-vfx/HealEffect";
import Timer from "../../../Timer";
import Player from "../../Player";
import Fireball from "../projectiles/Fireball";
import Upgrade, { UpgradeTrigger, UpgradeType } from "../Upgrade";
import FlameSwordEffect from "../vfx/FlameSwordEffect";

const FIREWALL_GAP = 0.15;

export default class FirewallBall extends Upgrade {
  #swings: number = 0;
  #queue: number = 0;
  #gap: number = 0;
  #timer: Timer | undefined;

  constructor() {
    super({
      upgradeName: "Firewall Ball",
      upgradeType: UpgradeType.STICKY,
      upgradeIconPath: "res/upgrades/FirewallBall.png",
      stacks: true,
      upgradeDescription: (
        <>
          Produce a Fireball with Firewall qualities every 3 swings, damaging
          any Adbominations hit.
          <br />
          <b>Stack:</b> Produce an additional Fireball for each Stack.
        </>
      ),
    });
  }

  private spawnFireball(player: Player, direction: Vector) {
    Adradication.getGame()
      .loadedScene?.getLayer("Game")
      .addChild(
        new Fireball({
          id: "Fireball",
          position: player
            .getWorldPosition()
            .add(player.size.div(2))
            .add(new Vector(16, 16))
            .add(direction.mul(2)),
          origin: new Vector(24, 24),
          direction: direction,
          size: new Vector(48, 48),
          damage: 25,
          speed: 250,
          playerRef: player,
          parent: Adradication.getGame().loadedScene?.getLayer("Game"),
          targets: (
            player.getEnemyContainer().children as Adbomination[]
          ).filter((enemy) => enemy.className === "Adbomination"),
        })
      );
  }

  update(deltaTime: number) {
    if (this.#timer) this.#timer.service(deltaTime);
  }

  onTrigger(player: Player, triggerType: UpgradeTrigger, direction: Vector) {
    if (triggerType !== UpgradeTrigger.ON_ATTACK) return;
    this.#swings++;
    if (this.#swings >= 3) {
      spawnEffect(
        new FlameSwordEffect(
          {
            id: "FlameSwordEffect",
            position: player
              .getChild(`${player.id}-Sprite`)
              ?.getWorldPosition(),
            size: new Vector(240, 160),
          },
          direction.x === 1 ? "right" : "left"
        )
      );
      this.#queue = this.getStacks();
      this.#swings = 0;
      this.spawnFireball(player, direction);
      this.#queue -= 1;
      if (this.#queue > 0) {
        this.#timer = new Timer(FIREWALL_GAP, true, () => {
          if (this.#queue > 0) {
            this.spawnFireball(player, direction);
            this.#queue -= 1;
          } else {
            this.#timer = undefined;
          }
        });
      }
    }
  }
}
