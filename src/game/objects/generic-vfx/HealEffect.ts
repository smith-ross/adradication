import RenderableGameObject from "../../types/RenderableGameObject";
import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/vfx/heal.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(100, 100),
    },
    left: {
      sheetPath: `res/vfx/heal.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(100, 100),
    },
  },
};

export default class HealEffect extends RenderableGameObject {
  #sprite: AnimatedSprite | undefined;
  #time: number = 0.48;

  constructor(healProps: ImplementedRenderableObjectProps) {
    super({
      className: "HealVFX",
      ...healProps,
    });

    const spriteSize = new Vector(100, 100);
    this.#sprite = new AnimatedSprite({
      id: `${healProps.id}-Sprite`,
      position: new Vector(),
      size: spriteSize,
      sheetPath: ANIMATIONS[0].left.sheetPath,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(100, 100),
      parent: this,
    });
    this.addChild(this.#sprite);

    Object.values(ANIMATIONS).forEach((animationVersion) => {
      Object.values(animationVersion).forEach((animationProps) => {
        load(animationProps.sheetPath);
      });
    });
  }

  onUpdate(deltaTime: number) {
    if (this.#time <= 0) {
      this.destroy();
      return;
    }
    this.#time -= deltaTime;
  }

  render() {}
}
