import Box from "../objects/Box";
import Layer from "../scene/Layer";
import Scene from "../scene/Scene";
import Color from "../types/Color";
import Vector from "../types/Vector";

const GAME_SIZE = new Vector(400, 300);

export default class Adradication {
  #canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  size: Vector = GAME_SIZE;
  loadedScene: Scene | undefined;

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
  }

  start() {
    const [w, h] = GAME_SIZE.asCoords();
    if (!this.context) return;
    this.loadedScene = new Scene({
      id: "TestScene",
      size: GAME_SIZE,
      color: new Color(200, 200, 100),
      layers: [
        new Layer({
          id: "Layer1",
          zIndex: 1,
          children: [
            new Box({
              id: "TestBox",
              position: new Vector(40, 40),
              size: new Vector(50, 20),
              color: new Color(200, 100, 150),
            }),
          ],
        }),
      ],
    });
    this.loadedScene.recursiveRender(this.context);
  }
}
