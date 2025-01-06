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
      sheetPath: `res/vfx/takeDamage.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.065,
      cellSize: new Vector(600, 450),
    },
    left: {
      sheetPath: `res/vfx/takeDamage.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.065,
      cellSize: new Vector(600, 450),
    },
  },
};

export default class TakeDamageEffect extends VFXEffect {
  constructor(takeDamageProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(600, 450),
      position: new Vector(),
      iterations: 1,
      animationData: ANIMATIONS[0],
      ...takeDamageProps,
    });
  }

  render() {}
}
