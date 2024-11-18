import { apiPost } from "../../util/FetchUtil";
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
import Wave from "../objects/enemy/Wave";
import Player from "../objects/player/Player";
import TextLabel from "../objects/TextLabel";
import Layer from "../scene/Layer";
import Scene from "../scene/Scene";
import Color from "../types/Color";
import Vector from "../types/Vector";

const GAME_SIZE = new Vector(600, 450);
const MONSTER_WAVE_GAP = 5;
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

  private onComplete() {
    this.waves.splice(0, 1);
    if (this.waves[0]) this.waves[0].setActive();
    if (!this.waves[0]) {
      chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
        transformStorage({
          key: "pageResult-" + tabId.tab + "-" + window.location.href,
          modifierFn(originalValue) {
            return "win";
          },
        }).then(() => {
          chrome.runtime
            .sendMessage({
              text: "REPORT_RESULT",
              monsterCount: this.monsterCount,
              score: this.player?.score,
            })
            .then(() => {
              this.#hasResult = true;
            });
        });
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
          const newMonster = new EyeP({
            id: `Monster-${this.monsterCount}`,
            size: new Vector(50, 50),
          });
          newMonster.addChild(
            new TextLabel({
              id: "NameTag",
              size: new Vector(150, 50),
              text: value[this.monsterCount].url,
              fontSize: 12,
              font: "courier new",
              align: "center",
              color: new Color(150, 0, 0),
              position: new Vector(25, 95),
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
    const player = this.loadedScene.layers[0].getDescendant(
      "TestPlayer"
    ) as Player;
    const monsterContainer = this.loadedScene.layers[0].getDescendant(
      "MonsterContainer"
    ) as Empty;
    if (!monsterContainer || !player) return;

    if (!this.waves[0]) {
      this.waves = [
        new Wave(
          monsterContainer,
          this.worldMap,
          player,
          () => this.onComplete(),
          [enemy]
        ),
      ];
      this.waves[0].setActive();
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
          () => this.onComplete(),
          [enemy]
        )
      );
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

    player.addDeathListener(() => {
      chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
        transformStorage({
          key: "pageResult-" + tabId.tab + "-" + window.location.href,
          modifierFn(originalValue) {
            return "lose";
          },
        }).then(() => {
          chrome.runtime
            .sendMessage({
              text: "REPORT_RESULT",
              monsterCount: this.monsterCount,
              score: 0,
            })
            .then(() => {
              this.#hasResult = true;
            });
        });
      });
    });

    this.player = player;

    this.worldMap = new WorldMap({
      cellSize: new Vector(75, 75),
      dimensions: GAME_SIZE.div(75),
    });

    this.loadedScene = new Scene({
      id: "TestScene",
      size: GAME_SIZE,
      color: new Color(200, 200, 100),
      layers: [
        new Layer({
          id: "Layer1",
          zIndex: 1,
          children: [monsterContainer, player],
          game: this,
        }),
      ],
    });

    this.waves = [
      new Wave(monsterContainer, this.worldMap, player, () =>
        this.onComplete()
      ),
    ];
    this.waves[0].setActive();

    chrome.runtime.sendMessage({ text: "GET_PAGE_COUNT" }, (response) => {
      this.currentPageCount = response.pageCount;
    });

    chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
      this.tabId = tabId.tab;
      window.addEventListener("beforeunload", () => {
        const monsterCount = this.monsterCount;
        chrome.runtime.sendMessage({
          text: "PAGE_UNLOADED",
          monsterCount: monsterCount,
          score: player.score,
          noResult: this.#hasResult,
        });
      });
    });

    this.update(0); // Start game loop
  }

  stop() {}
}
