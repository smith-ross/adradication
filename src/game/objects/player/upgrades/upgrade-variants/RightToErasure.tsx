import { spawnEffect } from "../../../../../util/GameUtil";
import Adradication from "../../../../core/Adradication";
import Vector from "../../../../types/Vector";
import HealthBar from "../../../entity/HealthBar";
import HealEffect from "../../../generic-vfx/HealEffect";
import Player from "../../Player";
import Upgrade, { UpgradeType } from "../Upgrade";

export default class RightToErasure extends Upgrade {
  constructor() {
    super({
      upgradeName: "Right to Erasure",
      upgradeType: UpgradeType.CONSUMABLE,
      upgradeIconPath: "res/upgrades/RightToErasure.png",
      upgradeDescription: (
        <>
          Weaken the strength of the Adbominations with a Right To Erasure
          request! <br />
          For the next round only, every Adbomination can be defeated with a
          single attack.
        </>
      ),
    });
  }

  onPickup(player: Player): void {
    super.onPickup(player);
    Adradication.getGame().waves[0].wave.forEach((enemy) => {
      (enemy.getChild("EnemyHealthBar") as HealthBar).currentHealth = 10;
    });
  }
}
