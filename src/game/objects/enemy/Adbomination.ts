import { draw } from "../../../util/DrawUtil";
import { difficulty } from "../../../util/GameUtil";
import { isDebugMode } from "../../../util/GeneralUtil";
import { transformStorage } from "../../../util/StorageUtil";
import Adradication from "../../core/Adradication";
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
import Timer from "../Timer";

const DIRECTION_WALK_TIME = 0.8;
const LOCK_ON_DISTANCE = 150;

export enum EnemyState {
  IDLE,
  IDLE_NO_UPDATE,
  CHASE,
  STUNNED,
  ATTACK,
  AVOID,
  SENTRY,
  PROJECTILE_ATTACK,
  DEATH,
  SPAWN,
  FADE_OUT,
  FADE_IN,
  CAST,
}

export interface KnockbackProps {
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
  health?: number;
  name: string;
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
  elapsedWalkTime: number = 0;
  scoreValue: number = 1;
  timers: Timer[] = [];
  tagPosition: Vector | undefined;
  name: string;
  singleton: boolean = false;

  stunInfo = {
    stunDuration: 0,
    activeDuration: 0,
    knockbackDuration: 0,
    knockbarDirection: new Vector(),
    knockbarForce: 0,
  };

  attackInfo = {
    attackDuration: 0,
    attackCooldown: 0,
    projectileAnimationDuration: 0,
    projectileAttackCooldown: 0,
    projectileShot: false,
    hit: false,
  };

  previousState: EnemyState = EnemyState.IDLE;
  #state: EnemyState = EnemyState.IDLE;
  #deathListeners: (() => void)[] = [];

  constructor(enemyProps: EnemyProps) {
    const hitboxSize = enemyProps.size?.mul(1.5).add(new Vector(10, 0));
    const hitboxLeftOffset = hitboxSize
      ?.sub(new Vector(0, hitboxSize.y / 2))
      .sub((enemyProps.size || new Vector()).div(2));
    const hitboxRightOffset = hitboxLeftOffset?.sub(new Vector(hitboxSize?.x));

    // Create entity and corresponding hitboxes
    super({
      ...enemyProps,
      className: "Adbomination",
      children: [
        ...(enemyProps.children || []),
        new Hitbox({
          id: "LeftAttackHitbox", // Hitbox of attack when facing left
          size: hitboxSize,
          origin: hitboxLeftOffset,
          showVisual: isDebugMode(),
        }),
        new Hitbox({
          id: "RightAttackHitbox", // Hitbox of attack when facing right
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
        maxHealth: enemyProps.health || 100,
        position: new Vector(0, enemyProps.size ? enemyProps.size.y + 8 : 0),
        parent: this,
        destroyOnZero: true,
      })
    );
    // In order to make every enemy a bit different,
    // vary the move speed randomly within given range
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
    this.name = enemyProps.name;
  }

  get state() {
    return this.#state;
  }

  get moveSpeed() {
    return this.#moveSpeed * (1 + (difficulty() - 1) * 0.5);
  }

  get lockOnDistance() {
    return this.#lockOnDistance;
  }

  get playerRef() {
    return this.#playerRef;
  }

  get attackRange() {
    return this.#attackRange;
  }

  addDeathListener(listener: () => void) {
    this.#deathListeners.push(listener);
  }

  // Updates positioning and size of hitboxes
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

  // Meant to be overriden, called when the enemy is spawned
  onSpawn() {}

  spawnAtFixedPoint(point: Vector, player: Player) {
    this.position = point;
    this.#playerRef = player;
    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    if (healthBar.currentHealth !== 10) {
      healthBar.setMaxHealth(healthBar.getMaxHealth() * difficulty());
      healthBar.heal(healthBar.getMaxHealth());
    }
    this.onSpawn();
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
    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    if (healthBar.currentHealth !== 10) {
      healthBar.setMaxHealth(healthBar.getMaxHealth() * difficulty());
      healthBar.heal(healthBar.getMaxHealth());
    }
    this.onSpawn();
  }

  switchState(newState: EnemyState): number | undefined {
    if (this.#state !== EnemyState.STUNNED) this.previousState = this.#state;
    this.#state = newState;
    return 0;
  }

  // Make sure the enemy is not travelling outside of the window range
  protected borderCheck() {
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
    const oldPosition = this.position;
    this.position = new Vector(newX, newY);
    if (!topLeftCorner.eq(this.position))
      this.elapsedWalkTime = DIRECTION_WALK_TIME; // Encourage the AI to walk a different way
    return !this.position.eq(oldPosition);
  }

  onHit(damage: number, stunDuration: number, knockback?: KnockbackProps) {
    const healthBar = this.getChild("EnemyHealthBar") as HealthBar;
    healthBar.takeDamage(damage, true);
    // Stun the enemy, stopping them from attacking for a period of time
    this.stun(stunDuration);
    // Apply knockback if possible
    if (knockback) this.applyKnockback(knockback);
    else
      this.applyKnockback({ duration: 0, force: 0, direction: new Vector() });

    // If dead
    if (healthBar.currentHealth <= 0) {
      // Play death animation, and then report death to background
      const time = this.switchState(EnemyState.DEATH);
      const newTimer = new Timer(time || 0, false, () => {
        this.destroy();
        this.timers = this.timers.filter((timer) => timer !== newTimer);
        const scoreValue = this.scoreValue;
        chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
          transformStorage({
            key: "pageScore-" + tabId.tab,
            modifierFn(originalValue) {
              return (originalValue || 0) + scoreValue;
            },
          });
        });
        this.#deathListeners.forEach((listener) => {
          listener();
        });
      });
      this.timers.push(newTimer);
    }
  }

  stun(duration: number) {
    this.switchState(EnemyState.STUNNED);
    this.stunInfo.stunDuration = duration;
    this.stunInfo.activeDuration = duration;
  }

  applyKnockback({ duration, direction, force }: KnockbackProps) {
    this.stunInfo.knockbackDuration = duration;
    this.stunInfo.knockbarDirection = direction;
    this.stunInfo.knockbarForce = force;
  }

  distanceFromPlayer() {
    if (!this.#playerRef) return -1;
    return this.#playerRef.position
      .add(new Vector(0, this.#playerRef.size.y / 4))
      .sub(this.position).magnitude;
  }

  walkDirectionUpdated() {}

  // Move in a random direction
  wander(deltaTime: number) {
    if (this.elapsedWalkTime >= DIRECTION_WALK_TIME && Math.random() > 0.5) {
      this.elapsedWalkTime = 0;
      this.walkDirection =
        (Math.random() > 0.5 &&
          new Vector(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ).normalize()) ||
        new Vector(); // Stand still sometimes

      this.walkDirectionUpdated();
    }
    this.position = this.position.add(
      this.walkDirection.mul((deltaTime * this.#moveSpeed) / 4)
    );
    this.elapsedWalkTime += deltaTime;
  }

  // onUpdate function for EnemyState.CHASE
  // Keep running at the player until close enough to attack
  protected chaseUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    const moveVec = this.#playerRef.position
      .add(new Vector(0, this.#playerRef.size.y / 4))
      .sub(this.position)
      .normalize();
    this.walkDirection = moveVec;
    this.walkDirectionUpdated();
    if (this.distanceFromPlayer() <= this.#attackRange) {
      if (this.attackInfo.attackCooldown <= 0) {
        this.switchState(EnemyState.ATTACK);
        this.doAttack(deltaTime);
      }
    } else {
      this.position = this.position.add(
        moveVec.mul(deltaTime * this.#moveSpeed)
      );
    }
  }

  // Register attack parameters
  doAttack(deltaTime: number) {
    this.attackInfo = {
      attackDuration: this.#attackDuration,
      attackCooldown: this.#attackCooldown,
      projectileAnimationDuration: 0,
      projectileAttackCooldown: 0,
      projectileShot: false,
      hit: false,
    };
    this.attackUpdate(deltaTime);
  }

  // onUpdate function for EnemyState.ATTACK
  // Test hitbox in given attack range, and once over, swap back to chase.
  protected attackUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    if (this.attackInfo.attackDuration <= 0) {
      this.switchState(EnemyState.CHASE);
      this.onUpdate(deltaTime);
      return;
    }

    const chosenHitbox: Hitbox = this.getChild(
      this.walkDirection.x > 0 ? "RightAttackHitbox" : "LeftAttackHitbox"
    ) as Hitbox;

    if (
      this.attackInfo.attackDuration < this.#damageWindow.start &&
      this.attackInfo.attackDuration > this.#damageWindow.end
    ) {
      const target = this.#playerRef;
      if (
        !this.attackInfo.hit &&
        chosenHitbox.intersectsWith(target.getChild("PlayerHurtbox") as Hitbox)
      ) {
        this.attackInfo.hit = true;
        target.onHit(this.#attackDamage * difficulty(), this);
      }
    }
    this.attackInfo.attackDuration -= deltaTime;
  }

  // onUpdate function for EnemyState.STUN
  // Gradually dampen knockback, and then return to previous state
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
      this.switchState(this.previousState);
    }
  }

  // Main state controller
  onUpdate(deltaTime: number) {
    // Service any registered timers
    this.timers.forEach((timer) => timer.service(deltaTime));
    // Service attack cooldown
    if (
      this.#state !== EnemyState.ATTACK &&
      this.attackInfo.attackCooldown > 0
    ) {
      this.attackInfo.attackCooldown = Math.max(
        this.attackInfo.attackCooldown - deltaTime,
        0
      );
    }
    // Service state
    switch (this.#state) {
      case EnemyState.IDLE:
        // Wander until close enough to chase
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

      default:
        break;
    }

    // Check enemy is within map range
    this.borderCheck();
  }

  render(context: CanvasRenderingContext2D) {}
}
