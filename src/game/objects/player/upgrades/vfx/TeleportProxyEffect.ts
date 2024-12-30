import { ImplementedRenderableObjectProps } from "../../../../types/RenderableGameObject";
import Vector from "../../../../types/Vector";
import { AnimationProps } from "../../../AnimatedSprite";
import VFXEffect from "../../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/upgrades/res/inverseProxy.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.04,
      cellSize: new Vector(100, 100),
    },
    left: {
      sheetPath: `res/upgrades/res/inverseProxy.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.04,
      cellSize: new Vector(100, 100),
    },
  },
};

export default class TeleportProxyEffect extends VFXEffect {
  constructor(teleportProxyProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(100, 100),
      iterations: 1,
      origin: new Vector(50, 50),
      animationData: ANIMATIONS[0],
      ...teleportProxyProps,
    });
  }

  render() {}
}
