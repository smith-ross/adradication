import { draw } from "../../../util/DrawUtil";
import { isDebugMode } from "../../../util/GeneralUtil";
import { transformStorage } from "../../../util/StorageUtil";
import WorldMap from "../../map/WorldMap";
import Color from "../../types/Color";
import RenderableGameObject, {
  Corner,
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import HealthBar from "../entity/HealthBar";
import Hitbox from "../Hitbox";
import Player from "../player/Player";

const DIRECTION_WALK_TIME = 0.8;
const LOCK_ON_DISTANCE = 150;

export enum EnemyState {
  IDLE,
  CHASE,
  STUNNED,
  ATTACK,
}

interface KnockbackProps {
  duration: number;
  direction: Vector;
  force: number;
}

interface EnemyProps extends ImplementedRenderableObjectProps {
  moveSpeed: number;
  moveSpeedVariance?: number;
  attackRange: number;
  attackDuration: number;
  damageWindow: { start: number; end: number };
  lockOnDistance?: number;
  attackCooldown: number;
  attackDamage: number;
}

export default class Adbomination extends RenderableGameObject {
  #playerRef: Player | undefined;
  #moveSpeed: number;
  #attackRange: number;
  #attackDuration: number;
  #damageWindow: { start: number; end: number };
  #lockOnDistance: number;
  #attackCooldown: number;
  #attackDamage: number;
  walkDirection: Vector = new Vector();
  #elapsedWalkTime: number = 0;

  #stunInfo = {
    stunDuration: 0,
    activeDuration: 0,
    knockbackDuration: 0,
    knockbarDirection: new Vector(),
    knockbarForce: 0,
  };

  #attackInfo = {
    attackDuration: 0,
    attackCooldown: 0,
    hit: false,
  };

  #previousState: EnemyState = EnemyState.IDLE;
  #state: EnemyState = EnemyState.IDLE;
  #deathListeners: (() => void)[] = [];

  constructor(enemyProps: EnemyProps) {
    const hitboxSize = enemyProps.size?.mul(1.5).add(new Vector(10, 0));
    const hitboxLeftOffset = hitboxSize
      ?.sub(new Vector(0, hitboxSize.y / 2))
      .sub((enemyProps.size || new Vector()).div(2));
    const hitboxRightOffset = hitboxLeftOffset?.sub(new Vector(hitboxSize?.x));

    super({
      ...enemyProps,
      className: "Adbomination",
      children: [
        ...(enemyProps.children || []),
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
          id: "EnemyHurtbox",
          size: enemyProps.size,
          showVisual: isDebugMode(),
        }),
      ],
    });
    this.addChild(
      new HealthBar({
        id: "EnemyHealthBar",
        maxHealth: 100,
        position: new Vector(0, enemyProps.size ? enemyProps.size.y + 8 : 0),
        parent: this,
        destroyOnZero: true,
      })
    );
    this.#moveSpeed =
      enemyProps.moveSpeed +
      (Math.random() * ((enemyProps.moveSpeedVariance || 0) * 2) -
        (enemyProps.moveSpeedVariance || 0));

    this.#attackRange = enemyProps.attackRange;
    this.#attackCooldown = enemyProps.attackCooldown;
    this.#attackDuration = enemyProps.attackDuration;
    this.#damageWindow = enemyProps.damageWindow;
    this.#lockOnDistance = enemyProps.lockOnDistance || LOCK_ON_DISTANCE;
    this.#attackDamage = enemyProps.attackDamage;
  }

  get state() {
    return this.#state;
  }

  addDeathListener(listener: () => void) {
    this.#deathListeners.push(listener);
  }

  calculateHitbox(width: number) {
    const hitboxSize = this.size
      ?.mul(new Vector(1.5, 1))
      .add(new Vector(width, 0));
    const hitboxLeftOffset = hitboxSize
      ?.sub(new Vector(0, hitboxSize.y / 2))
      .sub((this.size || new Vector()).div(2));
    const hitboxRightOffset = hitboxLeftOffset?.sub(new Vector(hitboxSize?.x));
    (this.getChild("LeftAttackHitbox") as Hitbox).size = hitboxSize;
    (this.getChild("LeftAttackHitbox") as Hitbox).origin = hitboxLeftOffset;
    (this.getChild("RightAttackHitbox") as Hitbox).size = hitboxSize;
    (this.getChild("RightAttackHitbox") as Hitbox).origin = hitboxRightOffset;
  }

  spawnAtRandomPoint(worldMap: WorldMap, player: Player) {
    const tileOptions = worldMap.collectAvailableTiles(player.position);
    if (tileOptions.length === 0) return;
    const tile = tileOptions[Math.floor(Math.random() * tileOptions.length)];
    const newPosition = tile.position
      .mul(tile.size)
      .add(tile.size.sub(this.size));
    tile.enemySpawned = true;
    this.position = newPosition;
    this.#playerRef = player;
  }

  switchState(newState: EnemyState) {
    this.#previousState = this.#state;
    this.#state = newState;
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
    if (!topLeftCorner.eq(this.position))
      this.#elapsedWalkTime = DIRECTION_WALK_TIME; // Encourage the AI to walk a different way
  }

  onHit(damage: number, stunDuration: number, knockback?: KnockbackProps) {
    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    healthBar.takeDamage(damage);
    this.stun(stunDuration);
    if (knockback) this.applyKnockback(knockback);
    if (healthBar.currentHealth <= 0) {
      this.#deathListeners.forEach((listener) => {
        listener();
      });
      chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
        transformStorage({
          key: "pageScore-" + tabId.tab,
          modifierFn(originalValue) {
            return (originalValue || 0) + 1;
          },
        });
      });
    }
  }

  stun(duration: number) {
    this.switchState(EnemyState.STUNNED);
    this.#stunInfo.stunDuration = duration;
    this.#stunInfo.activeDuration = duration;
  }

  applyKnockback({ duration, direction, force }: KnockbackProps) {
    this.#stunInfo.knockbackDuration = duration;
    this.#stunInfo.knockbarDirection = direction;
    this.#stunInfo.knockbarForce = force;
  }

  distanceFromPlayer() {
    if (!this.#playerRef) return -1;
    return this.#playerRef.position
      .add(new Vector(0, this.#playerRef.size.y / 4))
      .sub(this.position).magnitude;
  }

  walkDirectionUpdated() {}

  wander(deltaTime: number) {
    if (this.#elapsedWalkTime >= DIRECTION_WALK_TIME && Math.random() > 0.5) {
      this.#elapsedWalkTime = 0;
      this.walkDirection =
        (Math.random() > 0.5 &&
          new Vector(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ).normalize()) ||
        new Vector(); // Stand still sometimes

      if (!this.walkDirection.eq(new Vector())) this.walkDirectionUpdated();
    }
    this.position = this.position.add(
      this.walkDirection.mul((deltaTime * this.#moveSpeed) / 4)
    );
    this.#elapsedWalkTime += deltaTime;
  }

  private chaseUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    const moveVec = this.#playerRef.position
      .add(new Vector(0, this.#playerRef.size.y / 4))
      .sub(this.position)
      .normalize();
    this.walkDirection = moveVec;
    this.walkDirectionUpdated();
    if (this.distanceFromPlayer() <= this.#attackRange) {
      if (this.#attackInfo.attackCooldown <= 0) {
        this.switchState(EnemyState.ATTACK);
        this.doAttack(deltaTime);
      }
    } else {
      this.position = this.position.add(
        moveVec.mul(deltaTime * this.#moveSpeed)
      );
    }
  }

  doAttack(deltaTime: number) {
    this.#attackInfo = {
      attackDuration: this.#attackDuration,
      attackCooldown: this.#attackCooldown,
      hit: false,
    };
    this.attackUpdate(deltaTime);
  }

  private attackUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    if (this.#attackInfo.attackDuration <= 0) {
      this.switchState(EnemyState.CHASE);
      this.onUpdate(deltaTime);
      return;
    }

    const chosenHitbox: Hitbox = this.getChild(
      this.walkDirection.x > 0 ? "RightAttackHitbox" : "LeftAttackHitbox"
    ) as Hitbox;

    if (
      this.#attackInfo.attackDuration < this.#damageWindow.start &&
      this.#attackInfo.attackDuration > this.#damageWindow.end
    ) {
      const target = this.#playerRef;
      if (
        !this.#attackInfo.hit &&
        !chosenHitbox.intersectsWith(target.getChild("PlayerHurtbox") as Hitbox)
      ) {
        this.#attackInfo.hit = true;
        target.onHit(this.#attackDamage);
      }
    }
    this.#attackInfo.attackDuration -= deltaTime;
  }

  private stunUpdate(deltaTime: number) {
    const knockbackThreshold =
      this.#stunInfo.stunDuration - this.#stunInfo.knockbackDuration;
    if (this.#stunInfo.activeDuration > knockbackThreshold) {
      this.position = this.position.add(
        this.#stunInfo.knockbarDirection.mul(
          this.#stunInfo.knockbarForce *
            (this.#stunInfo.activeDuration / knockbackThreshold) *
            deltaTime
        )
      );
    }
    this.#stunInfo.activeDuration -= deltaTime;
    if (this.#stunInfo.activeDuration <= 0) {
      this.switchState(this.#previousState);
    }
  }

  onUpdate(deltaTime: number) {
    if (
      this.#state !== EnemyState.ATTACK &&
      this.#attackInfo.attackCooldown > 0
    ) {
      this.#attackInfo.attackCooldown = Math.max(
        this.#attackInfo.attackCooldown - deltaTime,
        0
      );
    }
    switch (this.#state) {
      case EnemyState.IDLE:
        this.wander(deltaTime);
        if (this.distanceFromPlayer() <= this.#lockOnDistance)
          this.switchState(EnemyState.CHASE);
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

  render(context: CanvasRenderingContext2D) {}
}
