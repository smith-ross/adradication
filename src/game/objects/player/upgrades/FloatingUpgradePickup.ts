import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../../types/RenderableGameObject";
import Vector from "../../../types/Vector";
import Shadow from "../../entity/Shadow";
import Sprite from "../../Sprite";
import Upgrade from "./Upgrade";

interface floatingUpgradePickupProps extends ImplementedRenderableObjectProps {
  upgrade: Upgrade;
}

export default class FloatingUpgradePickup extends RenderableGameObject {
  #upgrade: Upgrade;
  #floatVariance: number;
  #sinModifier: number = 0;

  constructor(floatingUpgradePickupProps: floatingUpgradePickupProps) {
    super({
      ...floatingUpgradePickupProps,
      className: "FloatingUpgradePickup",
      children: [
        ...(floatingUpgradePickupProps.children || []),
        new Sprite({
          id: "PickupSprite",
          size: floatingUpgradePickupProps.size,
          imagePath: floatingUpgradePickupProps.upgrade.getIcon(),
        }),
      ],
      position: floatingUpgradePickupProps.position || new Vector(),
    });
    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(this.size.x, 35),
        position: new Vector(0, this.size.y / 2 + 15),
        parent: this,
      })
    );
    this.#upgrade = floatingUpgradePickupProps.upgrade;
    this.#floatVariance = this.size.y / 6;
  }

  onUpdate(deltaTime: number): void {
    const sprite = this.getChild("PickupSprite");
    if (!sprite) return;
    this.#sinModifier = (this.#sinModifier + deltaTime) % (2 * Math.PI);
    sprite.position = new Vector(
      0,
      Math.sin(this.#sinModifier) * this.#floatVariance
    );
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
