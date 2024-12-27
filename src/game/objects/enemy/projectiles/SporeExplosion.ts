import RenderableGameObject from "../../../types/RenderableGameObject";
import { load } from "../../../../util/DrawUtil";
import Color from "../../../types/Color";
import { ImplementedRenderableObjectProps } from "../../../types/RenderableGameObject";
import Vector from "../../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../../AnimatedSprite";
import HealthBar from "../../entity/HealthBar";
import Shadow from "../../entity/Shadow";
import VFXEffect from "../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/enemy-sprites/Sponspore/Explosion.png`,
      dimensions: new Vector(3, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(32, 32),
    },
    left: {
      sheetPath: `res/enemy-sprites/Sponspore/Explosion.png`,
      dimensions: new Vector(3, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(32, 32),
    },
  },
};

export default class SporeExplosion extends VFXEffect {
  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(32, 32),
      animationData: ANIMATIONS[0],
      iterations: 1,
      ...enemyProps,
    });
  }
}
