import _ from "lodash";

import { Rect, Vec2 } from "shared/math";
import Message from "./message";

/**
 * Engine child
 */
export class Child {
  constructor(rect) {
    this.rect = rect;

    this.border = new Vec2;
    this.padding = new Vec2;
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
    this.popup = null;

    // Spacing between items in  layout
    this.border.xy = [2, 2];
    this.layout = layout;

    // If false children wont receive any events
    this.eventForwarding = true;
  }

  /**
   * Resources to be preloaded after init
   * @returns {Array}
   */
  get assets() {
    return {};
  }

  /**
   * Init panel
   */
  init() {}

  /**
   * Generate first child starting position with padding
   * @param child Child
   * @returns {Vec2}
   * @private
   */
  _genChildPadding(child) {
    return this.padding.clone().add(child.border);
  }

  /**
   * Reassign children positions after remove, only for VBOX/HBOX
   * and add in linear layouts
   * @private
   */
  _reloadLayout() {
    this.popup = null;
    if(this.layout) {
      _.each(this.children, (item, index) => {
        item.rect.xy = !index ? this._genChildPadding(item).xy : this.layout(item, this.children[index - 1]);
      });
    }
    return this;
  }

  /**
   * Set layer as popup object
   * @param popup  Popup, null if close popup
   * @returns {Popup}
   */
  showPopup(popup) {
    // Center popup on screen
    if(popup) {
      this
        ._makeChildOwner(popup)
        .rect.xy = [
            this.rect.w / 2 - popup.rect.w / 2
          , this.rect.h / 2 - popup.rect.h / 2
        ];
    }
    return this.popup = popup;
  }

  /**
   * Remove children from layer
   * @param child Child
   * @returns {Layer}
   */
  remove(child) {
    return _.remove(this.children, child) && this._reloadLayout();
  }

  /**
   * Remove all children
   * @returns {Layer}
   */
  clear() {
    this.children = [];
    this._reloadLayout();
    return this;
  }

  /**
   * Make object as a child
   * @param child Child
   * @returns {Child}
   * @private
   */
  _makeChildOwner(child) {
    child.layer = this;
    child.canvas = this.canvas;
    return child;
  }
  /**
   * Add child to layer
   * @param child Child
   * @param opts  Layout options
   * @returns {Child}
   */
  add(child, opts) {
    this._makeChildOwner(child);

    // If layout is present use it to organise position
    if(this.layout) {
      let padding = this._genChildPadding(child);

      // Change border of child
      if(opts && !_.isUndefined(opts.border))
        child.border.xy = !opts.border ? [0, 0] : opts.border;

      // Remove optional opts
      if(!opts || opts.useLayout !== false) {
        // Use layout placement
        child.rect.xy = this.layout(child, _.last(this.children), opts) || padding.xy;

        // Disable smoothing
        child.rect.xy = [
            parseInt(child.rect.x)
          , parseInt(child.rect.y)
        ];
      }

      // Optional layout params
      if(opts && opts.fill) {
        // Calc filling size for every axis
        let calcInnerSize = axis => {
          let fill = opts.fill[+(axis === "y")]
            , sizeParam = axis === "y" ? "h" : "w";
          if(fill)
            return Math.min(this.rect[sizeParam] - child.rect[axis] - padding[axis], (this.rect[sizeParam] - padding[axis] * 2) * fill);
          else
            return child.rect[sizeParam];
        };

        // Placement of child
        child.rect.wh = [
            parseInt(calcInnerSize("x"))
          , parseInt(calcInnerSize("y"))
        ];
      }
    }

    // Init children
    this.children.push(child);
    child.init && child.init();
    return child;
  }

  /** @inheritdoc */
  draw(context) {
    if(this.debugLayer)
      context
        .strokeWith("#00ff00")
        .strokeRect(this.rect);

    context.ctx.save();
    context.ctx.translate(this.rect.x, this.rect.y);

    _.each(this.children, child => {
      !child.disabled && child.draw(context);
    });
    if(this.popup) {
      context
        .fillWith("rgba(0, 0, 0, .75")
        .fillRect(new Rect(0, 0, this.rect.w, this.rect.h));
      this.popup.draw(context);
    }

    context.ctx.restore();
  }

  /**
   * Redirect event to children
   * @param event Event
   */
  onEvent(event) {
    // TODO: use clone
    if(event.isMouseEvent()) {
      // If layer has rect property check mousePos
      if(!this.popup && this.rect.w * this.rect.h && !this.rect.contains(event.data))
        return false;

      // Clone event
      event = new Message(
          event.type
        , event.creator
        , event.data.clone().sub(this.rect)
        , event.finalCallback
      );
    }

    // Popup receive event first
    if(this.popup)
      this.popup.onEvent(event);

    // Children receive messages when forwarding is enabled
    else if(this.eventForwarding) {
      _.each(this.children, child => {
        // Ignore if disabled
        if(child.disabled)
          return;

        // Mark child as focus
        let result = child.onEvent(event);
        if(result === true) {
          // Remove and add to top
          this.children = _
            .chain(this.children)
            .tap(_.partialRight(_.remove, child))
            .unshift(child)
            .value();
          return false;
        }
      });
    }
  }

  /** Update children */
  update() {
    if(this.popup)
      this.popup.update();
    else
      _.each(this.children, child => {
        !child.disabled && child.update && child.update();
      });
  }
}

/** Horizontal/Vertical box */
Layer.HBox = function(child, prev) {
  return prev &&
    [ prev.rect.x + prev.rect.w + prev.border.x + child.border.x
    , this.padding.y + child.border.y
    ];
};
Layer.VBox = function(child, prev) {
  return prev &&
    [ this.padding.x + child.border.x
    , prev.rect.y + prev.rect.h + prev.border.y + child.border.y
    ];
};

/** Titled list e.g. forms */
Layer.GridBox = function(cols, rows) {
  return function(child, prev, opts) {
    this.gridChildren = (this.gridChildren || this.children.length);

    // Column index
    let colIndex = this.gridChildren % cols;

    // New position
    let pos =
            [ colIndex * this.rect.w / cols + this.padding.x
            , this.rect.h / rows * Math.floor(this.gridChildren / cols)  + this.padding.y
            ];

    this.gridChildren += ((opts && opts.expand) || 1);
    return pos;
  };
};

/** Border box */
Layer.BorderBox = function(child, prev, opts) {
  return [
      Math.max(0, Math.min(this.rect.w * opts.align[0] - child.rect.w / 2, this.rect.w - child.rect.w))
    , Math.max(0, Math.min(this.rect.h * opts.align[1] - child.rect.h / 2, this.rect.h - child.rect.h))
  ];
};

/**
 * TODO: Engine state
 * @class
 */
export class State extends Layer {
  /** Init state, register resources */
  init() {}
}