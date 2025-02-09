import { isDebugMode } from "../../../util/GeneralUtil";
import { ImplementedRenderableObjectProps } from "../../types/RenderableGameObject";
import Vector from "../../types/Vector";
import { AnimationProps } from "../AnimatedSprite";
import Harvester from "../enemy/Harvester";
import Hitbox from "../Hitbox";
import VFXEffect from "./VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/enemy-sprites/Harvester/CastedAttack.png`,
      dimensions: new Vector(16, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(120, 93),
    },
    left: {
      sheetPath: `res/enemy-sprites/Harvester/CastedAttack.png`,
      dimensions: new Vector(16, 1),
      timeBetweenFrames: 0.08,
      cellSize: new Vector(120, 93),
    },
  },
};

export default class HarvesterClawEffect extends VFXEffect {
  #damage: number;
  #owner: Harvester;
  #hasHit: boolean = true;

  constructor(
    harvesterClawProps: ImplementedRenderableObjectProps,
    owner: Harvester,
    damage: number = 10
  ) {
    super({
      spriteSize: new Vector(240, 186),
      iterations: 1,
      animationData: ANIMATIONS[0],
      ...harvesterClawProps,
    });
    this.addChild(
      new Hitbox({
        id: "attackHitbox",
        origin: new Vector(25, 20),
        position: new Vector(110, 166),
        size: new Vector(50, 40),
        showVisual: isDebugMode(),
      })
    );

    this.#owner = owner;
    this.#damage = damage;
    // Only enable damage on hitbox windows
    setTimeout(() => (this.#hasHit = false), 600);
    setTimeout(() => (this.#hasHit = true), 1100);
  }

  onUpdate(deltaTime: number): void {
    const chosenHitbox = this.getChild("attackHitbox") as Hitbox;
    const target = this.#owner.playerRef!;
    if (
      !this.#hasHit &&
      chosenHitbox.intersectsWith(target.getChild("PlayerHurtbox") as Hitbox)
    ) {
      this.#hasHit = true;
      target.onHit(this.#damage, this.#owner);
    }
    super.onUpdate(deltaTime);
  }

  render() {}
}
