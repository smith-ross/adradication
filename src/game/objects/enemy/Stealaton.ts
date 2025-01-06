import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import HealthBar from "../entity/HealthBar";
import Shadow from "../entity/Shadow";
import Hitbox from "../Hitbox";
import Timer from "../Timer";
import Adbomination, { EnemyState } from "./Adbomination";
import Spore from "./projectiles/Spore";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [EnemyState.IDLE]: {
    right: {
      sheetPath: `res/enemy-sprites/Stealaton/IdleReversed.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.15,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Stealaton/Idle.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.15,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.CHASE]: {
    right: {
      sheetPath: `res/enemy-sprites/Stealaton/WalkReversed.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Stealaton/Walk.png`,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.ATTACK]: {
    right: {
      sheetPath: `res/enemy-sprites/Stealaton/AttackReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.175,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Stealaton/Attack.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.175,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.STUNNED]: {
    right: {
      sheetPath: `res/enemy-sprites/Stealaton/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Stealaton/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(150, 150),
    },
  },
  [EnemyState.SPAWN]: {
    right: {
      sheetPath: `res/enemy-sprites/Stealaton/Spawn.png`,
      dimensions: new Vector(7, 1),
      timeBetweenFrames: 0.12,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Stealaton/Spawn.png`,
      dimensions: new Vector(7, 1),
      timeBetweenFrames: 0.12,
      cellSize: new Vector(150, 150),
    },
  },
};
const MOVE_SPEED = 75;

export default class Stealaton extends Adbomination {
  #sprite: AnimatedSprite | undefined;
  #dir: number = -1;
  #timer: Timer | undefined;
  scoreValue = 0;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      size: new Vector(50, 65),
      moveSpeed: MOVE_SPEED,
      attackRange: 45,
      attackDuration: 1.4,
      health: 60,
      damageWindow: {
        start: 0.4,
        end: 0,
      },
      attackCooldown: 1,
      moveSpeedVariance: 15,
      attackDamage: 10,
    });

    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(this.size.x, 25),
        position: new Vector(0, 52),
        parent: this,
      })
    );

    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    healthBar.position = healthBar.position.add(new Vector(0, 5));

    const spriteSize = new Vector(200, 200);
    this.#sprite = new AnimatedSprite({
      id: `${enemyProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      position: new Vector(-123 / 1.5, -200 / 2 + this.size.y / 3 + 10),
      size: spriteSize,
      sheetPath: ANIMATIONS[EnemyState.IDLE].left.sheetPath,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.15,
      cellSize: new Vector(150, 150),
      parent: this,
    });
    this.addChild(this.#sprite);

    Object.values(ANIMATIONS).forEach((animationVersion) => {
      Object.values(animationVersion).forEach((animationProps) => {
        load(animationProps.sheetPath);
      });
    });

    this.calculateHitbox(0);
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

  onSpawn() {
    this.switchState(EnemyState.SPAWN);
    const spawnTimer = new Timer(0.12 * 7, false, () => {
      this.switchState(EnemyState.IDLE);
      this.timers = this.timers.filter((timer) => timer !== spawnTimer);
    });
    this.timers.push(spawnTimer);
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
