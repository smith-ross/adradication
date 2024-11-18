import { TextLabelProps, TextProps } from "../game/objects/TextLabel";
import Color from "../game/types/Color";
import Vector from "../game/types/Vector";

type DrawMode = "Box" | "Image" | "Text";

const imageCache: { [key: string]: HTMLImageElement } = {};

export const load = (imagePath: string) => {
  imagePath = chrome.runtime.getURL(imagePath);
  if (!imageCache[imagePath]) {
    const img: HTMLImageElement = new Image();
    img.src = imagePath;
    img.onerror = () => {
      console.error(`Failed to load image: ${imagePath}`);
      delete imageCache[imagePath];
    };
    if (!img.complete) {
      img.onload = () => {
        imageCache[imagePath] = img;
      };
    } else {
      imageCache[imagePath] = img;
    }
  }
};

export const draw = (
  context: CanvasRenderingContext2D,
  position: Vector,
  size: Vector,
  drawMode: DrawMode,
  color: Color,
  imagePath?: string,
  textProps?: Required<TextProps>
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

    case "Text":
      if (!textProps) return;
      context.font = `${textProps.fontSize}px ${textProps.font}`;
      context.textAlign = textProps.align;
      context.strokeStyle = color.toString();
      context.lineWidth = 1;
      context.strokeText(textProps.text, x, y, w);
      context.fillStyle = new Color(
        color.r / 2,
        color.g / 2,
        color.b / 2
      ).toString();
      context.fillText(textProps.text, x, y, w);
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
