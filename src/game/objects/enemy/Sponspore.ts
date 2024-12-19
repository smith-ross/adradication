import { load } from "../../../util/DrawUtil";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import HealthBar from "../entity/HealthBar";
import Shadow from "../entity/Shadow";
import Hitbox from "../Hitbox";
import Adbomination, { EnemyState } from "./Adbomination";
import Spore from "./projectiles/Spore";

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
  [EnemyState.SENTRY]: {
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
  [EnemyState.PROJECTILE_ATTACK]: {
    right: {
      sheetPath: `res/enemy-sprites/Sponspore/ProjectileAttackReversed.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(150, 150),
    },
    left: {
      sheetPath: `res/enemy-sprites/Sponspore/ProjectileAttack.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(150, 150),
    },
  },
};

enum SENTRY_STATE {
  IDLE,
  MID_ATTACK,
  START_ATTACK,
  FLEEING,
}

const PROJECTILE_DISTANCE = 300;
const PROJECTILE_MINIMUM_DISTANCE = 150;
const PROJECTILE_COOLDOWN = 5;
const MOVE_SPEED = 45;

export default class Sponspore extends Adbomination {
  #sprite: AnimatedSprite | undefined;
  #dir: number = -1;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      size: new Vector(50, 65),
      moveSpeed: MOVE_SPEED,
      attackRange: 75,
      attackDuration: 1.4,
      damageWindow: {
        start: 0.4,
        end: 0,
      },
      attackCooldown: 1,
      moveSpeedVariance: 15,
      attackDamage: 15,
      lockOnDistance: 4,
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
  protected stunUpdate(deltaTime: number) {
    const knockbackThreshold =
      this.stunInfo.stunDuration - this.stunInfo.knockbackDuration;
    if (this.stunInfo.activeDuration > knockbackThreshold) {
      this.position = this.position.add(
        this.stunInfo.knockbarDirection.mul(
          this.stunInfo.knockbarForce *
            (this.stunInfo.activeDuration / knockbackThreshold) *
            deltaTime
        )
      );
    }
    this.stunInfo.activeDuration -= deltaTime;
    if (this.stunInfo.activeDuration <= 0) {
      this.switchState(EnemyState.SENTRY);
    }
  }

  private projectileUpdate(deltaTime: number) {
    if (!this.playerRef) return;
    const dir = this.playerRef.position.x < this.position.x ? "left" : "right";
    const animRef = ANIMATIONS[EnemyState.PROJECTILE_ATTACK].left;
    let sentryState: SENTRY_STATE = SENTRY_STATE.IDLE;
    if (
      this.attackInfo.projectileAnimationDuration <= 0 &&
      this.attackInfo.projectileAttackCooldown > 0
    ) {
      sentryState = SENTRY_STATE.IDLE;
      if (this.distanceFromPlayer() < PROJECTILE_MINIMUM_DISTANCE) {
        sentryState = SENTRY_STATE.FLEEING;
      }
    } else if (
      this.attackInfo.projectileAnimationDuration <= 0 &&
      this.attackInfo.projectileAttackCooldown <= 0
    ) {
      sentryState = SENTRY_STATE.START_ATTACK;
    } else {
      sentryState = SENTRY_STATE.MID_ATTACK;
    }

    switch (sentryState) {
      case SENTRY_STATE.IDLE:
        this.setAnimation(EnemyState.IDLE, dir);
        this.walkDirection = new Vector(dir === "right" ? 1 : -1, 0);
        this.attackInfo.projectileShot = false;
        this.attackInfo.projectileAttackCooldown -= deltaTime;
        break;

      case SENTRY_STATE.START_ATTACK:
        this.attackInfo.projectileAttackCooldown = PROJECTILE_COOLDOWN;
        this.attackInfo.projectileAnimationDuration =
          animRef.dimensions.x * animRef.timeBetweenFrames;
        this.setAnimation(EnemyState.PROJECTILE_ATTACK, dir);
        break;

      case SENTRY_STATE.MID_ATTACK:
        this.attackInfo.projectileAnimationDuration -= deltaTime;
        if (
          this.attackInfo.projectileAnimationDuration <
            animRef.dimensions.x * animRef.timeBetweenFrames -
              9 * animRef.timeBetweenFrames &&
          !this.attackInfo.projectileShot
        ) {
          this.spawnProjectile();
        }
        break;

      case SENTRY_STATE.FLEEING:
        this.setAnimation(EnemyState.CHASE, dir === "right" ? "left" : "right");
        const angle = this.position
          .sub(this.playerRef.position.add(this.playerRef.size.div(2)))
          .normalize();
        this.position = this.position.add(
          angle.mul(this.moveSpeed * 1.5 * deltaTime)
        );
        const wasStopped = this.borderCheck();
        if (wasStopped) this.switchState(EnemyState.CHASE);
        break;
    }
  }

  private spawnProjectile() {
    if (!this.playerRef) return;
    const projectilePosition = this.size.div(2);
    const angle = this.position
      .add(projectilePosition)
      .sub(this.playerRef.position.add(this.playerRef.size.div(2)))
      .normalize()
      .mul(-1);
    this.addChild(
      new Spore({
        damage: 8,
        speed: 200,
        direction: angle,
        id: "Spore",
        position: projectilePosition,
        parent: this,
        playerRef: this.playerRef,
      })
    );
    this.attackInfo.projectileShot = true;
  }

  onSpawn() {
    this.attackInfo.projectileAttackCooldown = PROJECTILE_COOLDOWN / 2;
  }

  onUpdate(deltaTime: number) {
    if (
      this.state !== EnemyState.ATTACK &&
      this.attackInfo.attackCooldown > 0
    ) {
      this.attackInfo.attackCooldown = Math.max(
        this.attackInfo.attackCooldown - deltaTime,
        0
      );
    }
    switch (this.state) {
      case EnemyState.IDLE:
        this.wander(deltaTime);
        if (
          this.distanceFromPlayer() <= PROJECTILE_DISTANCE &&
          this.distanceFromPlayer() > this.lockOnDistance
        ) {
          this.switchState(EnemyState.SENTRY);
          break;
        }
        if (this.distanceFromPlayer() <= this.lockOnDistance) {
          this.switchState(EnemyState.CHASE);
        }
        break;

      case EnemyState.SENTRY:
        this.projectileUpdate(deltaTime);
        break;

      case EnemyState.CHASE:
        this.chaseUpdate(deltaTime);
        break;

      case EnemyState.STUNNED:
        this.stunUpdate(deltaTime);
        break;

      case EnemyState.ATTACK:
        this.attackUpdate(deltaTime);
        break;
    }

    this.borderCheck();
  }
}
