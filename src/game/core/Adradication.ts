import { apiPost } from "../../util/FetchUtil";
import { layer } from "../../util/GameUtil";
import { setEventVariable, waitForEvent } from "../../util/GeneralUtil";
import {
  deleteStorage,
  getFromStorage,
  transformStorage,
  transformStorageOverwrite,
} from "../../util/StorageUtil";
import WorldMap from "../map/WorldMap";
import Empty from "../objects/Empty";
import Adbomination from "../objects/enemy/Adbomination";
import EyeP from "../objects/enemy/EyeP";
import Grave from "../objects/enemy/Grave";
import Sponspore from "../objects/enemy/Sponspore";
import Stealaton from "../objects/enemy/Stealaton";
import Wave from "../objects/enemy/Wave";
import Player, { PageResult } from "../objects/player/Player";
import FloatingUpgradePickup from "../objects/player/upgrades/FloatingUpgradePickup";
import Upgrade from "../objects/player/upgrades/Upgrade";
import Cookies from "../objects/player/upgrades/upgrade-variants/Cookies";
import DataHarvest from "../objects/player/upgrades/upgrade-variants/DataHarvest";
import FirewallBall from "../objects/player/upgrades/upgrade-variants/FirewallBall";
import GDPRKit from "../objects/player/upgrades/upgrade-variants/GDPRKit";
import ReverseProxy from "../objects/player/upgrades/upgrade-variants/ReverseProxy";
import RightToErasure from "../objects/player/upgrades/upgrade-variants/RightToErasure";
import Sprite from "../objects/Sprite";
import TextLabel from "../objects/TextLabel";
import Layer from "../scene/Layer";
import Scene from "../scene/Scene";
import Color from "../types/Color";
import Vector from "../types/Vector";

export const GAME_SIZE = new Vector(600, 450);
const MONSTER_WAVE_GAP = 5;
const UPGRADE_AMOUNT = 3;
export let GameInstance: Adradication | undefined;

export default class Adradication {
  #canvas?: HTMLCanvasElement;
  #hasResult: boolean = false;
  context?: CanvasRenderingContext2D;
  size: Vector = GAME_SIZE;

  loadedScene: Scene | undefined;
  worldMap: WorldMap | undefined;
  running: boolean = false;
  frameTime: number = 0;
  monsterCount: number = 0;
  elapsedWaveTime: number = MONSTER_WAVE_GAP;
  tabId: number = -1;
  waves: Wave[] = [];
  currentPageCount: number = 0;
  player: Player | undefined;

  totalWaveCount: number = 0;
  currentWaveId: number = 0;

  static getGame() {
    if (GameInstance) return GameInstance;
    GameInstance = new Adradication();
    return GameInstance;
  }

  get canvas() {
    if (!this.#canvas)
      throw "Game Error: Attempt to access Canvas before defined";
    return this.#canvas;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.canvas.width = GAME_SIZE.x;
    this.canvas.height = GAME_SIZE.y;
    const context = canvas.getContext("2d");
    if (!context) throw "Game Error: Could not retrieve Canvas context";
    this.context = context;
    context.imageSmoothingEnabled = false;
  }

  private generateUpgradeOptions() {
    return [
      new GDPRKit(),
      new FirewallBall(),
      new ReverseProxy(),
      new Cookies(),
      new RightToErasure(),
      new DataHarvest(),
    ];
  }

  upgradeRound() {
    setEventVariable("waveData", ["upgrade", this.totalWaveCount]);
    const upgradeOptions = this.generateUpgradeOptions();
    const upgradeContainer = new Empty({ id: "UpgradeContainer" });
    for (let i = 0; i < UPGRADE_AMOUNT; i++) {
      const selectedUpgrade = upgradeOptions.splice(
        Math.floor(Math.random() * upgradeOptions.length),
        1
      )[0];
      upgradeContainer.addChild(
        new FloatingUpgradePickup({
          id: "PickupUpgrade",
          upgrade: selectedUpgrade,
          size: new Vector(50, 50),
          origin: new Vector(25, 25),
          position: new Vector(150 * (i + 1), 300),
          parent: upgradeContainer,
        })
      );
    }

    layer("Upgrades").addChild(upgradeContainer);

    waitForEvent("continueNextWave").then(() => upgradeContainer.destroy());
  }

  private onComplete() {
    this.waves.splice(0, 1);
    if (!this.waves[0]) {
      this.#hasResult = true;
      const upgrades = this.player?.upgrades!;
      chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
        transformStorage({
          key: "pageResult-" + tabId.tab + "-" + window.location.href,
          modifierFn(originalValue) {
            return {
              type: "win",
              defeatedBy: "",
              upgrades: upgrades.appliedUpgrades.map(
                (upgrade) => `${upgrade.getName()} [${upgrade.getStacks()}]`
              ),
            };
          },
        }).then(() => {
          chrome.runtime.sendMessage({
            text: "REPORT_RESULT",
            value: {
              type: "win",
              defeatedBy: "",
              upgrades: upgrades.appliedUpgrades.map(
                (upgrade) => `${upgrade.getName()} [${upgrade.getStacks()}]`
              ),
            },
            monsterCount: this.monsterCount,
            score: this.player?.score,
          });
        });
      });
    } else {
      this.upgradeRound();
      waitForEvent("continueNextWave").then(() => {
        this.currentWaveId += 1;
        setEventVariable("waveData", [this.currentWaveId, this.totalWaveCount]);
        this.waves[0].setActive();
      });
    }
  }

  update(time: number, game?: Adradication) {
    if (!game) {
      game = this;
    }
    if (!game.canvas) return;
    if (!document.body.contains(game.canvas)) return;
    if (!game.context) return;
    const deltaTime = time - this.frameTime;
    game.frameTime = time;
    if (this.elapsedWaveTime >= MONSTER_WAVE_GAP && this.tabId > 0) {
      this.elapsedWaveTime = 0;
      getFromStorage(`TrackerCounter-${this.tabId}`).then((value) => {
        if (value === undefined) value = [];
        value = value.filter(
          (header: { origin: number }) =>
            header.origin === this.currentPageCount
        );
        if (!this.worldMap || !this.loadedScene) return;
        const diff = value.length - this.monsterCount;
        if (diff <= 0) return;
        for (let i = 0; i < diff; i++) {
          this.monsterCount++;
          const props = {
            id: `Monster-${this.monsterCount}`,
            size: new Vector(50, 50),
          };
          const monsterChoice = [
            new Sponspore(props),
            new EyeP(props),
            new Grave(props),
          ];
          const newMonster =
            monsterChoice[
              Math.round(Math.random() * (monsterChoice.length - 1))
            ];
          newMonster.addChild(
            new TextLabel({
              id: "NameTag",
              size: new Vector(150, 50),
              text: value[this.monsterCount - 1]?.url || "",
              fontSize: 12,
              font: "courier new",
              align: "center",
              color: new Color(150, 0, 0),
              position: newMonster.tagPosition || new Vector(25, 95),
            })
          );
          this.addMonster(newMonster);
        }
      });
    }
    this.elapsedWaveTime += deltaTime;
    game.loadedScene?.recursiveUpdate(deltaTime);
    game.loadedScene?.recursiveRender(game.context, deltaTime);
    window.requestAnimationFrame((deltaTime) => {
      (game || this).update(deltaTime / 1000, game);
    });
  }

  addMonster(enemy: Adbomination) {
    if (!this.loadedScene || !this.worldMap) return;
    const player = layer("Game").getDescendant("TestPlayer") as Player;
    const monsterContainer = layer("Game").getDescendant(
      "MonsterContainer"
    ) as Empty;
    if (!monsterContainer || !player) return;

    if (!this.waves[0]) {
      this.waves = [
        new Wave(
          monsterContainer,
          this.worldMap,
          player,
          Math.min(10, 6 + this.currentWaveId * 2),
          () => this.onComplete(),
          [enemy]
        ),
      ];
      this.waves[0].setActive();
      this.totalWaveCount += 1;
      this.currentWaveId += 1;
      setEventVariable("waveData", [this.currentWaveId, this.totalWaveCount]);
      return;
    }
    let success = false;
    this.waves.forEach((wave) => {
      if (success) return;
      success = wave.addEnemy(enemy);
    });
    if (!success) {
      this.waves.push(
        new Wave(
          monsterContainer,
          this.worldMap,
          player,
          Math.min(10, 6 + this.currentWaveId * 2),
          () => this.onComplete(),
          [enemy]
        )
      );
      this.totalWaveCount += 1;
      setEventVariable("waveData", [this.currentWaveId, this.totalWaveCount]);
    }
  }

  start() {
    if (!this.context) return;
    if (this.running) {
      this.update(this.frameTime);
      return;
    }
    GameInstance = this;
    this.running = true;

    const monsterContainer = new Empty({
      id: "MonsterContainer",
    });

    const player = new Player({
      id: "TestPlayer",
      position: GAME_SIZE.div(2).sub(new Vector(20, 40)),
      size: new Vector(40, 80),
      enemyContainer: monsterContainer,
    });

    player.addDeathListener((hitter: PageResult) => {
      this.#hasResult = true;
      chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
        transformStorage({
          key: "pageResult-" + tabId.tab + "-" + window.location.href,
          modifierFn(originalValue) {
            return {
              type: "lose",
              defeatedBy: hitter.defeatedBy,
              upgrades: hitter.upgrades,
            };
          },
        }).then(() => {
          chrome.runtime.sendMessage({
            text: "REPORT_RESULT",
            value: hitter,
            monsterCount: this.monsterCount,
            score: 0,
          });
        });
      });
    });

    this.player = player;

    this.worldMap = new WorldMap({
      cellSize: new Vector(75, 75),
      dimensions: GAME_SIZE.div(75).sub(new Vector(0, 1)),
    });

    this.loadedScene = new Scene({
      id: "TestScene",
      size: GAME_SIZE,
      color: new Color(200, 200, 100),
      layers: [
        new Layer({
          id: "Game",
          zIndex: 2,
          children: [monsterContainer, player],
          game: this,
        }),
        new Layer({
          id: "Upgrades",
          zIndex: 1,
          children: [],
          game: this,
        }),
        new Layer({
          id: "Background",
          zIndex: 0,
          children: [
            new Sprite({
              id: "Background",
              size: GAME_SIZE,
              imagePath: "res/backgrounds/Grass.png",
            }),
          ],
          game: this,
        }),
        new Layer({
          id: "VFX",
          zIndex: 3,
          children: [],
          game: this,
        }),
      ],
    });

    this.waves = [
      new Wave(
        monsterContainer,
        this.worldMap,
        player,
        Math.min(10, 6 + this.currentWaveId * 2),
        () => this.onComplete()
      ),
    ];
    this.waves[0].setActive();
    this.totalWaveCount = 1;
    this.currentWaveId += 1;
    setEventVariable("waveData", [this.currentWaveId, this.totalWaveCount]);

    chrome.runtime.sendMessage({ text: "GET_PAGE_COUNT" }, (response) => {
      this.currentPageCount = response.pageCount;
    });

    chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
      this.tabId = tabId.tab;
      window.addEventListener("beforeunload", () => {
        const monsterCount = this.monsterCount;
        const upgrades = this.player?.upgrades!;
        chrome.runtime.sendMessage({
          text: "PAGE_UNLOADED",
          monsterCount: monsterCount,
          score: player.score,
          value: {
            type: "flee",
            defeatedBy: "",
            upgrades: upgrades.appliedUpgrades.map(
              (upgrade) => `${upgrade.getName()} [${upgrade.getStacks()}]`
            ),
          },
          noResult: this.#hasResult,
        });
      });
    });

    this.update(0); // Start game loop
  }

  stop() {}
}
