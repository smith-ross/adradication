import Color from "../game/types/Color";
import Vector from "../game/types/Vector";

type DrawMode = "Box" | "Image" | "Text";

const imageCache: { [key: string]: HTMLImageElement } = {};

export const draw = (
  context: CanvasRenderingContext2D,
  position: Vector,
  size: Vector,
  drawMode: DrawMode,
  color: Color,
  imagePath?: string
) => {
  context.fillStyle = color.toString();
  const [x, y] = position.asCoords();
  const [w, h] = size.asCoords();

  switch (drawMode) {
    case "Box":
      context.fillRect(x, y, w, h);
      break;
    case "Image":
      if (!imagePath) {
        draw(context, position, size, "Box", color);
        return;
      }
      const img: HTMLImageElement = imageCache[imagePath] || new Image();
      if (!imageCache[imagePath]) {
        img.src = imagePath;
        img.onerror = () => {
          console.error(`Failed to load image: ${imagePath}`);
          delete imageCache[imagePath];
        };
        if (!img.complete) {
          img.onload = () => {
            context.drawImage(img, x, y, w, h);
            imageCache[imagePath] = img;
          };
        } else {
          imageCache[imagePath] = img;
          context.drawImage(img, x, y, w, h);
        }
      } else {
        context.drawImage(img, x, y, w, h);
      }

      break;
    default:
      break;
  }
};

export const drawAnimated = (
  context: CanvasRenderingContext2D,
  position: Vector,
  size: Vector,
  imagePath: string,
  cellWidth: number,
  cellHeight: number,
  currentFrame: Vector
) => {
  const [x, y] = position.asCoords();
  const [w, h] = size.asCoords();
  const img = imageCache[imagePath] || new Image();
  if (!imageCache[imagePath]) {
    img.src = imagePath;
    img.onload = () => {
      imageCache[imagePath] = img;
      console.log("Image loaded:", img.src);
      context.drawImage(
        img,
        currentFrame.x * cellWidth,
        currentFrame.y * cellHeight,
        cellWidth,
        cellHeight,
        x,
        y,
        w,
        h
      );
    };
    img.onerror = () => {
      console.error("Failed to load image:", imagePath);
    };
  } else {
    context.drawImage(
      imageCache[imagePath],
      currentFrame.x * cellWidth,
      currentFrame.y * cellHeight,
      cellWidth,
      cellHeight,
      x,
      y,
      w,
      h
    );
  }
};

// export const drawAnimated = (
//   context: CanvasRenderingContext2D,
//   position: Vector,
//   size: Vector,
//   imagePath: string,
//   cellWidth: number,
//   cellHeight: number,
//   currentFrame: Vector
// ) => {
//   const [x, y] = position.asCoords();
//   const img: HTMLImageElement = imageCache[imagePath] || new Image();
//   if (!imageCache[imagePath]) {
//     img.src = imagePath;
//     if (!img.complete) {
//       img.onload = () => {
//         imageCache[imagePath] = img;
//         context.drawImage(
//           imageCache[imagePath],
//           currentFrame.x - 1 * cellWidth,
//           currentFrame.y - 1 * cellHeight,
//           cellWidth,
//           cellHeight,
//           10,
//           30,
//           cellWidth,
//           cellHeight
//         );
//       };
//     } else {
//       imageCache[imagePath] = img;
//       context.drawImage(
//         imageCache[imagePath],
//         currentFrame.x * cellWidth,
//         currentFrame.y * cellHeight,
//         cellWidth,
//         cellHeight,
//         10,
//         30,
//         cellWidth,
//         cellHeight
//       );
//     }
//   } else {
//     console.log(imageCache[imagePath].src);
//     console.log(
//       imageCache[imagePath],
//       currentFrame.x * cellWidth,
//       currentFrame.y * cellHeight,
//       cellWidth,
//       cellHeight,
//       10,
//       30,
//       cellWidth,
//       cellHeight
//     );
//     context.drawImage(
//       imageCache[imagePath],
//       currentFrame.x * cellWidth,
//       currentFrame.y * cellHeight,
//       cellWidth,
//       cellHeight,
//       10,
//       30,
//       cellWidth,
//       cellHeight
//     );
//   }
// };
