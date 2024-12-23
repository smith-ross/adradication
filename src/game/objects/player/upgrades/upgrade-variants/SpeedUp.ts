import Upgrade, { UpgradeType } from "../Upgrade";

export default class SpeedUp extends Upgrade {
  constructor() {
    super({
      upgradeName: "Speed Up",
      upgradeType: UpgradeType.STAT_MOD,
      upgradeIconPath: "res/upgrades/SpeedUpgrade.png",
      upgradeDescription: "Speeds you up a lot!",
    });
  }
}
