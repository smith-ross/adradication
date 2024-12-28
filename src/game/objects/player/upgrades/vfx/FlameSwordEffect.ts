import { ImplementedRenderableObjectProps } from "../../../../types/RenderableGameObject";
import Vector from "../../../../types/Vector";
import { AnimationProps } from "../../../AnimatedSprite";
import VFXEffect from "../../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/upgrades/res/FirewallSwordOverlay.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.075,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/upgrades/res/FirewallSwordOverlayReversed.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.075,
      cellSize: new Vector(120, 80),
    },
  },
};

export default class FlameSwordEffect extends VFXEffect {
  constructor(
    healProps: ImplementedRenderableObjectProps,
    dir: "left" | "right"
  ) {
    super(
      {
        spriteSize: new Vector(240, 160),
        iterations: 1,
        animationData: ANIMATIONS[0],
        ...healProps,
      },
      dir
    );
  }

  render() {}
}
