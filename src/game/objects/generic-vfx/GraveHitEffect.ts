import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import { AnimationProps } from "../AnimatedSprite";
import VFXEffect from "./VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/vfx/graveHit.png`,
      dimensions: new Vector(5, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(500, 500),
    },
    left: {
      sheetPath: `res/vfx/graveHit.png`,
      dimensions: new Vector(5, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(50, 50),
    },
  },
};

export default class GraveHitEffect extends VFXEffect {
  constructor(graveHitProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(50, 50),
      iterations: 1,
      animationData: ANIMATIONS[0],
      ...graveHitProps,
    });
  }

  render() {}
}
