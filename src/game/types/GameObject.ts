import Adradication from "../core/Adradication";
import Layer from "../scene/Layer";
import Vector from "./Vector";

export interface ImplementedObjectProps {
  id: string;
  parent?: GameObject;
  children?: GameObject[];
  position?: Vector; // Offset from parent element,
  size?: Vector;
  origin?: Vector;
}

export interface GameObjectProps extends ImplementedObjectProps {
  className: string;
}

export default abstract class GameObject {
  #id: string;
  #className: string;
  parent: GameObject | undefined;
  #children: GameObject[];
  #position: Vector;
  #size: Vector;
  #origin: Vector;

  constructor({
    id,
    className,
    parent,
    children,
    position,
    size,
    origin,
  }: GameObjectProps) {
    this.#id = id;
    this.#className = className;
    this.parent = this.parent || parent;
    this.#children = children || [];
    this.#position = position || new Vector();
    this.#size = size || new Vector();
    this.#origin = origin || new Vector();
    children?.forEach((gameObject: GameObject) => {
      gameObject.parent = this;
    });
  }

  get id() {
    return this.#id;
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

  get origin() {
    return this.#origin;
  }

  set origin(value: Vector) {
    this.#origin = value;
  }

  set position(value: Vector) {
    this.#position = value;
  }

  set size(value: Vector) {
    this.#size = value;
  }

  getGame(): Adradication {
    return (this.getRoot() as Layer).game;
  }

  addChild(child: GameObject) {
    child.parent = this;
    this.children.push(child);
  }

  getRoot(): GameObject {
    if (this.parent) {
      return this.parent.getRoot();
    }
    return this;
  }

  isInTree() {
    return this.parent !== undefined;
  }

  removeChild(child: GameObject) {
    this.#children = this.children.filter((c) => c !== child);
  }

  getChild(childId: string) {
    return this.children.find((value) => {
      return value.id == childId;
    });
  }

  destroy() {
    this.parent?.children.splice(this.parent?.children.indexOf(this), 1);
    this.parent = undefined;
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
    return this.position.sub(this.#origin).add(this.parent.getWorldPosition());
  }

  recursiveUpdate(deltaTime: number) {
    this.onUpdate(deltaTime);
    for (const child of this.children) {
      child.recursiveUpdate(deltaTime);
    }
  }

  // Triggered before anything is rendered
  // Put any important pre-frame calculations here
  onUpdate(deltaTime: number) {}
}
