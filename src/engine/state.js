/**
 * Array of elements
 */
export class Layer {
  constructor() {
    this.childs = [];
  }

  /**
   * Add child to layer
   * @param child Child
   * @returns {Layer}
   */
  add(child) {
    child.parent = this;
    this.childs.push(child);
    return this;
  }

  /**
   * Render children to canvas
   * @param ctx Canvas context
   */
  draw(ctx) {
    for(let i = 0;i < this.childs.length;++i)
      this.childs[i].draw(ctx);
  }

  /**
   * Event listener
   * @param data Event Data
   */
  onEvent(data) {
    _(this.childs).each(child => {
      child.onEvent(data);
    });
  }

  /** Update childs */
  update() {
    for(let i = 0;i < this.childs.length;++i)
      this.childs[i].update && this.childs[i].update();
  }
}

/**
 * Engine state
 */
export class State extends Layer {
  /**
   * Init state, register resources
   */
  init() {}
}