import _ from "lodash";

import { Rect, Vec2 } from "shared/math";
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
   * @param layout  Layout manager
   * @param maxSize Maximum size of container
   */
  constructor(layout=null, maxSize=new Rect()) {
    super(maxSize);

    // Children stack
    this.children = [];
    this.focus = null;

    // Spacing between items in  layout
    this.spacing = 5;
    this.layout = layout;
  }

  /**
   * Reassign children positions after remove
   * and add in linear layouts
   * @private
   */
  _reloadLayout() {
    this.focus = null;
    if(this.layout) {
      _.each(this.children, (item, index) => {
        item.rect.xy = !index? [0, 0] : this.layout(item, this.children[index - 1]);
      });
    }
    return this;
  }

  /**
   * Remove children from layer
   * @param child Child
   * @returns {Layer}
   */
  remove(child) {
    this.children = _.without(this.children, child);
    return this._reloadLayout();
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
      // Resize to rect width
      if(opts && opts.fill) {
        child.rect.wh = [
            (this.rect.w * opts.fill.x) || child.rect.w
          , (this.rect.h * opts.fill.y) || child.rect.h
        ];
        opts = _.omit(opts, "fill");
      }

      // Use layout placement
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

    _.each(this.children, child => {
      !child.disabled && child.draw(context);
    });

    context.ctx.restore();
  }

  /**
   * Event listener
   * @param event Event
   */
  onEvent(event) {
    // TODO: use clone
    if(event.isMouseEvent()) {
      // If layer has rect property check mousePos
      if(this.rect.w * this.rect.h && !this.rect.contains(event.data))
        return false;

      // Clone event
      event = new Message(
          event.type
        , event.creator
        , event.data.clone().sub(this.rect)
        , event.finalCallback
      );
    }

    // Cache focus index, faster than ==
    if(!this.focus || !this.focus.onEvent(event)) {
      let focusIndex = this.children.indexOf(this.focus);
      _.each(this.children, (child, index) => {
        !child.disabled && index != focusIndex && child.onEvent(event);
      });
    }
  }

  /** Update childs */
  update() {
    _.each(this.children, child => {
      !child.disabled && child.update && child.update();
    });
  }
}

/** Horizontal/Vertical box */
Layer.HBox = function(child, prev) { return prev.rect.clone().add(new Vec2(prev.rect.w + this.spacing, 0)).xy; };
Layer.VBox = function(child, prev) { return prev.rect.clone().add(new Vec2(0, prev.rect.h + this.spacing)).xy; };

/** Border box */
Layer.BorderBox = function(child, prev, opts) {
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