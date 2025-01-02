import Adradication from "../game/core/Adradication";
import VFXEffect from "../game/objects/generic-vfx/VFXEffect";

export const spawnEffect = (effect: VFXEffect) => {
  layer("VFX").addChild(effect);
  return effect;
};

export const layer = (layerId: string) => {
  const layer = Adradication.getGame().loadedScene?.getLayer(layerId);
  if (!layer) throw `Failed to fetch layer with ID ${layer}`;
  return layer;
};
