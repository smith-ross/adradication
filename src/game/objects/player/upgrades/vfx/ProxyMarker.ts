import { ImplementedRenderableObjectProps } from "../../../../types/RenderableGameObject";
import Vector from "../../../../types/Vector";
import AnimatedSprite, { AnimationProps } from "../../../AnimatedSprite";
import Shadow from "../../../entity/Shadow";
import VFXEffect from "../../../generic-vfx/VFXEffect";

const ANIMATIONS: {
  [k: number]: { left: AnimationProps; right: AnimationProps };
} = {
  [0]: {
    right: {
      sheetPath: `res/upgrades/res/reverseProxyMarker.png`,
      dimensions: new Vector(14, 1),
      timeBetweenFrames: 0.2,
      cellSize: new Vector(50, 50),
    },
    left: {
      sheetPath: `res/upgrades/res/reverseProxyMarker.png`,
      dimensions: new Vector(14, 1),
      timeBetweenFrames: 0.2,
      cellSize: new Vector(50, 50),
    },
  },
};

export default class ProxyMarker extends VFXEffect {
  constructor(markerProps: ImplementedRenderableObjectProps) {
    super({
      spriteSize: new Vector(50, 50),
      infinite: true,
      origin: new Vector(25, 25),
      animationData: ANIMATIONS[0],
      ...markerProps,
    });
    this.addChild(
      new Shadow({
        id: "Shadow",
        size: new Vector(this.size.x / 1.5, 35),
        position: new Vector(0, this.size.y / 2 + 15),
        parent: this,
      })
    );
  }

  setActive(isActive: boolean) {
    if (!this.sprite) return;
    if (isActive) {
      this.sprite.sheetPath = "res/upgrades/res/reverseProxyMarkerActive.png";
    } else {
      this.sprite.sheetPath = "res/upgrades/res/reverseProxyMarker.png";
    }
  }

  render() {}
}
