import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import HealthBar from "../entity/HealthBar";
import Shadow from "../entity/Shadow";
import Adbomination, { EnemyState } from "./Adbomination";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [EnemyState.IDLE]: {
    right: {
      sheetPath: `res/enemy-sprites/Sponspore/IdleReversed.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.2,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Sponspore/Idle.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.2,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.CHASE]: {
    right: {
      sheetPath: `res/enemy-sprites/Sponspore/RunReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.3,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Sponspore/Run.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.3,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.ATTACK]: {
    right: {
      sheetPath: `res/enemy-sprites/Sponspore/AttackReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.175,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Sponspore/Attack.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.175,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.STUNNED]: {
    right: {
      sheetPath: `res/enemy-sprites/Sponspore/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Sponspore/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(150, 150),
    },
  },
};

export default class Sponspore extends Adbomination {
  #sprite: AnimatedSprite | undefined;
  #dir: number = -1;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      size: new Vector(50, 65),
      moveSpeed: 45,
      attackRange: 75,
      attackDuration: 1.4,
      damageWindow: {
        start: 0.4,
        end: 0,
      },
      attackCooldown: 1,
      moveSpeedVariance: 15,
      attackDamage: 8,
    });

    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(this.size.x, 25),
        position: new Vector(0, 58),
        parent: this,
      })
    );

    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    healthBar.position = healthBar.position.add(new Vector(0, 5));

    const spriteSize = new Vector(300, 300);
    this.#sprite = new AnimatedSprite({
      id: `${enemyProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      position: new Vector(-123, -spriteSize.y / 2 + this.size.y / 3),
      size: spriteSize,
      sheetPath: ANIMATIONS[EnemyState.IDLE].left.sheetPath,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.2,
      cellSize: new Vector(150, 150),
      parent: this,
    });
    this.addChild(this.#sprite);

    Object.values(ANIMATIONS).forEach((animationVersion) => {
      Object.values(animationVersion).forEach((animationProps) => {
        load(animationProps.sheetPath);
      });
    });

    this.calculateHitbox(-20);
  }

  setAnimation(animationType: EnemyState, dir: "right" | "left") {
    const target = ANIMATIONS[animationType][dir];
    if (
      this.#sprite?.sheetPath === target.sheetPath &&
      this.#sprite?.timeBetweenFrames === target.timeBetweenFrames
    )
      return;
    this.#dir = dir === "right" ? 1 : -1;
    this.#sprite?.updateSheet(target);
  }

  switchState(newState: EnemyState) {
    super.switchState(newState);
    this.setAnimation(newState, this.walkDirection.x > 0 ? "right" : "left");
  }

  walkDirectionUpdated() {
    if (this.state === EnemyState.IDLE) {
      if (this.walkDirection.eq(new Vector())) {
        this.setAnimation(EnemyState.IDLE, this.#dir > 0 ? "right" : "left");
      } else {
        this.setAnimation(
          EnemyState.CHASE,
          this.walkDirection.x === 0
            ? this.#dir > 0
              ? "right"
              : "left"
            : this.walkDirection.x > 0
            ? "right"
            : "left"
        );
      }
      return;
    }
    if (this.walkDirection.x === 0) return;
    this.setAnimation(this.state, this.walkDirection.x > 0 ? "right" : "left");
  }
}
