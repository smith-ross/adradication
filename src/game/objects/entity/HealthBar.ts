import RenderableGameObject, {
  ImplementedRenderableObjectProps,
} from "../../types/RenderableGameObject";
import Box from "../Box";
import Vector from "../../types/Vector";
import Color from "../../types/Color";
import { HealthConstants } from "../../const/ConstantsManager";

interface HealthBarProps extends ImplementedRenderableObjectProps {
  maxHealth: number;
  destroyOnZero?: boolean;
}

const { HEALTH_BAR_SIZE, INNER_HEALTH_BAR_OFFSET } = HealthConstants;
const VECTOR_INNER_BAR_OFFSET = new Vector(...INNER_HEALTH_BAR_OFFSET);

export default class HealthBar extends RenderableGameObject {
  #maxHealth: number = 0;
  currentHealth: number = 0;
  #healthBarSize: Vector = new Vector();
  #destroyOnZero: boolean = false;

  constructor(healthBarProps: HealthBarProps) {
    if (!healthBarProps.parent) return;
    const healthBarSize = new Vector(
      healthBarProps.size?.x || healthBarProps.parent.size.x,
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
              size: healthBarSize.sub(VECTOR_INNER_BAR_OFFSET.mul(2)),
              position: VECTOR_INNER_BAR_OFFSET,
              color: new Color(100, 0, 0),
            }),
            new Box({
              id: `${healthBarProps.id}-inner-bar`,
              size: healthBarSize.sub(VECTOR_INNER_BAR_OFFSET.mul(2)),
              position: VECTOR_INNER_BAR_OFFSET,
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
    this.#destroyOnZero = !!healthBarProps.destroyOnZero;
    this.#maxHealth = healthBarProps.maxHealth;
    this.currentHealth = healthBarProps.maxHealth;
    this.#healthBarSize = healthBarSize;
  }

  setMaxHealth(value: number) {
    this.#maxHealth = value;
  }

  getMaxHealth() {
    return this.#maxHealth;
  }

  heal(amount: number) {
    this.currentHealth = Math.min(this.currentHealth + amount, this.#maxHealth);
    const innerHealthBar = this.getDescendant(`${this.id}-inner-bar`);
    if (!innerHealthBar) return;
    innerHealthBar.size = this.#healthBarSize
      .sub(VECTOR_INNER_BAR_OFFSET.mul(2))
      .mul(new Vector(this.currentHealth / this.#maxHealth, 1));
  }

  takeDamage(damage: number) {
    this.currentHealth = Math.max(this.currentHealth - damage, 0);
    const innerHealthBar = this.getDescendant(`${this.id}-inner-bar`);
    if (!innerHealthBar) return;
    innerHealthBar.size = this.#healthBarSize
      .sub(VECTOR_INNER_BAR_OFFSET.mul(2))
      .mul(new Vector(this.currentHealth / this.#maxHealth, 1));

    if (this.currentHealth === 0 && this.#destroyOnZero) this.parent?.destroy();
  }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {}
}
