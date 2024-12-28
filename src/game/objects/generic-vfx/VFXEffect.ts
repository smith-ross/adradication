import RenderableGameObject from "../../types/RenderableGameObject";
import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";

interface VFXEffectProps extends ImplementedRenderableObjectProps {
  spriteSize: Vector;
  iterations?: number;
  animationData: { left: AnimationProps; right: AnimationProps };
}

export default class VFXEffect extends RenderableGameObject {
  #sprite: AnimatedSprite | undefined;
  time: number;

  constructor(effectProps: VFXEffectProps, dir: "left" | "right" = "left") {
    super({
      className: "HealVFX",
      ...effectProps,
    });

    const { iterations = 1, animationData, spriteSize } = effectProps;

    this.time =
      iterations *
      (animationData.left.dimensions.x * animationData.left.timeBetweenFrames);

    this.#sprite = new AnimatedSprite({
      id: `${effectProps.id}-Sprite`,
      position: new Vector(),
      size: spriteSize,
      sheetPath: animationData[dir].sheetPath,
      dimensions: animationData[dir].dimensions,
      timeBetweenFrames: animationData[dir].timeBetweenFrames,
      cellSize: animationData[dir].cellSize,
      parent: this,
    });
    this.addChild(this.#sprite);
    Object.values(animationData).forEach((animationProps) => {
      load(animationProps.sheetPath);
    });
  }

  onUpdate(deltaTime: number) {
    if (this.time <= 0) {
      this.destroy();
      return;
    }
    this.time -= deltaTime;
  }

  render() {}
}
