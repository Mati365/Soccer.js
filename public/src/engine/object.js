import _ from "lodash";

import { Rect, Vec2 } from "../tools/math";
import Message from "./message";

/**
 * Engine child
 */
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
export class Layer extends Child {
  /**
   * @param maxSize Maximum size of container
   */
  constructor(maxSize=new Rect()) {
    super(maxSize);

    // Children stack
    this.children = [];
    this.focus = null;

    // Spacing between items in  layout
    this.spacing = 5;
    this.layout = Layer.BorderBox;
  }

  /**
   * Add child to layer
   * @param child Child
   * @param opts  Layout options
   * @returns {Layer}
   */
  add(child, opts) {
    child.layer = this;

    // If layout is present use it to organise position
    if(this.layout) {
      child.rect.xy = this.children.length || !_.isEmpty(opts)
        ? this.layout(child, _.last(this.children), opts)
        : [0, 0];
    }

    this.children.push(child);
    return this;
  }

  /**
   * Render children to canvas
   * @param context Canvas context
   */
  draw(context) {
    context.ctx.save();
    context.ctx.translate(this.rect.x, this.rect.y);

    for(let i = 0;i < this.children.length;++i)
      this.children[i].draw(context);

    context.ctx.restore();
  }

  /**
   * Event listener
   * @param event Event
   */
  onEvent(event) {
    // TODO: use clone
    if(event.isMouseEvent())
      event = new Message(
          event.type
        , event.creator
        , event.data.clone().sub(this.rect)
        , event.finalCallback
      );

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

/** Horizontal/Vertical box */
Layer.HBox = function(child, prev) { return prev.rect.clone().add(new Vec2(prev.rect.w + this.spacing, 0)).xy; };
Layer.VBox = function(child, prev) { return prev.rect.clone().add(new Vec2(0, prev.rect.h + this.spacing)).xy; };

/** Border box */
Layer.BorderBox = function(child, previous, opts) {
  return [
      Math.max(0, Math.min(this.rect.w * opts.align.x - child.rect.w / 2, this.rect.w - child.rect.w))
    , Math.max(0, Math.min(this.rect.h * opts.align.y - child.rect.h / 2, this.rect.h - child.rect.h))
  ];
};

/**
 * Engine state
 */
export class State extends Layer {
  /**
   * Init state, register resources
   */
  init() {}
}