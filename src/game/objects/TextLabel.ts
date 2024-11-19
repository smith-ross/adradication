import { draw } from "../../util/DrawUtil";
import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../types/RenderableGameObject";

type TextAlign = "start" | "end" | "left" | "right" | "center";
export interface TextProps {
  text: string;
  fontSize: number; // px
  font: string;
  align?: TextAlign;
}
export interface TextLabelProps
  extends ImplementedRenderableObjectProps,
    TextProps {}

export default class TextLabel extends RenderableGameObject {
  #text: string;
  #fontSize: number;
  #font: string;
  #align: TextAlign;

  constructor(textProps: TextLabelProps) {
    super({
      ...textProps,
      className: "TextLabel",
    });
    this.#text = textProps.text;
    this.#fontSize = textProps.fontSize;
    this.#font = textProps.font;
    this.#align = textProps.align || "start";
  }

  render(context: CanvasRenderingContext2D) {
    draw(
      context,
      this.getWorldPosition(),
      this.size,
      "Text",
      this.color,
      undefined,
      {
        text: this.#text,
        fontSize: this.#fontSize,
        font: this.#font,
        align: this.#align,
      }
    );
  }
}
