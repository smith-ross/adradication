import Vector from "../types/Vector";

const GAME_SIZE = new Vector(400, 300);

export default class Adradication {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  size: Vector = new Vector();

  constructor() {
    this.size = GAME_SIZE;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = GAME_SIZE.x;
    this.canvas.height = GAME_SIZE.y;
    const context = canvas.getContext("2d");
    if (!context) throw "Game Error: Could not retrieve Canvas context";
    this.context = context;
  }

  start() {
    const [w, h] = GAME_SIZE.asCoords();
    if (!this.context) return;
    this.context.fillStyle = "blue";
    this.context.fillRect(0, 0, w, h);
  }
}
