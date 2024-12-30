import Player from "../Player";
import Upgrade, { UpgradeTrigger } from "./Upgrade";
import FirewallBall from "./upgrade-variants/FirewallBall";
import ReverseProxy from "./upgrade-variants/ReverseProxy";

export default class PlayerUpgrades {
  #player: Player;
  #appliedUpgrades: Upgrade[] = [];

  constructor(player: Player) {
    this.#player = player;
  }

  trigger(triggerType: UpgradeTrigger, ...args: any) {
    this.#appliedUpgrades.forEach((upgrade) => {
      upgrade.onTrigger(this.#player, triggerType, ...args);
    });
  }

  update(deltaTime: number) {
    this.#appliedUpgrades.forEach((upgrade) => {
      upgrade.update(deltaTime);
    });
  }

  add(upgrade: Upgrade) {
    const existing = this.find(upgrade.getName());
    if (existing) {
      existing.addStack();
    } else this.#appliedUpgrades.push(upgrade);
  }

  find(name: string) {
    return this.#appliedUpgrades.filter(
      (upgrade) => upgrade.getName() === name
    )[0];
  }
}
