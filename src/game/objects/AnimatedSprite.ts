import { draw, drawAnimated } from "../../util/DrawUtil";
import Color from "../types/Color";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";
import Vector from "../types/Vector";
import Box from "./Box";

export interface AnimationProps {
  sheetPath: string;
  cellSize: Vector;
  dimensions: Vector;
  timeBetweenFrames: number;
}

interface AnimatedSpriteProps
  extends ImplementedRenderableObjectProps,
    AnimationProps {}

interface AnimationData {
  currentFrame: Vector;
  elapsedFrameTime: number;
}

export default class AnimatedSprite extends RenderableGameObject {
  sheetPath: string | undefined;
  cellSize: Vector | undefined;
  dimensions: Vector | undefined;
  timeBetweenFrames: number = 1;

  #animationData: AnimationData | undefined;

  constructor(imgProps: AnimatedSpriteProps) {
    super({
      ...imgProps,
      className: "AnimatedSprite",
    });
    this.updateSheet(imgProps);
  }

  updateSheet(imgProps: AnimationProps) {
    this.sheetPath = imgProps.sheetPath;
    this.cellSize = imgProps.cellSize;
    this.dimensions = imgProps.dimensions;
    this.timeBetweenFrames = imgProps.timeBetweenFrames;
    this.#animationData = {
      currentFrame: new Vector(0, 0),
      elapsedFrameTime: 0,
    };
  }

  // onUpdate(deltaTime: number) {
  //   if (!this.#animationData || !this.cellSize) return;
  //   if (this.#animationData.elapsedFrameTime >= this.timeBetweenFrames) {
  //     const nextRow = this.#animationData.currentFrame.x === this.dimensions?.x;
  //     this.#animationData.currentFrame = new Vector(
  //       nextRow ? 1 : this.#animationData.currentFrame.x + 1,
  //       nextRow
  //         ? this.#animationData.currentFrame.y === this.dimensions?.y
  //           ? 1
  //           : this.#animationData.currentFrame.y + 1
  //         : this.#animationData.currentFrame.y
  //     );
  //   }
  //   this.#animationData.elapsedFrameTime =
  //     (this.#animationData.elapsedFrameTime % this.timeBetweenFrames) +
  //     deltaTime;
  // }

  onUpdate(deltaTime: number) {
    if (!this.#animationData || !this.cellSize) return;
    this.#animationData.elapsedFrameTime += deltaTime;

    // Update the frame if the elapsed time exceeds the time between frames
    if (this.#animationData.elapsedFrameTime >= this.timeBetweenFrames) {
      const maxFramesX = this.dimensions?.x || 1; // 10 frames in this case

      // Move to the next frame
      let nextFrameX = this.#animationData.currentFrame.x + 1;

      // Wrap around if we reach the end of the row
      if (nextFrameX >= maxFramesX) {
        nextFrameX = 0; // Reset to the first frame
      }

      this.#animationData.currentFrame = new Vector(nextFrameX, 0);
      this.#animationData.elapsedFrameTime = 0; // Reset the elapsed time
    }
  }

  render(context: CanvasRenderingContext2D) {
    if (!this.sheetPath || !this.cellSize || !this.#animationData) return;
    const [w, h] = this.cellSize.asCoords();

    drawAnimated(
      context,
      this.getWorldPosition(), // Consistent canvas position
      this.size,
      chrome.runtime.getURL(this.sheetPath),
      w,
      h,
      this.#animationData.currentFrame // Use current frame to get the source
    );
  }
}
