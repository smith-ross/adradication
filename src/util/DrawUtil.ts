import Color from "../game/types/Color";
import Vector from "../game/types/Vector";

type DrawMode = "Box" | "Image" | "Text";

export const draw = (
  context: CanvasRenderingContext2D,
  position: Vector,
  size: Vector,
  drawMode: DrawMode,
  color: Color
) => {
  context.fillStyle = color.toString();
  const [x, y] = position.asCoords();
  const [w, h] = size.asCoords();

  switch (drawMode) {
    case "Box":
      context.fillRect(x, y, w, h);
      break;
    default:
      break;
  }
};
