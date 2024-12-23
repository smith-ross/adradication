import { fireEvent, setEventVariable } from "../../../../util/GeneralUtil";
import Adradication from "../../../core/Adradication";
import InputService from "../../../services/InputService";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../../types/RenderableGameObject";
import Vector from "../../../types/Vector";
import Shadow from "../../entity/Shadow";
import Hitbox from "../../Hitbox";
import Sprite from "../../Sprite";
import Upgrade from "./Upgrade";

interface floatingUpgradePickupProps extends ImplementedRenderableObjectProps {
  upgrade: Upgrade;
}

export default class FloatingUpgradePickup extends RenderableGameObject {
  #upgrade: Upgrade;
  #floatVariance: number;
  #sinModifier: number = 0;
  #wasHighlighted: boolean = false;

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
        new Hitbox({
          id: "PickupHitbox",
          size: floatingUpgradePickupProps.size,
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
    const pickupHitbox = this.getChild("PickupHitbox") as Hitbox;
    const player = Adradication.getGame().player;
    const playerHitbox = player?.getChild("PlayerHurtbox") as Hitbox;
    if (!sprite || !player || !pickupHitbox || !playerHitbox) return;
    this.#sinModifier = (this.#sinModifier + deltaTime) % (2 * Math.PI);
    sprite.position = new Vector(
      0,
      Math.sin(this.#sinModifier) * this.#floatVariance
    );

    if (playerHitbox.intersectsWith(pickupHitbox)) {
      if (!this.#wasHighlighted) {
        this.#wasHighlighted = true;
        setEventVariable("HighlightedUpgrade", {
          upgradeName: this.#upgrade.getName(),
          upgradeDescription: this.#upgrade.getDescription(),
          upgradeIcon: this.#upgrade.getIcon(),
          highlighted: true,
        });
      }
    } else if (this.#wasHighlighted) {
      this.#wasHighlighted = false;
      setEventVariable("HighlightedUpgrade", { highlighted: false });
    }

    if (
      this.#wasHighlighted &&
      (InputService.isKeyDown("e") || InputService.isKeyDown("E"))
    ) {
      this.#upgrade.onPickup(player);
      this.destroy();
      setEventVariable("HighlightedUpgrade", { highlighted: false });
      fireEvent("continueNextWave", { chosenUpgrade: this.#upgrade });
    }
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
