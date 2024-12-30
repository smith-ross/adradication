import { ImplementedRenderableObjectProps } from "../../../../types/RenderableGameObject";
import Vector from "../../../../types/Vector";
import { AnimationProps } from "../../../AnimatedSprite";
import VFXEffect from "../../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/upgrades/res/proxySpark.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(50, 50),
    },
    left: {
      sheetPath: `res/upgrades/res/proxySpark.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(50, 50),
    },
  },
};

export default class ProxySparkEffect extends VFXEffect {
  constructor(proxySparkProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(50, 50),
      iterations: 1,
      origin: new Vector(25, 25),
      animationData: ANIMATIONS[0],
      ...proxySparkProps,
    });
  }

  render() {}
}
