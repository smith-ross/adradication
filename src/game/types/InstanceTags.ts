enum TagType {
  TIMED,
  PERMANENT,
}

interface Tag {
  id?: string;
  type: TagType;
  value: string | object | number;
  duration?: number;
  onUpdate?: (deltaTime: number) => void;
}

export default class InstanceTags {
  #tags: Tag[];

  constructor(defaultTags: Tag[] = []) {
    this.#tags = [...defaultTags];
  }

  hasTag(value: string | object | number) {
    return (
      this.#tags.filter((tag) => {
        return tag.value === value;
      }).length > 0
    );
  }

  addTag(newTag: Tag) {
    this.#tags.push(newTag);
  }

  removeTag(tag: Tag) {
    if (!this.#tags.includes(tag))
      throw "Tag Error: Attempt to remove tag that does not exist on instance";
    this.#tags.splice(this.#tags.indexOf(tag), 1);
  }

  removeTagById(tagId: string) {
    const initLength = this.#tags.length;
    this.#tags = this.#tags.filter((tag) => {
      return tag.id !== tagId;
    });
    return initLength - this.#tags.length;
  }

  onUpdate(deltaTime: number) {
    const expiredTags: Tag[] = [];
    this.#tags.forEach((tag) => {
      if (tag.type === TagType.TIMED && (!tag.duration || tag.duration <= 0)) {
        expiredTags.push(tag);
        return;
      }
      if (tag.onUpdate) tag.onUpdate(deltaTime);
      if (tag.duration) tag.duration -= deltaTime;
    });
    expiredTags.forEach((tag) => {
      this.removeTag(tag);
    });
  }
}
