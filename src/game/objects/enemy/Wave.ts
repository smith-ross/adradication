import { spawnEffect } from "../../../util/GameUtil";
import { getFromStorage, transformStorage } from "../../../util/StorageUtil";
import Adradication from "../../core/Adradication";
import WorldMap from "../../map/WorldMap";
import Color from "../../types/Color";
import Vector from "../../types/Vector";
import Empty from "../Empty";
import SpawningEffect from "../generic-vfx/SpawningEffect";
import Player from "../player/Player";
import TextLabel from "../TextLabel";
import Adbomination from "./Adbomination";
import Harvester from "./Harvester";

export const BOSS_FIGHT_EVERY = 5;

export default class Wave {
  wave: Adbomination[] = [];
  container: Empty;
  worldMap: WorldMap;
  player: Player;
  onComplete: () => void;
  #count: number = 0;
  #active: boolean = false;
  #monstersPerWave: number = 10;
  #monsterCount: number = 0;

  constructor(
    waveCount: number,
    container: Empty,
    map: WorldMap,
    player: Player,
    monstersPerWave: number,
    onComplete: () => void,
    monsterCount: number,
    defaultWave?: Adbomination[]
  ) {
    this.container = container;
    this.worldMap = map;
    this.player = player;
    this.onComplete = onComplete;
    this.#monstersPerWave = monstersPerWave;
    this.#monsterCount = monsterCount;
    if (defaultWave) this.wave = defaultWave;
    if (waveCount % BOSS_FIGHT_EVERY === 0) this.spawnBoss();

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

  spawnBoss() {
    this.wave = [new Harvester({ id: "Harvester" })];
    this.#monstersPerWave = 1;
    getFromStorage(`TrackerCounter-${Adradication.getGame().tabId}`).then(
      (value) => {
        if (value === undefined) value = [];
        const totals: { [tracker: string]: number } = {};
        value = value.filter(
          (header: { origin: number; url: string }) =>
            header.origin === Adradication.getGame().currentPageCount
        );
        for (let i = 0; i < Math.min(this.#monsterCount, value.length); i++) {
          const url = value[i]?.url;
          if (Object.keys(totals).includes(url)) totals[url] += 1;
          else totals[url] = 1;
        }
        console.log(
          "TOTALS!\n" +
            Object.keys(totals).join(", ") +
            "\n" +
            Object.values(totals)
        );
        const name = Object.keys(totals).sort(
          (a, b) => totals[b] - totals[a]
        )[0];
        const nameLabel = new TextLabel({
          id: "NameTag",
          size: new Vector(150, 50),
          text: name,
          fontSize: 14,
          font: "courier new",
          align: "center",
          color: new Color(150, 0, 0),
          position:
            this.wave[0]!.tagPosition?.add(new Vector(0, 8)) ||
            new Vector(25, 95),
        });
        this.wave[0]!.addChild(nameLabel);
        this.wave[0]!.addChild(
          new TextLabel({
            id: "NameTag",
            size: new Vector(150, 50),
            text: "MOST COMMON TRACKER",
            fontSize: 16,
            font: "courier new",
            align: "center",
            color: new Color(150, 0, 0),
            position: nameLabel.position.add(new Vector(0, 24)),
          })
        );
      }
    );
  }

  addEnemy(enemy: Adbomination) {
    if (this.wave.length >= this.#monstersPerWave) return false;
    this.wave.push(enemy);
    if (this.wave.filter((e) => e !== enemy && e.singleton).length > 0) {
      this.#count++;
      return true;
    }
    if (enemy.singleton) {
      this.wave = this.wave.filter((e) => {
        if (e !== enemy) {
          this.container.removeChild(e);
          this.#count++;
        }
        return e === enemy;
      });
    }
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
          this.player.score += enemy.scoreValue;
          if (this.#count >= this.wave.length) this.onComplete();
        });
      });
    }
    return true;
  }
  setActive() {
    this.worldMap.refreshEnemySpawns();
    this.#active = true;
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
          this.player.score += enemy.scoreValue;
          if (this.#count >= this.wave.length) this.onComplete();
        });
      });
    });
  }
}
