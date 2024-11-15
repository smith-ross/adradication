import { transformStorage } from "../../../util/StorageUtil";
import WorldMap from "../../map/WorldMap";
import Empty from "../Empty";
import Player from "../player/Player";
import Adbomination from "./Adbomination";

const MONSTERS_PER_WAVE = 10;

export default class Wave {
  wave: Adbomination[] = [];
  container: Empty;
  worldMap: WorldMap;
  player: Player;
  onComplete: () => void;
  #count: number = 0;
  #active: boolean = false;

  constructor(
    container: Empty,
    map: WorldMap,
    player: Player,
    onComplete: () => void,
    defaultWave?: Adbomination[]
  ) {
    this.container = container;
    this.worldMap = map;
    this.player = player;
    this.onComplete = onComplete;
    if (defaultWave) this.wave = defaultWave;
    chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
      transformStorage({
        key: "pageWaves-" + tabId.tab,
        modifierFn(originalValue) {
          originalValue = originalValue ?? [0, 0];
          return [originalValue[0], originalValue[1] + 1];
        },
      });
    });
  }

  addEnemy(enemy: Adbomination) {
    if (this.wave.length >= MONSTERS_PER_WAVE) return false;
    this.wave.push(enemy);
    if (this.#active) {
      enemy.spawnAtRandomPoint(this.worldMap, this.player as Player);
      this.container.addChild(enemy);
      enemy.addDeathListener(() => {
        this.#count++;
        this.player.score++;
        if (this.#count >= this.wave.length) this.onComplete();
      });
    }
    return true;
  }
  setActive() {
    this.worldMap.refreshEnemySpawns();
    this.#active = true;
    chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
      transformStorage({
        key: "pageWaves-" + tabId.tab,
        modifierFn(originalValue) {
          originalValue = originalValue ?? [0, 0];
          return [originalValue[0] + 1, originalValue[1]];
        },
      });
    });
    this.wave.forEach((enemy) => {
      enemy.spawnAtRandomPoint(this.worldMap, this.player as Player);
      this.container.addChild(enemy);
      enemy.addDeathListener(() => {
        this.#count++;
        this.player.score++;
        if (this.#count >= this.wave.length) this.onComplete();
      });
    });
  }
}
