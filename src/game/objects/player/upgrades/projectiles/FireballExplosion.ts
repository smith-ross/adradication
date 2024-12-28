import { ImplementedRenderableObjectProps } from "../../../../types/RenderableGameObject";
import Vector from "../../../../types/Vector";
import { AnimationProps } from "../../../AnimatedSprite";
import VFXEffect from "../../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/upgrades/res/FireballExplosion.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(32, 32),
    },
    left: {
      sheetPath: `res/upgrades/res/FireballExplosion.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(32, 32),
    },
  },
};

export default class FireballExplosion extends VFXEffect {
  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(64, 64),
      origin: new Vector(32, 32),
      animationData: ANIMATIONS[0],
      iterations: 1,
      ...enemyProps,
    });
  }
}
