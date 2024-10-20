import Vector from "../types/Vector";
import Tile from "./Tile";

interface WorldMapProps {
  cellSize: Vector;
  dimensions: Vector;
}

export default class WorldMap {
  #cellSize: Vector;
  dimensions: Vector;
  #tiles: Tile[][] = [];

  constructor(mapProps: WorldMapProps) {
    this.#cellSize = mapProps.cellSize;
    this.dimensions = mapProps.dimensions;
    for (let col = 0; col < this.dimensions.x; col++) {
      this.#tiles.push([]);
      for (let row = 0; row < this.dimensions.y; row++) {
        this.#tiles[col].push(new Tile(new Vector(col, row), this.#cellSize));
      }
    }
  }

  getTile(position: Vector) {
    console.log(this.#tiles);
    console.log(position);
    return this.#tiles[position.x][position.y];
  }
}
