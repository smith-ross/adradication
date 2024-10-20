import Vector from "../types/Vector";

export default class Tile {
  position: Vector;
  size: Vector;
  enemySpawned: boolean = false;
  constructor(position: Vector, size: Vector) {
    this.position = position;
    this.size = size;
  }
}
