import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import { AnimationProps } from "../AnimatedSprite";
import VFXEffect from "./VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/vfx/graveSpawn.png`,
      dimensions: new Vector(7, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(500, 500),
    },
    left: {
      sheetPath: `res/vfx/graveSpawn.png`,
      dimensions: new Vector(7, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(50, 50),
    },
  },
};

export default class GraveSpawnEffect extends VFXEffect {
  constructor(graveSpawnProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(50, 50),
      iterations: 1,
      animationData: ANIMATIONS[0],
      ...graveSpawnProps,
    });
  }

  render() {}
}
