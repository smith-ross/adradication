import { ReactNode } from "react";
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
  upgradeDescription: ReactNode;
  stacks?: boolean;
}

export default abstract class Upgrade {
  #upgradeName: string;
  #upgradeIconPath: string;
  #upgradeDescription: ReactNode;
  #upgradeType: UpgradeType;
  #stacks: boolean = false;
  #stackAmount: number = 1;

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

  getStacks() {
    return this.#stackAmount;
  }

  addStack() {
    this.#stackAmount += 1;
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
    player.addUpgrade(this);
  }

  update(deltaTime: number) {}

  onTrigger(player: Player, triggerType: UpgradeTrigger, ...args: any) {}
}
