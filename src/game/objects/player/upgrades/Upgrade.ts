import Player from "../Player";

export enum UpgradeType {
  CONSUMABLE,
  STAT_MOD,
  STICKY,
}

export enum UpgradeTrigger {
  ON_ROLL,
  ON_ATTACK,
  ON_TAKE_DAMAGE,
  ON_APPLY_DAMAGE,
  ON_DEATH,
  ON_BUTTON_PRESS,
}

interface UpgradeProps {
  upgradeName: string;
  upgradeType: UpgradeType;
  upgradeIconPath: string;
  upgradeDescription: string;
}

export default abstract class Upgrade {
  #upgradeName: string;
  #upgradeIconPath: string;
  #upgradeDescription: string;
  #upgradeType: UpgradeType;

  constructor({
    upgradeName,
    upgradeType,
    upgradeIconPath,
    upgradeDescription,
  }: UpgradeProps) {
    this.#upgradeName = upgradeName;
    this.#upgradeType = upgradeType;
    this.#upgradeIconPath = upgradeIconPath;
    this.#upgradeDescription = upgradeDescription;
  }

  getIcon() {
    return this.#upgradeIconPath;
  }

  getName() {
    return this.#upgradeName;
  }

  getType() {
    return this.#upgradeType;
  }

  getDescription() {
    return this.#upgradeDescription;
  }

  onPickup(player: Player) {
    if (this.#upgradeType) player.addUpgrade(this);
  }
}
