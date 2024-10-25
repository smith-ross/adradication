import { draw, load } from "../../../util/DrawUtil";
import InputService from "../../services/InputService";
import Color from "../../types/Color";
import RenderableGameObject, {
  Corner,
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../AnimatedSprite";
import Box from "../Box";
import Empty from "../Empty";
import Adbomination from "../enemy/Adbomination";
import Hitbox from "../Hitbox";
import Sprite from "../Sprite";

const MOVE_SPEED = 100;
const ROLL_DURATION = 0.6;
const ROLL_SPEED = 100;
const BASE_SPRITE = "res/character-sprites/Run.png";
const ATTACK_DURATION = 0.45;
const ATTACK_COOLDOWN = 0.3;
const INVERTED_SPRITE = "res/character-sprites/ReversedRun.png";

enum PlayerMovementAction {
  RUN,
  ROLL,
  IDLE,
  ATTACK,
}
const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [PlayerMovementAction.ROLL]: {
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
  [PlayerMovementAction.ATTACK]: {
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
  [PlayerMovementAction.RUN]: {
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
  [PlayerMovementAction.IDLE]: {
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
};

interface PlayerProps extends ImplementedRenderableObjectProps {
  enemyContainer: Empty;
}

export default class Player extends RenderableGameObject {
  #rollingInfo = {
    isRolling: false,
    rollDuration: 0,
    rollDir: new Vector(),
  };
  #attackInfo: {
    isAttacking: boolean;
    attackDuration: number;
    attackCooldown: number;
    hitEnemies: Adbomination[];
  } = {
    isAttacking: false,
    attackDuration: 0,
    attackCooldown: 0,
    hitEnemies: [],
  };
  #sprite: AnimatedSprite | undefined;
  #lastDirection = 1;
  #enemyContainer: Empty;

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
        }),
        new Hitbox({
          id: "RightAttackHitbox",
          size: hitboxSize,
          origin: hitboxRightOffset,
        }),
      ],
      className: "Player",
    });
    this.#enemyContainer = playerProps.enemyContainer;
    if (!playerProps.size) return;
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

  setAnimation(animationType: PlayerMovementAction, dir: "right" | "left") {
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
  }

  #baseMovement(deltaTime: number): void {
    this.position = this.position.add(
      this.getMovementVector().mul(deltaTime * MOVE_SPEED)
    );
    if (!this.#sprite) return;
    const [x, y] = this.getMovementVector().asCoords();
    if (x < 0) {
      this.#lastDirection = -1;
      this.setAnimation(PlayerMovementAction.RUN, "left");
    } else if (x > 0) {
      this.#lastDirection = 1;
      this.setAnimation(PlayerMovementAction.RUN, "right");
    } else if (y !== 0) {
      this.setAnimation(
        PlayerMovementAction.RUN,
        this.#lastDirection === 1 ? "right" : "left"
      );
    } else {
      this.setAnimation(
        PlayerMovementAction.IDLE,
        this.#lastDirection === 1 ? "right" : "left"
      );
    }
  }

  #attack(deltaTime: number) {
    if (this.#attackInfo.attackDuration <= 0) {
      this.#attackInfo.isAttacking = false;
      this.onUpdate(deltaTime);
      return;
    }

    const chosenHitbox: Hitbox = this.getChild(
      this.#lastDirection === 1 ? "RightAttackHitbox" : "LeftAttackHitbox"
    ) as Hitbox;

    if (
      this.#attackInfo.attackDuration < 0.375 &&
      this.#attackInfo.attackDuration > 0.15
    ) {
      this.#enemyContainer.children.forEach((enemy) => {
        if (enemy.className !== "Adbomination") return;
        const target = enemy as Adbomination;
        if (
          !this.#attackInfo.hitEnemies.includes(target) &&
          !chosenHitbox.intersectsWith(
            target.getChild("EnemyHurtbox") as Hitbox
          )
        ) {
          const direction = target.position
            .add(this.size.div(2))
            .sub(this.position.add(this.size.div(2)))
            .normalize();
          this.#attackInfo.hitEnemies.push(target);
          target.onHit(34, 0.15, 1200, direction);
        }
      });
    }

    // Hitbox/collision detection here
    this.#attackInfo.attackDuration -= deltaTime;
  }

  #roll(deltaTime: number): void {
    if (this.#rollingInfo.rollDuration <= 0) {
      this.#rollingInfo.isRolling = false;
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

  onUpdate(deltaTime: number): void {
    if (!this.#attackInfo.isAttacking && this.#attackInfo.attackCooldown > 0) {
      this.#attackInfo.attackCooldown = Math.max(
        this.#attackInfo.attackCooldown - deltaTime,
        0
      );
    }
    if (!this.#rollingInfo.isRolling && !this.#attackInfo.isAttacking) {
      const moveVec = this.getMovementVector();
      if (
        InputService.isKeyDown(" ") &&
        this.#attackInfo.attackCooldown === 0
      ) {
        this.#attackInfo = {
          isAttacking: true,
          attackDuration: ATTACK_DURATION,
          attackCooldown: ATTACK_COOLDOWN,
          hitEnemies: [],
        };
        if (moveVec.x > 0) {
          this.#lastDirection = 1;
          this.setAnimation(PlayerMovementAction.ATTACK, "right");
        } else if (moveVec.x < 0) {
          this.#lastDirection = -1;
          this.setAnimation(PlayerMovementAction.ATTACK, "left");
        } else {
          this.setAnimation(
            PlayerMovementAction.ATTACK,
            this.#lastDirection === 1 ? "right" : "left"
          );
        }
        this.#attack(deltaTime);
      } else if (InputService.isKeyDown("Shift") && !moveVec.eq(new Vector())) {
        this.#rollingInfo = {
          isRolling: true,
          rollDir: moveVec,
          rollDuration: ROLL_DURATION,
        };
        if (moveVec.x > 0) {
          this.setAnimation(PlayerMovementAction.ROLL, "right");
        } else if (moveVec.x < 0) {
          this.setAnimation(PlayerMovementAction.ROLL, "left");
        } else {
          this.setAnimation(
            PlayerMovementAction.ROLL,
            this.#lastDirection === 1 ? "right" : "left"
          );
        }
        this.#roll(deltaTime);
      } else {
        this.#baseMovement(deltaTime);
      }
    } else if (this.#rollingInfo.isRolling) {
      this.#roll(deltaTime);
    } else {
      this.#attack(deltaTime);
    }
    this.#borderCheck();
  }

  render(context: CanvasRenderingContext2D) {}
}
