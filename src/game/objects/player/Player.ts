import { draw } from "../../../util/DrawUtil";
import InputService from "../../services/InputService";
import Color from "../../types/Color";
import RenderableGameObject, {
  Corner,
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import Box from "../Box";

const MOVE_SPEED = 100;
const ROLL_DURATION = 0.6;
const ROLL_SPEED = 100;

export default class Player extends RenderableGameObject {
  #rollingInfo = {
    isRolling: false,
    rollDuration: 0,
    rollDir: new Vector(),
  };

  constructor(boxProps: ImplementedRenderableObjectProps) {
    super({
      ...boxProps,
      children: [
        ...(boxProps.children || []),
        new Box({
          id: `${boxProps.id}-Sprite`,
          color: new Color(100, 100, 255),
          size: boxProps.size,
        }),
      ],
      className: "Player",
    });
  }

  getMovementVector(): Vector {
    let xMove = 0;
    let yMove = 0;
    if (InputService.isKeyDown("D")) {
      xMove += 1;
    }
    if (InputService.isKeyDown("A")) {
      xMove -= 1;
    }
    if (InputService.isKeyDown("W")) {
      yMove -= 1;
    }
    if (InputService.isKeyDown("S")) {
      yMove += 1;
    }
    return new Vector(xMove, yMove).normalize();
  }

  #borderCheck() {
    const rootSize = this.getRoot().size;
    const topLeftCorner = this.getCornerWorldPosition(Corner.TOP_LEFT);
    const botRightCorner = this.getCornerWorldPosition(Corner.BOTTOM_RIGHT);
    let newX = this.position.x;
    let newY = this.position.y;
    if (topLeftCorner.x < 0) {
      newX = 0;
    } else if (botRightCorner.x > rootSize.x) {
      newX = topLeftCorner.x - (botRightCorner.x - rootSize.x);
    }
    if (topLeftCorner.y < 0) {
      newY = 0;
    } else if (botRightCorner.y > rootSize.y) {
      newY = topLeftCorner.y - (botRightCorner.y - rootSize.y);
    }
    this.position = new Vector(newX, newY);
  }

  #baseMovement(deltaTime: number): void {
    this.position = this.position.add(
      this.getMovementVector().mul(deltaTime * MOVE_SPEED)
    );
  }

  #roll(deltaTime: number): void {
    if (this.#rollingInfo.rollDuration <= 0) {
      this.#rollingInfo.isRolling = false;
      this.#baseMovement(deltaTime);
      return;
    }
    this.position = this.position.add(
      this.#rollingInfo.rollDir.mul(
        deltaTime *
          (MOVE_SPEED +
            ROLL_SPEED * (this.#rollingInfo.rollDuration / ROLL_DURATION))
      )
    );
    this.#rollingInfo.rollDuration -= deltaTime;
  }

  onUpdate(deltaTime: number): void {
    if (!this.#rollingInfo.isRolling) {
      if (InputService.isKeyDown("Shift")) {
        this.#rollingInfo.isRolling = true;
        this.#rollingInfo.rollDir = this.getMovementVector();
        this.#rollingInfo.rollDuration = ROLL_DURATION;
        this.#roll(deltaTime);
      } else {
        this.#baseMovement(deltaTime);
      }
    } else {
      this.#roll(deltaTime);
    }
    this.#borderCheck();
  }

  render(context: CanvasRenderingContext2D) {}
}
