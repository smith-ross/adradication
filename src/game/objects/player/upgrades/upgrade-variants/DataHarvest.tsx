import Adradication from "../../../../core/Adradication";
import Player from "../../Player";
import Upgrade, { UpgradeType } from "../Upgrade";

export default class DataHarvest extends Upgrade {
  constructor() {
    super({
      upgradeName: "Data Harvest",
      upgradeType: UpgradeType.CONSUMABLE,
      upgradeIconPath: "res/upgrades/DataHarvest.png",
      upgradeDescription: (
        <>
          Maximise the harvest of each slain Adbomination! <br />
          For the next round only, every Adbomination slain will score double.
        </>
      ),
    });
  }

  onPickup(player: Player): void {
    super.onPickup(player);
    Adradication.getGame().waves[0].wave.forEach(
      (enemy) => (enemy.scoreValue *= 2)
    );
  }
}
