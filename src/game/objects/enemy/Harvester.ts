import { load } from "../../../util/DrawUtil";
import { spawnEffect } from "../../../util/GameUtil";
import { fireEvent } from "../../../util/GeneralUtil";
import { GAME_SIZE } from "../../core/Adradication";
import Color from "../../types/Color";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import HealthBar from "../entity/HealthBar";
import Shadow from "../entity/Shadow";
import HarvesterClawEffect from "../generic-vfx/HarvesterClaw";
import Hitbox from "../Hitbox";
import Timer from "../Timer";
import Adbomination, { EnemyState, KnockbackProps } from "./Adbomination";
import Spore from "./projectiles/Spore";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [EnemyState.IDLE]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.3,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.3,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.IDLE_NO_UPDATE]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.3,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.3,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.DEATH]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/FadeOutReversed.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.15,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/FadeOut.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.15,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.FADE_OUT]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/FadeOutReversed.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/FadeOut.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.FADE_IN]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/FadeInReversed.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/FadeIn.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.CHASE]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/WalkReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.16,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/Walk.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.16,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.ATTACK]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/AttackReversed.png`,
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.175,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/Attack.png`,
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.175,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.STUNNED]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/IdleReversed.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/Idle.png`,
      dimensions: new Vector(8, 1),
      timeBetweenFrames: 0.5,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.SPAWN]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/FadeInReversed.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/FadeIn.png`,
      dimensions: new Vector(11, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
  },
  [EnemyState.CAST]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/CastReversed.png`,
      dimensions: new Vector(9, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/Cast.png`,
      dimensions: new Vector(9, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(215, 93),
    },
  },
};
const MOVE_SPEED = 100;

export default class Harvester extends Adbomination {
  #sprite: AnimatedSprite | undefined;
  #dir: number = -1;
  #timer: Timer | undefined;
  scoreValue = 10;
  singleton = true;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      size: new Vector(80, 135),
      moveSpeed: MOVE_SPEED,
      attackRange: 80,
      attackDuration: 1.4,
      health: 1000,
      damageWindow: {
        start: 0.8,
        end: 0.05,
      },
      attackCooldown: 1,
      moveSpeedVariance: 15,
      name: "Harvester",
      attackDamage: 20,
      lockOnDistance: 5000,
    });

    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(this.size.x, 25),
        position: new Vector(0, 120),
        parent: this,
      })
    );

    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    healthBar.position = healthBar.position.add(new Vector(0, 5));
    healthBar.addSize(new Vector(0, 5));

    this.tagPosition = new Vector(this.size.x / 2, this.size.y + 35);

    const spriteSize = new Vector(355, 183);
    this.#sprite = new AnimatedSprite({
      id: `${enemyProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      origin: new Vector(177.5, 183),
      position: new Vector(this.size.x / 2, this.size.y),
      size: spriteSize,
      sheetPath: ANIMATIONS[EnemyState.IDLE].left.sheetPath,
      dimensions: new Vector(4, 1),
      timeBetweenFrames: 0.15,
      cellSize: new Vector(215, 93),
      parent: this,
    });
    this.addChild(this.#sprite);

    Object.values(ANIMATIONS).forEach((animationVersion) => {
      Object.values(animationVersion).forEach((animationProps) => {
        load(animationProps.sheetPath);
      });
    });

    this.calculateHitbox(10);
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
    return target.dimensions.x * target.timeBetweenFrames;
  }

  switchState(newState: EnemyState) {
    if (
      this.previousState === EnemyState.DEATH ||
      this.state === EnemyState.DEATH
    )
      return 0;
    super.switchState(newState);
    return this.setAnimation(
      newState,
      this.walkDirection.x > 0 ? "right" : "left"
    );
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
      this.switchState(
        this.previousState === EnemyState.ATTACK
          ? EnemyState.ATTACK
          : EnemyState.CHASE
      );
    }
  }

  onSpawn() {
    this.switchState(EnemyState.SPAWN);
    const spawnTimer = new Timer(0.12 * 7, false, () => {
      this.switchState(EnemyState.IDLE);
      this.timers = this.timers.filter((timer) => timer !== spawnTimer);
    });
    this.timers.push(spawnTimer);
  }

  refreshMoveVec() {
    if (!this.playerRef) return;
    const moveVec = this.playerRef.position
      .add(new Vector(0, this.playerRef.size.y / 4))
      .sub(this.position.add(this.size.div(2)))
      .normalize();
    this.walkDirection = moveVec;
    this.walkDirectionUpdated();
    return moveVec;
  }

  protected chaseUpdate(deltaTime: number) {
    if (!this.playerRef) return;
    const moveVec = this.refreshMoveVec();
    if (this.distanceFromPlayer() <= this.attackRange) {
      if (this.attackInfo.attackCooldown <= 0) {
        this.switchState(EnemyState.ATTACK);
        this.doAttack(deltaTime);
      }
    } else {
      this.position = this.position.add(
        moveVec!.mul(deltaTime * this.moveSpeed)
      );
    }
  }

  distanceFromPlayer() {
    if (!this.playerRef) return -1;
    return this.playerRef.position
      .add(new Vector(0, this.playerRef.size.y / 4))
      .sub(this.position.add(this.size.div(2))).magnitude;
  }

  teleport(position: () => Vector) {
    return new Promise<number>((resolve) => {
      const time =
        ANIMATIONS[EnemyState.FADE_OUT].left.dimensions.x *
        ANIMATIONS[EnemyState.FADE_OUT].left.timeBetweenFrames;
      this.switchState(EnemyState.FADE_OUT);
      const fadeInTimer = new Timer(time, false, () => {
        this.timers = this.timers.filter((timer) => timer !== fadeInTimer);
        this.position = position().sub(
          new Vector(this.size.x / 2, this.size.y / 2)
        );
        this.refreshMoveVec();
        this.switchState(EnemyState.FADE_IN);
        const attackTimer = new Timer(time, false, (dt) => {
          this.timers = this.timers.filter((timer) => timer !== attackTimer);
          this.refreshMoveVec();
          resolve(dt);
        });
        this.timers.push(attackTimer);
      });
      this.timers.push(fadeInTimer);
    });
  }

  projectileAttack(amount: number) {
    const time =
      ANIMATIONS[EnemyState.CAST].left.dimensions.x *
      ANIMATIONS[EnemyState.CAST].left.timeBetweenFrames;
    this.teleport(
      () => new Vector(Math.random() * GAME_SIZE.x, Math.random() * GAME_SIZE.y)
    ).then((dt) => {
      this.switchState(EnemyState.CAST);
      const castTimer = new Timer(time, true, () => {
        if (this.state === EnemyState.DEATH) return;
        amount--;
        if (amount <= 0) {
          this.timers = this.timers.filter((timer) => timer !== castTimer);
        }
        spawnEffect(
          new HarvesterClawEffect(
            {
              id: "clawEffect",
              origin: new Vector(120, 93),
              position: this.playerRef!.position.add(
                this.playerRef!.size.div(2)
              ).sub(new Vector(0, 40)),
            },
            this,
            15
          )
        );
      });
      const doneTimer = new Timer(time * amount, false, () => {
        this.timers = this.timers.filter(
          (timer) => timer !== doneTimer && timer !== castTimer
        );
        this.switchState(EnemyState.IDLE_NO_UPDATE);
        const chillTimer = new Timer(3, false, (dt) => {
          this.timers = this.timers.filter((timer) => timer !== chillTimer);
          this.refreshMoveVec();
          this.switchState(EnemyState.IDLE);
        });
        this.timers.push(chillTimer);
      });
      this.timers.push(castTimer);
      this.timers.push(doneTimer);
    });
  }

  stun(duration: number) {
    this.stunInfo.stunDuration = duration;
    this.stunInfo.activeDuration = duration;
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

  onHit(damage: number, stunDuration: number, knockback?: KnockbackProps) {
    if (
      [EnemyState.FADE_IN, EnemyState.FADE_OUT, EnemyState.SPAWN].includes(
        this.state
      )
    )
      return;
    super.onHit(damage, stunDuration, knockback);
  }

  private spawnAds(amount: number, delay: number) {
    for (let i = 0; i < amount; i++) {
      setTimeout(() => fireEvent("createFakeAd", {}), delay * i);
    }
  }

  onUpdate(deltaTime: number) {
    this.timers.forEach((timer) => timer.service(deltaTime));
    if (
      this.state !== EnemyState.ATTACK &&
      this.attackInfo.attackCooldown > 0
    ) {
      this.attackInfo.attackCooldown = Math.max(
        this.attackInfo.attackCooldown - deltaTime,
        0
      );
    }
    if (this.stunInfo.stunDuration > 0) {
      const knockbackThreshold =
        this.stunInfo.stunDuration - this.stunInfo.knockbackDuration;
      if (this.stunInfo.activeDuration > knockbackThreshold) {
        this.position = this.position.add(
          this.stunInfo.knockbarDirection.mul(
            (this.stunInfo.knockbarForce / 1.5) *
              (this.stunInfo.activeDuration / knockbackThreshold) *
              deltaTime
          )
        );
      }
      this.stunInfo.activeDuration -= deltaTime;
    }
    switch (this.state) {
      case EnemyState.IDLE:
        const MOVE_FREQUENCY = {
          TELEPORT_ATTACK: 4,
          SPAWN_ADS: 2,
          SPAWN_CLAWS: 2,
        };
        const moves = [] as string[];
        Object.entries(MOVE_FREQUENCY).forEach(([key, freq]) => {
          for (let i = 0; i < freq; i++) moves.push(key);
        });

        const selectedMove = moves[Math.floor(Math.random() * moves.length)];

        switch (selectedMove) {
          case "TELEPORT_ATTACK":
            this.teleport(() => {
              const playerPos = this.playerRef!.position.add(
                this.playerRef!.size.div(2)
              );
              return new Vector(
                playerPos.x + (Math.random() > 0.5 ? -50 : 50),
                playerPos.y
              );
            }).then((dt) => {
              this.switchState(EnemyState.ATTACK);
              this.doAttack(dt);
              const chaseTimer = new Timer(7, false, () => {
                if (this.state !== EnemyState.ATTACK) {
                  this.timers = this.timers.filter(
                    (timer) => timer !== chaseTimer
                  );
                  this.switchState(EnemyState.IDLE_NO_UPDATE);
                  const chillTimer = new Timer(3, false, (dt) => {
                    this.timers = this.timers.filter(
                      (timer) => timer !== chillTimer
                    );
                    this.refreshMoveVec();
                    this.switchState(EnemyState.IDLE);
                  });
                  this.timers.push(chillTimer);
                }
              });
              this.timers.push(chaseTimer);
            });
            break;

          case "SPAWN_ADS":
            const time =
              ANIMATIONS[EnemyState.CAST].left.dimensions.x *
              ANIMATIONS[EnemyState.CAST].left.timeBetweenFrames;
            this.teleport(
              () =>
                new Vector(
                  Math.random() * GAME_SIZE.x,
                  Math.random() * GAME_SIZE.y
                )
            ).then((dt) => {
              this.switchState(EnemyState.CAST);
              const castTimer = new Timer(time, false, () => {
                this.timers = this.timers.filter(
                  (timer) => timer !== castTimer
                );
                this.spawnAds(5, 250);
                this.switchState(EnemyState.IDLE_NO_UPDATE);
                const chillTimer = new Timer(1, false, (dt) => {
                  this.timers = this.timers.filter(
                    (timer) => timer !== chillTimer
                  );
                  this.refreshMoveVec();
                  this.switchState(EnemyState.IDLE);
                });
                this.timers.push(chillTimer);
              });
              this.timers.push(castTimer);
            });
            break;

          case "SPAWN_CLAWS":
            this.projectileAttack(10);

          default:
            break;
        }
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

      default:
        break;
    }

    this.borderCheck();
  }
}
