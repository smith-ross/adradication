import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Adbomination, { EnemyState } from "./Adbomination";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [EnemyState.IDLE]: {
    right: {
      sheetPath: `res/enemy-sprites/EyeP/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/enemy-sprites/EyeP/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(120, 80),
    },
  },
  [EnemyState.CHASE]: {
    right: {
      sheetPath: `res/enemy-sprites/EyeP/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.035,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/enemy-sprites/EyeP/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.035,
      cellSize: new Vector(120, 80),
    },
  },
  [EnemyState.ATTACK]: {
    right: {
      sheetPath: `res/enemy-sprites/EyeP/AttackReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.125,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/enemy-sprites/EyeP/Attack.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.125,
      cellSize: new Vector(120, 80),
    },
  },
  [EnemyState.STUNNED]: {
    right: {
      sheetPath: `res/enemy-sprites/EyeP/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/enemy-sprites/EyeP/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(120, 80),
    },
  },
};

export default class EyeP extends Adbomination {
  #sprite: AnimatedSprite | undefined;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      moveSpeed: 90,
      attackRange: 45,
      attackDuration: 1,
      damageWindow: {
        start: 0.15,
        end: 0,
      },
      attackCooldown: 1,
      moveSpeedVariance: 15,
      attackDamage: 12,
    });
    const spriteSize = new Vector(160, 120);
    this.#sprite = new AnimatedSprite({
      id: `${enemyProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      position: new Vector(-55, -spriteSize.y / 2),
      size: spriteSize,
      sheetPath: ANIMATIONS[EnemyState.IDLE].left.sheetPath,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
      parent: this,
    });
    this.addChild(this.#sprite);

    Object.values(ANIMATIONS).forEach((animationVersion) => {
      Object.values(animationVersion).forEach((animationProps) => {
        load(animationProps.sheetPath);
      });
    });

    this.calculateHitbox(-40);
  }

  setAnimation(animationType: EnemyState, dir: "right" | "left") {
    const target = ANIMATIONS[animationType][dir];
    if (
      this.#sprite?.sheetPath === target.sheetPath &&
      this.#sprite?.timeBetweenFrames === target.timeBetweenFrames
    )
      return;
    this.#sprite?.updateSheet(target);
  }

  switchState(newState: EnemyState) {
    super.switchState(newState);
    this.setAnimation(newState, this.walkDirection.x > 0 ? "right" : "left");
  }

  walkDirectionUpdated() {
    if (this.walkDirection.x === 0) return;
    this.setAnimation(this.state, this.walkDirection.x > 0 ? "right" : "left");
  }
}
