import Player from "../Player";
import Upgrade from "./Upgrade";

export default class PlayerUpgrades {
  #player: Player;
  #appliedUpgrades: Upgrade[] = [];

  constructor(player: Player) {
    this.#player = player;
  }

  add(upgrade: Upgrade) {
    this.#appliedUpgrades.push(upgrade);
  }

  find(name: string) {
    return this.#appliedUpgrades.filter(
      (upgrade) => upgrade.getName() === name
    )[0];
  }
}
