import Vector from "./Vector";

export interface ImplementedObjectProps {
  id: string;
  parent?: GameObject;
  children?: GameObject[];
  position?: Vector; // Offset from parent element,
  size?: Vector;
}

export interface GameObjectProps extends ImplementedObjectProps {
  className: string;
}

export default abstract class GameObject {
  #id: string;
  #className: string;
  #parent: GameObject | undefined;
  #children: GameObject[];
  #position: Vector;
  #size: Vector;

  constructor({
    id,
    className,
    parent,
    children,
    position,
    size,
  }: GameObjectProps) {
    this.#id = id;
    this.#className = className;
    this.#parent = parent;
    this.#children = children || [];
    this.#position = position || new Vector();
    this.#size = size || new Vector();
  }

  get id() {
    return this.#id;
  }

  get parent() {
    return this.#parent;
  }
  get className() {
    return this.#className;
  }
  get children() {
    return this.#children;
  }

  get position() {
    return this.#position;
  }

  get size() {
    return this.#size;
  }

  getChild(childId: string) {
    return this.children.find((value) => {
      return value.id == childId;
    });
  }

  getDescendant(childId: string): GameObject | undefined {
    const foundChild = this.getChild(childId);
    if (foundChild) return foundChild;
    for (const child of this.children) {
      const foundDescendant = child.getDescendant(childId);
      if (foundDescendant) return foundDescendant;
    }
  }

  getWorldPosition(): Vector {
    if (!this.parent) return this.position;
    return this.position.add(this.parent.getWorldPosition());
  }
}
