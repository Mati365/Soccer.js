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
    this.children = [];
    this.layout = null;
    this.focus = null;
  }

  /**
   * Add child to layer
   * @param child Child
   * @returns {Layer}
   */
  add(child) {
    child.layer = this;

    this.layout && this.layout(this.children, child);
    this.children.push(child);
    return this;
  }

  /**
   * Render children to canvas
   * @param context Canvas context
   */
  draw(context) {
    for(let i = 0;i < this.children.length;++i)
      this.children[i].draw(context);
  }

  /**
   * Event listener
   * @param event Event
   */
  onEvent(event) {
    if(!this.focus || !this.focus.onEvent(event))
      _.each(this.children, child => {
        child.onEvent(event);
      });
  }

  /** Update childs */
  update() {
    for(let i = 0;i < this.children.length;++i)
      this.children[i].update && this.children[i].update();
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