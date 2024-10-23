import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Box from "../Box";
import Vector from "../../types/Vector";
import Color from "../../types/Color";

interface HealthBarProps extends ImplementedRenderableObjectProps {
  maxHealth: number;
}

const HEALTH_BAR_SIZE = 8;
const INNER_HEALTH_BAR_OFFSET = new Vector(2, 2);

export default class HealthBar extends RenderableGameObject {
  #maxHealth: number = 0;
  #currentHealth: number = 0;

  constructor(healthBarProps: HealthBarProps) {
    if (!healthBarProps.parent) return;
    const healthBarSize = new Vector(
      healthBarProps.parent.size.x,
      HEALTH_BAR_SIZE
    ).div(1.2);
    super({
      ...healthBarProps,
      className: "HealthBar",
      children: [
        ...(healthBarProps.children || []),
        new Box({
          id: `${healthBarProps.id}-container`,
          size: healthBarSize,
          color: new Color(20, 20, 20),
          children: [
            new Box({
              id: `${healthBarProps.id}-bg-bar`,
              size: healthBarSize.sub(INNER_HEALTH_BAR_OFFSET.mul(2)),
              position: INNER_HEALTH_BAR_OFFSET,
              color: new Color(100, 0, 0),
            }),
            new Box({
              id: `${healthBarProps.id}-inner-bar`,
              size: healthBarSize.sub(INNER_HEALTH_BAR_OFFSET.mul(2)),
              position: INNER_HEALTH_BAR_OFFSET,
              color: new Color(0, 200, 0),
            }),
          ],
        }),
      ],
      position: (healthBarProps.position || new Vector()).add(
        new Vector(healthBarProps.parent.size.x / 2, 0).sub(
          new Vector(healthBarSize.x / 2, 0)
        )
      ),
    });
    this.#maxHealth = healthBarProps.maxHealth;
    this.#currentHealth = healthBarProps.maxHealth;
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
