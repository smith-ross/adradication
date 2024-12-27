import RenderableGameObject from "../../../types/RenderableGameObject";
import { load } from "../../../../util/DrawUtil";
import Color from "../../../types/Color";
import { ImplementedRenderableObjectProps } from "../../../types/RenderableGameObject";
import Vector from "../../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../../AnimatedSprite";
import HealthBar from "../../entity/HealthBar";
import Shadow from "../../entity/Shadow";

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

export default class SporeExplosion extends RenderableGameObject {
  #sprite: AnimatedSprite | undefined;
  time: number = 0.24;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      className: "Explosion",
      ...enemyProps,
    });

    const spriteSize = new Vector(32, 32);
    this.#sprite = new AnimatedSprite({
      id: `${enemyProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      position: new Vector(),
      size: spriteSize,
      sheetPath: ANIMATIONS[0].left.sheetPath,
      dimensions: new Vector(3, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(32, 32),
      parent: this,
    });
    this.addChild(this.#sprite);

    Object.values(ANIMATIONS).forEach((animationVersion) => {
      Object.values(animationVersion).forEach((animationProps) => {
        load(animationProps.sheetPath);
      });
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
