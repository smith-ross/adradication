import Adradication from "../game/core/Adradication";
import VFXEffect from "../game/objects/generic-vfx/VFXEffect";

export const spawnEffect = (effect: VFXEffect) => {
  Adradication.getGame().loadedScene?.getLayer("VFX").addChild(effect);
};
