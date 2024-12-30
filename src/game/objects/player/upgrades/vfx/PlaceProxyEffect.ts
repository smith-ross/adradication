import { ImplementedRenderableObjectProps } from "../../../../types/RenderableGameObject";
import Vector from "../../../../types/Vector";
import { AnimationProps } from "../../../AnimatedSprite";
import VFXEffect from "../../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/upgrades/res/proxy.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.06,
      cellSize: new Vector(100, 100),
    },
    left: {
      sheetPath: `res/upgrades/res/proxy.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.06,
      cellSize: new Vector(100, 100),
    },
  },
};

export default class PlaceProxyEffect extends VFXEffect {
  constructor(placeProxyProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(100, 100),
      iterations: 1,
      origin: new Vector(50, 50),
      animationData: ANIMATIONS[0],
      ...placeProxyProps,
    });
  }

  render() {}
}
