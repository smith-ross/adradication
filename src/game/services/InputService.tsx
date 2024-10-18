export default class InputService {
  static #initialised: boolean = false;
  static #pressedKeys: { [key: string]: boolean } = {};

  static init() {
    if (InputService.#initialised) return;
    document.body.addEventListener("keydown", (event: KeyboardEvent) => {
      InputService.#pressedKeys[event.key.toLowerCase()] = true;
    });
    document.body.addEventListener("keyup", (event: KeyboardEvent) => {
      InputService.#pressedKeys[event.key.toLowerCase()] = false;
    });
    InputService.#initialised = true;
  }

  static isKeyDown(key: string) {
    InputService.init();
    return !!InputService.#pressedKeys[key.toLowerCase()];
  }
}
