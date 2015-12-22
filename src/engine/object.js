import _ from "lodash";

import { Rect } from "../tools/math";

/** Engine child */
export class Child {
  constructor(rect) {
    this.rect = rect;
  }

  /**
   * Render children to canvas
   * @param ctx Canvas context
   */
  draw(ctx) {}

  /**
   * Event listener
   * @param event Event Data
   */
  onEvent(event) {}

  /** Update childs */
  update() {}
}

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
    child.layer = this;
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
   * @param event Event
   */
  onEvent(event) {
    _.each(this.childs, child => {
      child.onEvent(event);
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