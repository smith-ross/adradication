import Adradication from "../core/Adradication";
import GameObject, { ImplementedObjectProps } from "../types/GameObject";
import RenderableGameObject from "../types/RenderableGameObject";

interface LayerProps extends ImplementedObjectProps {
  zIndex: number;
  game: Adradication;
}

export default class Layer extends RenderableGameObject {
  zIndex: number;
  game: Adradication;

  constructor({
    id,
    parent,
    children,
    position,
    zIndex = 0,
    game,
  }: LayerProps) {
    super({
      id: id,
      className: "Layer",
      parent: parent,
      children: children,
      position: position,
    });
    this.zIndex = zIndex;
    this.game = game;
  }

  render(_: CanvasRenderingContext2D) {}
}
