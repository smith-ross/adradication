import { spawnEffect } from "../../../util/GameUtil";
import { transformStorage } from "../../../util/StorageUtil";
import Adradication from "../../core/Adradication";
import WorldMap from "../../map/WorldMap";
import Vector from "../../types/Vector";
import Empty from "../Empty";
import SpawningEffect from "../generic-vfx/SpawningEffect";
import Player from "../player/Player";
import Adbomination from "./Adbomination";

export default class Wave {
  wave: Adbomination[] = [];
  container: Empty;
  worldMap: WorldMap;
  player: Player;
  onComplete: () => void;
  #count: number = 0;
  #active: boolean = false;
  #monstersPerWave: number = 10;

  constructor(
    container: Empty,
    map: WorldMap,
    player: Player,
    monstersPerWave: number,
    onComplete: () => void,
    defaultWave?: Adbomination[]
  ) {
    this.container = container;
    this.worldMap = map;
    this.player = player;
    this.onComplete = onComplete;
    this.#monstersPerWave = monstersPerWave;
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
    if (this.wave.length >= this.#monstersPerWave) return false;
    this.wave.push(enemy);
    if (this.#active) {
      enemy.spawnAtRandomPoint(this.worldMap, this.player as Player);
      const spawnAnimation = new SpawningEffect({
        id: "SpawnEffect",
        origin: new Vector(25, 25),
        position: enemy.position.add(
          new Vector(enemy.size.x / 2, enemy.size.y)
        ),
      });
      spawnEffect(spawnAnimation);
      spawnAnimation.complete().then(() => {
        this.container.addChild(enemy);
        enemy.addDeathListener(() => {
          this.#count++;
          this.player.score++;
          if (this.#count >= this.wave.length) this.onComplete();
        });
      });
    }
    return true;
  }
  setActive() {
    this.worldMap.refreshEnemySpawns();
    this.#active = true;
    // chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
    //   transformStorage({
    //     key: "pageWaves-" + tabId.tab,
    //     modifierFn(originalValue) {
    //       originalValue = originalValue ?? [0, 0];
    //       return [originalValue[0] + 1, originalValue[1]];
    //     },
    //   });
    // });
    this.wave.forEach((enemy) => {
      enemy.spawnAtRandomPoint(this.worldMap, this.player as Player);
      const spawnAnimation = new SpawningEffect({
        id: "SpawnEffect",
        origin: new Vector(25, 25),
        position: enemy.position.add(
          new Vector(enemy.size.x / 2, enemy.size.y)
        ),
      });
      spawnEffect(spawnAnimation);
      spawnAnimation.complete().then(() => {
        this.container.addChild(enemy);
        enemy.addDeathListener(() => {
          this.#count++;
          this.player.score++;
          if (this.#count >= this.wave.length) this.onComplete();
        });
      });
    });
  }
}
