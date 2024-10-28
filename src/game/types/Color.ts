export default class Color {
  #r: number = 0;
  #g: number = 0;
  #b: number = 0;

  static random() {
    return new Color(
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    );
  }

  constructor(r?: number, g?: number, b?: number) {
    this.#r = Math.min(Math.max(r || 0, 0), 255);
    this.#g = Math.min(Math.max(g || 0, 0), 255);
    this.#b = Math.min(Math.max(b || 0, 0), 255);
  }

  get r() {
    return this.#r;
  }

  get g() {
    return this.#g;
  }

  get b() {
    return this.#b;
  }

  toString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}
