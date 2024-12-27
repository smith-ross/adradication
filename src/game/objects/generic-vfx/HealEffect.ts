import RenderableGameObject from "../../types/RenderableGameObject";
import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import VFXEffect from "./VFXEffect";

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

export default class HealEffect extends VFXEffect {
  constructor(healProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(100, 100),
      iterations: 1,
      animationData: ANIMATIONS[0],
      ...healProps,
    });
  }

  render() {}
}
