import RenderableGameObject from "../../types/RenderableGameObject";
import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import { fireEvent } from "../../../util/GeneralUtil";
import VFXEffect from "./VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/vfx/enemySpawn.png`,
      dimensions: new Vector(7, 1),
      timeBetweenFrames: 0.06,
      cellSize: new Vector(50, 50),
    },
    left: {
      sheetPath: `res/vfx/enemySpawn.png`,
      dimensions: new Vector(7, 1),
      timeBetweenFrames: 0.06,
      cellSize: new Vector(50, 50),
    },
  },
};

export default class SpawningEffect extends VFXEffect {
  constructor(healProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(50, 50),
      iterations: 4,
      animationData: ANIMATIONS[0],
      ...healProps,
    });
  }

  complete() {
    return new Promise<void>((resolve) => {
      const callbackFn = (event: any) => {
        if (event.detail.object === this) {
          document.removeEventListener("SpawnComplete", callbackFn);
          resolve();
        }
      };
      document.addEventListener("SpawnComplete", callbackFn);
    });
  }

  onUpdate(deltaTime: number) {
    if (this.time <= 0) {
      this.destroy();
      fireEvent("SpawnComplete", { object: this });
      return;
    }
    this.time -= deltaTime;
  }

  render() {}
}
