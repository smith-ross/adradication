import {
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
import Layer from "../scene/Layer";
import Scene from "../scene/Scene";
import Color from "../types/Color";
import Vector from "../types/Vector";

const GAME_SIZE = new Vector(600, 450);
const MONSTER_WAVE_GAP = 5;
export let GameInstance: Adradication | undefined;

export default class Adradication {
  #canvas?: HTMLCanvasElement;
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
      chrome.runtime.sendMessage({ text: "getTabId" }, (tabId) => {
        transformStorage({
          key: "pageResult-" + tabId.tab,
          modifierFn(originalValue) {
            return "win";
          },
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
        if (value === undefined) value = 0;
        if (!this.worldMap || !this.loadedScene) return;
        const diff = value - this.monsterCount;
        if (diff <= 0) return;
        for (let i = 0; i < diff; i++) {
          this.monsterCount++;
          const newMonster = new EyeP({
            id: `Monster-${this.monsterCount}`,
            size: new Vector(50, 50),
          });
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

    chrome.runtime.sendMessage({ text: "getTabId" }, (tabId) => {
      this.tabId = tabId.tab;
      window.addEventListener("beforeunload", () => {
        transformStorageOverwrite({
          key: `TrackerCounter-${tabId.tab}`,
          modifierFn: (originalValue) => {
            return 0;
          },
        });
      });
    });

    this.update(0); // Start game loop
  }

  stop() {}
}
