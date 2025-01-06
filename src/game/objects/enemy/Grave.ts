import { load } from "../../../util/DrawUtil";
import { spawnEffect } from "../../../util/GameUtil";
import Adradication from "../../core/Adradication";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import HealthBar from "../entity/HealthBar";
import Shadow from "../entity/Shadow";
import GraveHitEffect from "../generic-vfx/GraveHitEffect";
import GraveSpawnEffect from "../generic-vfx/GraveSpawnEffect";
import Hitbox from "../Hitbox";
import Timer from "../Timer";
import Adbomination, { EnemyState, KnockbackProps } from "./Adbomination";
import Spore from "./projectiles/Spore";
import Stealaton from "./Stealaton";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [EnemyState.IDLE]: {
    right: {
      sheetPath: `res/enemy-sprites/Grave/Idle.png`,
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(50, 50),
    },
    left: {
      sheetPath: `res/enemy-sprites/Grave/Idle.png`,
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(50, 50),
    },
  },
  [EnemyState.DEATH]: {
    right: {
      sheetPath: `res/enemy-sprites/Grave/Death.png`,
      dimensions: new Vector(5, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(50, 50),
    },
    left: {
      sheetPath: `res/enemy-sprites/Grave/Death.png`,
      dimensions: new Vector(5, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(50, 50),
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

const SPAWN_SKELETON_COOLDOWN = 6;

export default class Grave extends Adbomination {
  #sprite: AnimatedSprite | undefined;
  #spawnedSkeletonRef: Stealaton | undefined;
  #skeletonCooldown: number = 0;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      position: enemyProps.position?.add(new Vector(0, 5)),
      size: new Vector(50, 50),
      moveSpeed: 0,
      attackRange: 0,
      attackDuration: 0,
      health: 200,
      damageWindow: {
        start: 0,
        end: 0,
      },
      attackCooldown: 999,
      attackDamage: 0,
    });
    this.position = this.position.add(
      new Vector(40, 40)
        .mul(new Vector(Math.random(), Math.random()))
        .sub(new Vector(20, 20))
    );
    this.borderCheck();
    this.tagPosition = new Vector(25, 75);

    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(this.size.x, 25),
        position: new Vector(0, 35),
        parent: this,
      })
    );

    const spriteSize = new Vector(50, 50);
    this.#sprite = new AnimatedSprite({
      id: `${enemyProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      size: spriteSize,
      sheetPath: ANIMATIONS[EnemyState.IDLE].left.sheetPath,
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(50, 50),
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
    this.#sprite?.updateSheet(target);
    return target.dimensions.x * target.timeBetweenFrames;
  }

  switchState(newState: EnemyState) {
    super.switchState(newState);
    return this.setAnimation(
      newState,
      this.walkDirection.x > 0 ? "right" : "left"
    );
  }

  onHit(damage: number, stunDuration: number, _?: KnockbackProps) {
    spawnEffect(
      new GraveHitEffect({
        id: "GraveHitEffect",
        position: this.position,
      })
    );
    if (
      this.#spawnedSkeletonRef &&
      this.#spawnedSkeletonRef.state === EnemyState.IDLE
    ) {
      this.#spawnedSkeletonRef.switchState(EnemyState.CHASE);
    }
    super.onHit(damage, stunDuration);
  }

  walkDirectionUpdated() {}

  stun() {}

  onSpawn() {
    this.#skeletonCooldown = (Math.random() * SPAWN_SKELETON_COOLDOWN) / 4;
    this.addDeathListener(() => this.onDeath());
  }

  onDeath() {
    if (this.#spawnedSkeletonRef) {
      this.#spawnedSkeletonRef.onHit(999, 0);
    }
  }

  onUpdate(deltaTime: number) {
    this.timers.forEach((timer) => timer.service(deltaTime));
    if (!this.playerRef) return;
    if (!this.#spawnedSkeletonRef && this.#skeletonCooldown > 0)
      this.#skeletonCooldown -= deltaTime;
    if (
      this.#skeletonCooldown <= 0 &&
      !this.#spawnedSkeletonRef &&
      Math.random() >= 0.5
    ) {
      Adradication.getGame().monsterCount++;
      this.#spawnedSkeletonRef = new Stealaton({
        id: `Monster-${Adradication.getGame().monsterCount}`,
        size: new Vector(50, 50),
        parent: this.parent,
      });
      this.#spawnedSkeletonRef.addDeathListener(() => {
        this.#spawnedSkeletonRef = undefined;
        this.#skeletonCooldown =
          SPAWN_SKELETON_COOLDOWN / 2 +
          (Math.random() * SPAWN_SKELETON_COOLDOWN) / 2;
      });
      spawnEffect(
        new GraveSpawnEffect({
          id: "GraveSpawnEffect",
          position: this.position,
        })
      );
      const newTimer = new Timer(6 * 0.08, false, () => {
        if (!this.#spawnedSkeletonRef || !this.playerRef) return;
        this.timers = this.timers.filter((timer) => timer !== newTimer);
        this.#spawnedSkeletonRef.spawnAtFixedPoint(
          this.getWorldPosition()
            .add(this.size.div(2))
            .sub(this.#spawnedSkeletonRef.size.div(2)),
          this.playerRef
        );
        this.parent?.addChild(this.#spawnedSkeletonRef);
      });
      this.timers.push(newTimer);
    }
  }
}
