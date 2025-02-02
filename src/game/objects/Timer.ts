export default class Timer {
  #baseTime: number;
  #timeRemaining: number;
  repeat: boolean;
  #callback: (...arg: any) => any;

  constructor(time: number, repeat: boolean, callback: (...arg: any) => any) {
    this.#baseTime = time;
    this.#timeRemaining = time;
    this.repeat = repeat;
    this.#callback = callback;
  }

  service(deltaTime: number) {
    this.#timeRemaining -= deltaTime;
    if (this.#timeRemaining <= 0) {
      this.#callback(deltaTime);
      if (this.repeat) this.#timeRemaining = this.#baseTime;
    }
  }
}
