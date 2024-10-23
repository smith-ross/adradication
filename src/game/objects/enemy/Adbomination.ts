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
import Player from "../player/Player";

const MOVE_SPEED = 70;
const DIRECTION_WALK_TIME = 0.8;

export default class Adbomination extends RenderableGameObject {
  #playerRef: Player | undefined;
  #moveSpeed: number;
  #lockedOn: boolean = false;
  #walkDirection: Vector = new Vector();
  #elapsedWalkTime: number = 0;

  constructor(enemyProps: ImplementedRenderableObjectProps) {
    super({
      ...enemyProps,
      className: "Adbomination",
      children: [
        ...(enemyProps.children || []),
        new Box({
          id: "TestEnemyBox",
          color: new Color(255, 0, 0),
          size: enemyProps.size,
        }),
      ],
    });
    this.addChild(
      new HealthBar({
        id: "TestEnemyHealthBar",
        maxHealth: 100,
        position: new Vector(0, enemyProps.size ? enemyProps.size.y + 8 : 0),
        parent: this,
      })
    );
    this.#moveSpeed = MOVE_SPEED + (Math.random() * 40 - 20);
  }

  spawnAtRandomPoint(worldMap: WorldMap, player: Player) {
    const targetPoint = new Vector(
      Math.round(Math.random() * (worldMap.dimensions.x - 1)),
      Math.round(Math.random() * (worldMap.dimensions.y - 1))
    );
    const tile = worldMap.getTile(targetPoint);
    const newPosition = tile.position
      .mul(tile.size)
      .add(tile.size.sub(this.size));
    if (
      !tile ||
      tile.enemySpawned ||
      newPosition.sub(player.position).magnitude < 100
    ) {
      this.spawnAtRandomPoint(worldMap, player);
      return;
    }
    tile.enemySpawned = true;
    this.position = newPosition;
    this.#playerRef = player;
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

  onUpdate(deltaTime: number) {
    if (!this.#playerRef) return;
    if (
      !this.#lockedOn &&
      this.#playerRef.position.sub(this.position).magnitude > 150
    ) {
      if (this.#elapsedWalkTime >= DIRECTION_WALK_TIME && Math.random() > 0.5) {
        this.#elapsedWalkTime = 0;
        this.#walkDirection =
          (Math.random() > 0.5 &&
            new Vector(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2
            ).normalize()) ||
          new Vector(); // Stand still sometimes
      }
      this.position = this.position.add(
        this.#walkDirection.mul((deltaTime * this.#moveSpeed) / 4)
      );
      this.#elapsedWalkTime += deltaTime;
    } else {
      const moveVec = this.#playerRef.position
        .add(new Vector(0, this.#playerRef.size.y / 2))
        .sub(this.position)
        .normalize();
      this.position = this.position.add(
        moveVec.mul(deltaTime * this.#moveSpeed)
      );
      this.#lockedOn = true;
    }
    this.#borderCheck();
  }

  render(context: CanvasRenderingContext2D) {}
}
