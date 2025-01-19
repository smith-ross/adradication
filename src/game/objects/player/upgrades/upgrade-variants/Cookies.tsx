import { spawnEffect } from "../../../../../util/GameUtil";
import Adradication from "../../../../core/Adradication";
import Vector from "../../../../types/Vector";
import HealthBar from "../../../entity/HealthBar";
import HealEffect from "../../../generic-vfx/HealEffect";
import Player from "../../Player";
import Upgrade, { UpgradeType } from "../Upgrade";

export default class Cookies extends Upgrade {
  constructor() {
    super({
      upgradeName: "Cookies",
      upgradeType: UpgradeType.CONSUMABLE,
      upgradeIconPath: "res/upgrades/Cookies.png",
      upgradeDescription: (
        <>
          Eat the cookies that are being used to identify you! <br />
          Increase your maximum health by 20% - any damage dealt to you will
          remain.
        </>
      ),
    });
  }

  onPickup(player: Player): void {
    super.onPickup(player);
    const healthBar = player.getChild("PlayerHealthBar") as HealthBar;
    const gain = Math.round(healthBar.getMaxHealth() * 0.2);
    healthBar.setMaxHealth(healthBar.getMaxHealth() + gain);
    healthBar.heal(gain);
    spawnEffect(
      new HealEffect({
        id: "HealVFX",
        origin: new Vector(50, 50),
        position: player.getWorldPosition().add(player.size.div(2)),
        size: new Vector(100, 100),
      })
    );
  }
}
