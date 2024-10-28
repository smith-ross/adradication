import { draw } from "../../../util/DrawUtil";
import WorldMap from "../../map/WorldMap";
import Color from "../../types/Color";
import RenderableGameObject, {
  Corner,
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import Box from "../Box";
import HealthBar from "../entity/HealthBar";
import Hitbox from "../Hitbox";
import Player from "../player/Player";

const MOVE_SPEED = 70;
const DIRECTION_WALK_TIME = 0.8;
const ATTACK_RANGE = 20;
const ATTACK_DURATION = 1;
const DAMAGE_WINDOW = { START: 0.8, END: 0.2 };
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

export default class Adbomination extends RenderableGameObject {
  #playerRef: Player | undefined;
  #moveSpeed: number;
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

  constructor(enemyProps: ImplementedRenderableObjectProps) {
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
          showVisual: true,
        }),
        new Hitbox({
          id: "RightAttackHitbox",
          size: hitboxSize,
          origin: hitboxRightOffset,
          showVisual: true,
        }),
        new Hitbox({
          id: "EnemyHurtbox",
          size: enemyProps.size,
          showVisual: true,
        }),
      ],
    });
    this.addChild(
      new HealthBar({
        id: "EnemyHealthBar",
        maxHealth: 100,
        position: new Vector(0, enemyProps.size ? enemyProps.size.y + 8 : 0),
        parent: this,
      })
    );
    this.#moveSpeed = MOVE_SPEED + (Math.random() * 40 - 20);
  }

  get state() {
    return this.#state;
  }

  calculateHitbox(width: number) {
    const hitboxSize = this.size?.mul(1.5).add(new Vector(width, 0));
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

  #borderCheck() {
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
      this.walkDirectionUpdated();
    }
    this.position = this.position.add(
      this.walkDirection.mul((deltaTime * this.#moveSpeed) / 4)
    );
    this.#elapsedWalkTime += deltaTime;
  }

  #chaseUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    const moveVec = this.#playerRef.position
      .add(new Vector(0, this.#playerRef.size.y / 4))
      .sub(this.position)
      .normalize();
    this.walkDirection = moveVec;
    this.walkDirectionUpdated();
    this.position = this.position.add(moveVec.mul(deltaTime * this.#moveSpeed));
    if (this.distanceFromPlayer() <= ATTACK_RANGE) {
      this.switchState(EnemyState.ATTACK);
      this.doAttack(deltaTime);
    }
  }

  doAttack(deltaTime: number) {
    this.#attackInfo = {
      attackDuration: ATTACK_DURATION,
      attackCooldown: 0.2,
      hit: false,
    };
    this.#attackUpdate(deltaTime);
  }

  #attackUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    if (this.#attackInfo.attackDuration <= 0) {
      this.switchState(EnemyState.IDLE);
      this.onUpdate(deltaTime);
      return;
    }
    if (
      this.#attackInfo.attackDuration < DAMAGE_WINDOW.START &&
      this.#attackInfo.attackDuration > DAMAGE_WINDOW.END
    ) {
      // Do collision
    } else {
      // Don't
    }
    this.#attackInfo.attackDuration -= deltaTime;
  }

  #stunUpdate(deltaTime: number) {
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
    switch (this.#state) {
      case EnemyState.IDLE:
        this.wander(deltaTime);
        if (this.distanceFromPlayer() <= LOCK_ON_DISTANCE)
          this.switchState(EnemyState.CHASE);
        break;

      case EnemyState.CHASE:
        this.#chaseUpdate(deltaTime);
        break;

      case EnemyState.STUNNED:
        this.#stunUpdate(deltaTime);
        break;

      case EnemyState.ATTACK:
        this.#attackUpdate(deltaTime);
        break;
    }

    this.#borderCheck();
  }

  render(context: CanvasRenderingContext2D) {}
}
