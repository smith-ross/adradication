import WorldMap from "../map/WorldMap";
import Box from "../objects/Box";
import Empty from "../objects/Empty";
import Adbomination from "../objects/enemy/Adbomination";
import Player from "../objects/player/Player";
import Layer from "../scene/Layer";
import Scene from "../scene/Scene";
import Color from "../types/Color";
import Vector from "../types/Vector";

const GAME_SIZE = new Vector(600, 450);

export default class Adradication {
  #canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  size: Vector = GAME_SIZE;

  loadedScene: Scene | undefined;
  worldMap: WorldMap | undefined;
  running: boolean = false;
  frameTime: number = 0;

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

  update(time: number, game?: Adradication) {
    if (!game) {
      game = this;
    }
    if (!game.canvas) return;
    if (!document.body.contains(game.canvas)) return;
    if (!game.context) return;
    const deltaTime = time - this.frameTime;
    game.frameTime = time;
    game.loadedScene?.recursiveUpdate(deltaTime);
    game.loadedScene?.recursiveRender(game.context, deltaTime);
    window.requestAnimationFrame((deltaTime) => {
      (game || this).update(deltaTime / 1000, game);
    });
  }

  start() {
    if (!this.context) return;

    const monsterContainer = new Empty({
      id: "MonsterContainer",
    });

    const player = new Player({
      id: "TestPlayer",
      position: GAME_SIZE.div(2).sub(new Vector(20, 40)),
      size: new Vector(40, 80),
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
        }),
      ],
    });

    for (let i = 0; i < 10; i++) {
      const newMonster = new Adbomination({
        id: `Monster-${i}`,
        size: new Vector(50, 50),
      });
      newMonster.spawnAtRandomPoint(this.worldMap, player);
      monsterContainer.addChild(newMonster);
    }

    // Start game loop
    this.update(0);
  }
}
