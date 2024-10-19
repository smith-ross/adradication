import { draw } from "../../util/DrawUtil";
import Color from "../types/Color";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";

interface ImageProps extends ImplementedRenderableObjectProps {
  imagePath: string;
}

export default class Sprite extends RenderableGameObject {
  imagePath: string;

  constructor(imgProps: ImageProps) {
    super({
      ...imgProps,
      className: "Sprite",
    });
    this.imagePath = imgProps.imagePath;
  }

  render(context: CanvasRenderingContext2D) {
    draw(
      context,
      this.getWorldPosition(),
      this.size,
      "Image",
      new Color(),
      chrome.runtime.getURL(this.imagePath)
    );
  }
}
