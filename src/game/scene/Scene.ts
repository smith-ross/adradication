import { draw } from "../../util/DrawUtil";
import { ImplementedObjectProps } from "../types/GameObject";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";
import Layer from "./Layer";

interface SceneProps extends ImplementedRenderableObjectProps {
  layers: Layer[];
}

export default class Scene extends RenderableGameObject {
  #layers: Layer[];

  constructor({
    id,
    parent,
    children,
    size,
    position,
    layers,
    color,
  }: SceneProps) {
    super({
      id: id,
      className: "Scene",
      parent: parent,
      size: size,
      children: children,
      position: position,
      color: color,
    });
    this.#layers = layers || [];
  }

  get layers() {
    return this.#layers;
  }

  addLayer(newLayer: Layer) {
    this.layers.push(newLayer);
  }

  removeLayer(targetId: string) {
    this.#layers = this.#layers.filter((layer: Layer) => {
      return layer.id != targetId;
    });
  }

  render(context: CanvasRenderingContext2D) {
    draw(context, this.position, this.size, "Box", this.color);

    const sortedLayers = this.layers.sort((layerA: Layer, layerB: Layer) => {
      return layerA.zIndex - layerB.zIndex;
    });
    sortedLayers.forEach((layer) => {
      layer.recursiveRender(context);
    });
  }
}
