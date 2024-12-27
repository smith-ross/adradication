import { spawnEffect } from "../../../../../util/GameUtil";
import Adradication from "../../../../core/Adradication";
import Vector from "../../../../types/Vector";
import HealthBar from "../../../entity/HealthBar";
import HealEffect from "../../../generic-vfx/HealEffect";
import Player from "../../Player";
import Upgrade, { UpgradeType } from "../Upgrade";

export default class GDPRKit extends Upgrade {
  constructor() {
    super({
      upgradeName: "GDPR Kit",
      upgradeType: UpgradeType.CONSUMABLE,
      upgradeIconPath: "res/upgrades/GDPRKit.png",
      upgradeDescription:
        "Protect your data with a GDPR Right to Removal request!\n\nRestores your Health fully.",
    });
  }

  onPickup(player: Player): void {
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
  }
}
