import { draw, load } from "../../../util/DrawUtil";
import InputService from "../../services/InputService";
import Color from "../../types/Color";
import InstanceTags from "../../types/InstanceTags";
import RenderableGameObject, {
  Corner,
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import Empty from "../Empty";
import Adbomination, { EnemyState } from "../enemy/Adbomination";
import HealthBar from "../entity/HealthBar";
import Hitbox from "../Hitbox";
import Sprite from "../Sprite";
import { PlayerConstants } from "../../const/ConstantsManager";
import Shadow from "../entity/Shadow";
import { transformStorage } from "../../../util/StorageUtil";
import { isDebugMode } from "../../../util/GeneralUtil";
import GameObject from "../../types/GameObject";
import Projectile from "../enemy/projectiles/Projectile";
import PlayerUpgrades from "./upgrades/PlayerUpgrades";
import Upgrade, { UpgradeTrigger } from "./upgrades/Upgrade";
import { spawnEffect } from "../../../util/GameUtil";
import TakeDamageEffect from "../generic-vfx/TakeDamageEffect";

const {
  MOVE_SPEED,
  ROLL_DURATION,
  ROLL_SPEED,
  BASE_SPRITE,
  ATTACK_DURATION,
  ATTACK_COOLDOWN,
  WEAPON_HIT_WINDOW,
  WEAPON_DAMAGE,
  HIT_KNOCKBACK_DURATION,
  HIT_KNOCKBACK_FORCE,
  HIT_STUN_DURATION,
} = PlayerConstants;

enum PlayerState {
  RUN,
  ROLL,
  IDLE,
  ATTACK,
  DEAD,
}
const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [PlayerState.ROLL]: {
    right: {
      sheetPath: `res/character-sprites/Roll.png`,
      dimensions: new Vector(12, 1),
      timeBetweenFrames: 0.05,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/character-sprites/ReversedRoll.png`,
      dimensions: new Vector(12, 1),
      timeBetweenFrames: 0.05,
      cellSize: new Vector(120, 80),
    },
  },
  [PlayerState.ATTACK]: {
    right: {
      sheetPath: `res/character-sprites/Attack.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.075,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: `res/character-sprites/ReversedAttack.png`,
      dimensions: new Vector(6, 1),
      timeBetweenFrames: 0.075,
      cellSize: new Vector(120, 80),
    },
  },
  [PlayerState.RUN]: {
    right: {
      sheetPath: "res/character-sprites/Run.png",
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: "res/character-sprites/ReversedRun.png",
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
    },
  },
  [PlayerState.IDLE]: {
    right: {
      sheetPath: "res/character-sprites/Idle.png",
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
    },
    left: {
      sheetPath: "res/character-sprites/ReversedIdle.png",
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
    },
  },
  [PlayerState.DEAD]: {
    right: {
      sheetPath: "res/character-sprites/Death.png",
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
      stopAtLastFrame: true,
    },
    left: {
      sheetPath: "res/character-sprites/ReversedDeath.png",
      dimensions: new Vector(10, 1),
      timeBetweenFrames: 0.1,
      cellSize: new Vector(120, 80),
      stopAtLastFrame: true,
    },
  },
};

interface PlayerProps extends ImplementedRenderableObjectProps {
  enemyContainer: Empty;
}

interface RollState {
  rollDuration: number;
  rollDir: Vector;
}

interface AttackState {
  attackDuration: number;
  attackCooldown: number;
  hitEnemies: GameObject[];
}

export default class Player extends RenderableGameObject {
  #rollingInfo: RollState = {
    rollDuration: 0,
    rollDir: new Vector(),
  };
  #attackInfo: AttackState = {
    attackDuration: 0,
    attackCooldown: 0,
    hitEnemies: [],
  };
  #sprite: AnimatedSprite | undefined;
  #lastDirection = 1;
  #enemyContainer: Empty;

  #state: PlayerState = PlayerState.IDLE;

  tags: InstanceTags = new InstanceTags();
  upgrades: PlayerUpgrades = new PlayerUpgrades(this);
  score: number = 0;

  #deathListeners: ((hitter?: string) => void)[] = [];

  constructor(playerProps: PlayerProps) {
    const hitboxSize = playerProps.size?.mul(1.5).add(new Vector(30, -40));
    const hitboxLeftOffset = hitboxSize
      ?.sub(new Vector(0, hitboxSize.y / 2))
      .sub((playerProps.size || new Vector()).div(2));
    const hitboxRightOffset = new Vector(0, hitboxSize?.y)
      ?.sub(new Vector(0, (hitboxSize?.y || 0) / 2))
      .sub((playerProps.size || new Vector()).div(2));

    super({
      ...playerProps,
      children: [
        ...(playerProps.children || []),
        new Hitbox({
          id: "LeftAttackHitbox",
          size: hitboxSize,
          origin: hitboxLeftOffset,
          showVisual: isDebugMode(),
        }),
        new Hitbox({
          id: "RightAttackHitbox",
          size: hitboxSize,
          origin: hitboxRightOffset,
          showVisual: isDebugMode(),
        }),
        new Hitbox({
          id: "PlayerHurtbox",
          size: playerProps.size,
          showVisual: isDebugMode(),
        }),
      ],
      className: "Player",
    });
    this.#enemyContainer = playerProps.enemyContainer;
    if (!playerProps.size) return;

    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(playerProps.size?.x * 1.5, 35),
        position: new Vector(0, this.size.y - 21),
        parent: this,
      })
    );
    this.addChild(
      new HealthBar({
        id: "PlayerHealthBar",
        maxHealth: 100,
        position: new Vector(0, this.size.y + 8),
        parent: this,
        size: new Vector(this.size.x * 1.5),
      })
    );

    const spriteSize = new Vector(240, 160);
    this.#sprite = new AnimatedSprite({
      id: `${playerProps.id}-Sprite`,
      color: new Color(100, 100, 255),
      position: new Vector(0.375 * -spriteSize.x, -spriteSize.y / 2),
      size: spriteSize,
      sheetPath: BASE_SPRITE,
      dimensions: new Vector(10, 1),
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
  }

  setAnimation(animationType: PlayerState, dir: "right" | "left") {
    const target = ANIMATIONS[animationType][dir];
    if (this.#sprite?.sheetPath === target.sheetPath) return;
    this.#sprite?.updateSheet(target);
  }

  getMovementVector(): Vector {
    const xMove =
      (InputService.isKeyDown("D") ? 1 : 0) -
      (InputService.isKeyDown("A") ? 1 : 0);
    const yMove =
      (InputService.isKeyDown("S") ? 1 : 0) -
      (InputService.isKeyDown("W") ? 1 : 0);
    return new Vector(xMove, yMove).normalize();
  }

  addDeathListener(listener: () => void) {
    this.#deathListeners.push(listener);
  }

  addUpgrade(upgrade: Upgrade) {
    this.upgrades.add(upgrade);
  }

  private borderCheck() {
    const rootSize = this.getRoot().size;
    const topLeftCorner = this.getCornerWorldPosition(Corner.TOP_LEFT);
    const botRightCorner = this.getCornerWorldPosition(Corner.BOTTOM_RIGHT);
    const newX = Math.max(
      0,
      topLeftCorner.x - Math.max(0, botRightCorner.x - rootSize.x)
    );
    const newY = Math.max(
      0,
      topLeftCorner.y - Math.max(0, botRightCorner.y - rootSize.y)
    );
    this.position = new Vector(newX, newY);
  }

  private baseMovement(deltaTime: number): void {
    this.position = this.position.add(
      this.getMovementVector().mul(deltaTime * MOVE_SPEED)
    );
    if (!this.#sprite) return;
    const [x, y] = this.getMovementVector().asCoords();
    this.switchState(x === 0 && y === 0 ? PlayerState.IDLE : PlayerState.RUN);
    if (x < 0) {
      this.#lastDirection = -1;
      this.setAnimation(PlayerState.RUN, "left");
    } else if (x > 0) {
      this.#lastDirection = 1;
      this.setAnimation(PlayerState.RUN, "right");
    } else if (y !== 0) {
      this.setAnimation(
        PlayerState.RUN,
        this.#lastDirection === 1 ? "right" : "left"
      );
    } else {
      this.setAnimation(
        PlayerState.IDLE,
        this.#lastDirection === 1 ? "right" : "left"
      );
    }
  }

  switchState(newState: PlayerState) {
    this.#state = newState;
  }

  private attackUpdate(deltaTime: number) {
    if (this.#attackInfo.attackDuration <= 0) {
      this.switchState(PlayerState.IDLE);
      this.onUpdate(deltaTime);
      return;
    }

    const chosenHitbox: Hitbox = this.getChild(
      this.#lastDirection === 1 ? "RightAttackHitbox" : "LeftAttackHitbox"
    ) as Hitbox;

    if (
      this.#attackInfo.attackDuration < WEAPON_HIT_WINDOW.START &&
      this.#attackInfo.attackDuration > WEAPON_HIT_WINDOW.END
    ) {
      this.#enemyContainer.children.forEach((enemy) => {
        if (enemy.className === "Adbomination") {
          const target = enemy as Adbomination;
          if (
            !this.#attackInfo.hitEnemies.includes(target) &&
            chosenHitbox.intersectsWith(
              target.getChild("EnemyHurtbox") as Hitbox
            ) &&
            target.state !== EnemyState.DEATH
          ) {
            const direction = target.position
              .add(target.size.div(2))
              .sub(this.position.add(this.size.div(2)))
              .div(new Vector(1, 2))
              .normalize();
            this.#attackInfo.hitEnemies.push(target);
            target.onHit(WEAPON_DAMAGE, HIT_STUN_DURATION, {
              duration: HIT_KNOCKBACK_DURATION,
              force: HIT_KNOCKBACK_FORCE,
              direction: direction,
            });
          }
        } else if (enemy.className === "Projectile") {
          if (
            !this.#attackInfo.hitEnemies.includes(enemy) &&
            chosenHitbox.intersectsWith(
              enemy.getChild("ProjectileHitbox") as Hitbox
            )
          ) {
            this.#attackInfo.hitEnemies.push(enemy);
            (enemy as Projectile).invertDirection(
              (this.#enemyContainer.children as Adbomination[]).filter(
                (enemy) => enemy.className === "Adbomination"
              )
            );
          }
        }
      });
    }

    this.#attackInfo.attackDuration -= deltaTime;
  }

  getEnemyContainer() {
    return this.#enemyContainer;
  }

  private rollUpdate(deltaTime: number): void {
    if (this.#rollingInfo.rollDuration <= 0) {
      this.switchState(PlayerState.IDLE);
      this.onUpdate(deltaTime);
      return;
    }
    this.position = this.position.add(
      this.#rollingInfo.rollDir
        .add(this.getMovementVector().div(2))
        .mul(
          deltaTime *
            (MOVE_SPEED +
              ROLL_SPEED * (this.#rollingInfo.rollDuration / ROLL_DURATION))
        )
    );
    this.#rollingInfo.rollDuration -= deltaTime;
  }

  private updateCooldowns(deltaTime: number) {
    if (
      this.#state !== PlayerState.ATTACK &&
      this.#attackInfo.attackCooldown > 0
    ) {
      this.#attackInfo.attackCooldown = Math.max(
        this.#attackInfo.attackCooldown - deltaTime,
        0
      );
    }
  }

  onHit(damage: number, hitter: Adbomination) {
    const healthBar = this.getChild("PlayerHealthBar") as HealthBar;
    if (healthBar.currentHealth <= 0) return;
    healthBar.takeDamage(damage);
    spawnEffect(
      new TakeDamageEffect({
        id: "TakeDamageEffect",
      })
    );
    if (healthBar.currentHealth <= 0) {
      this.switchState(PlayerState.DEAD);
      this.setAnimation(
        PlayerState.DEAD,
        this.#lastDirection === 1 ? "right" : "left"
      );
      this.#deathListeners.forEach((listener) => {
        listener(hitter.name);
      });
      chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
        transformStorage({
          key: "pageResult-" + tabId.tab + "-" + window.location.href,
          modifierFn(originalValue) {
            return ["lose", hitter.name];
          },
        });
      });
    }
  }

  doAttack(deltaTime: number, moveVec: Vector) {
    this.switchState(PlayerState.ATTACK);
    this.#attackInfo = {
      attackDuration: ATTACK_DURATION,
      attackCooldown: ATTACK_COOLDOWN,
      hitEnemies: [],
    };
    if (moveVec.x > 0) {
      this.#lastDirection = 1;
      this.setAnimation(PlayerState.ATTACK, "right");
    } else if (moveVec.x < 0) {
      this.#lastDirection = -1;
      this.setAnimation(PlayerState.ATTACK, "left");
    } else {
      this.setAnimation(
        PlayerState.ATTACK,
        this.#lastDirection === 1 ? "right" : "left"
      );
    }
    this.upgrades.trigger(
      UpgradeTrigger.ON_ATTACK,
      new Vector(this.#lastDirection, 0)
    );
    this.attackUpdate(deltaTime);
  }

  doRoll(deltaTime: number, moveVec: Vector) {
    this.switchState(PlayerState.ROLL);
    this.#rollingInfo = {
      rollDir: moveVec,
      rollDuration: ROLL_DURATION,
    };
    if (moveVec.x > 0) {
      this.setAnimation(PlayerState.ROLL, "right");
    } else if (moveVec.x < 0) {
      this.setAnimation(PlayerState.ROLL, "left");
    } else {
      this.setAnimation(
        PlayerState.ROLL,
        this.#lastDirection === 1 ? "right" : "left"
      );
    }
    this.upgrades.trigger(UpgradeTrigger.ON_ROLL);
    this.rollUpdate(deltaTime);
  }

  onUpdate(deltaTime: number): void {
    this.updateCooldowns(deltaTime);
    this.upgrades.update(deltaTime);
    switch (this.#state) {
      case PlayerState.ATTACK:
        this.attackUpdate(deltaTime);
        break;

      case PlayerState.ROLL:
        this.rollUpdate(deltaTime);
        break;

      case PlayerState.IDLE:
      case PlayerState.RUN:
        const moveVec = this.getMovementVector();
        if (
          InputService.isKeyDown(" ") &&
          this.#attackInfo.attackCooldown === 0
        ) {
          this.doAttack(deltaTime, moveVec);
        } else if (
          InputService.isKeyDown("Shift") &&
          !moveVec.eq(new Vector())
        ) {
          this.doRoll(deltaTime, moveVec);
        } else {
          this.baseMovement(deltaTime);
        }
        break;
    }

    this.borderCheck();
  }

  render(context: CanvasRenderingContext2D) {}
}
