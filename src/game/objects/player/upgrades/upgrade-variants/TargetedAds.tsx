import { spawnEffect } from "../../../../../util/GameUtil";
import Adradication from "../../../../core/Adradication";
import Vector from "../../../../types/Vector";
import HealthBar from "../../../entity/HealthBar";
import HealEffect from "../../../generic-vfx/HealEffect";
import Player from "../../Player";
import Upgrade, { UpgradeType } from "../Upgrade";

const DIFFICULTY_INCREASE = 0.15;

export default class TargetedAds extends Upgrade {
  constructor() {
    super({
      upgradeName: "Targeted Ads",
      upgradeType: UpgradeType.CONSUMABLE,
      upgradeIconPath: "res/upgrades/TargetedAds.png",
      upgradeDescription: (
        <>
          A strange eye dropped by the Data Harvester... <br />
          Restores your Health fully. All Adbominations become stronger.
        </>
      ),
    });
  }

  onPickup(player: Player): void {
    super.onPickup(player);
    const healthBar = player.getChild("PlayerHealthBar") as HealthBar;
    healthBar.heal(healthBar.getMaxHealth() - healthBar.currentHealth);
    spawnEffect(
      new HealEffect({
        id: "HealVFX",
        origin: new Vector(50, 50),
        position: player.getWorldPosition().add(player.size.div(2)),
        size: new Vector(100, 100),
      })
    );
    Adradication.getGame().incrementDifficulty(DIFFICULTY_INCREASE);
  }
}
