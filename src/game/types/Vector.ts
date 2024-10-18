export default class Vector {
  #x: number = 0;
  #y: number = 0;
  #magnitude: number = -1;

  constructor(x?: number, y?: number) {
    if (x) this.#x = x;
    if (y) this.#y = y;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get magnitude() {
    if (this.#magnitude === -1)
      this.#magnitude = Math.sqrt(this.#x * this.#x + this.#y * this.#y);
    return this.#magnitude;
  }

  add(otherVec: Vector): Vector {
    return new Vector(this.#x + otherVec.#x, this.#y + otherVec.#y);
  }

  sub(otherVec: Vector): Vector {
    return new Vector(this.#x - otherVec.#x, this.#y - otherVec.#y);
  }

  eq(otherVec: Vector): boolean {
    return this.x == otherVec.x && this.y == otherVec.y;
  }

  mul(multiplier: Vector | number) {
    if (typeof multiplier == "number")
      return new Vector(this.#x * multiplier, this.#y * multiplier);
    return new Vector(this.#x * multiplier.#x, this.#y * multiplier.#y);
  }

  div(multiplier: Vector | number) {
    if (typeof multiplier == "number")
      return new Vector(this.#x / multiplier, this.#y / multiplier);
    return new Vector(this.#x / multiplier.#x, this.#y / multiplier.#y);
  }

  normalize() {
    return new Vector(this.#x / this.magnitude, this.#y / this.magnitude);
  }

  asCoords() {
    return [this.#x, this.#y];
  }

  toString() {
    return `Vector <${this.#x}, ${this.#y}>`;
  }
}
