import _ from "lodash";

import { Rect, Vec2 } from "shared/math";
import Color from "shared/color";

import { Layer } from "../engine/object";
import { Button, Radio } from "./button";
import ScrollBar from "../ui/scrollbar";

import Text from "../engine/wrapper";
import Message from "../engine/message";

/**
 * ListBo, layer with scrollbar that shows list box items in list
 * @class
 */
export default class ListBox extends Layer {
  constructor(rect) {
    super(Layer.VBox, rect);
    this.spacing = 0;
    this.multiselect = false;
  }

  /** @inheritdoc */
  init()  {
    this.scrollbar = new ScrollBar(new Rect(this.rect.x + this.rect.w - 12, this.rect.y, 12, this.rect.h));
    this.scrollbar.addForwarder(Message.Type.MOUSE_DRAG, () => {
      this.setVisibleIndex(this.scrollbar.position, this.scrollbar.visible);
    });
  }

  /**
   * Set visible item index
   * @param start   Start index
   * @param visible Visible count
   */
  setVisibleIndex(start, visible) {
    let pos = 0;
    _.each(this.children, (child, index) => {
      if(index < start || index >= start + visible)
        child.disabled = true;
      else {
        child.disabled = false;

        // Update position
        child.rect.y = pos;
        pos += child.rect.h;
      }
    });
  }

  /**
   * Return selected items
   * @returns {Array} Array of controls
   */
  get selected() {
    return _.filter(this.children, { checked: true });
  }

  /**
   * Deselect all fields
   * @returns {ListBox}
   */
  deselect() {
    _.each(this.children, element => {
      element.checked = false;
    });
    return this;
  }

  /** @inheritdoc */
  draw(context) {
    super.draw(context);

    // Border
    this.scrollbar.draw(context);
    context
      .strokeWith(Color.Hex.WHITE)
      .strokeRect(this.rect);
  }

  /**
   * Add list item
   * @param child List Item
   * @param opts  Opts
   */
  add(child, opts) {
    super.add(child, opts || { fill: [1.0, .0] });

    // Manage scrollbar
    this.scrollbar.setTotal(this.children.length);
    this.scrollbar.visible = Math.floor(this.rect.h / child.rect.h);

    // Overflow is hidden
    if(this.rect.h <= child.rect.y + child.rect.h)
      child.disabled = true;
    return child;
  }

  /** @inheritdoc */
  onEvent(event) {
    if(this.scrollbar.onEvent(event) === false && event.type === Message.Type.MOUSE_CLICK) {
      // Deselect all
      if(!this.multiselect && this.rect.contains(event.data))
        this.deselect();

      // Check is selected
      super.onEvent(event);
    }
  }
}

/**
 * ListBox Item
 */
ListBox.Item = class extends Radio {
  constructor(text) {
    super(new Rect(0, 0, 0, 16), text);
  }

  /** @inheritdoc */
  draw(context) {
    let fillColor = Color.parseHex(
      this.checked
        ? Color.Hex.WHITE
        : Color.Hex.BLACK
    );

    // Background color
    if(this.checked) {
      context
        .fillWith(fillColor)
        .fillRect(this.rect);
    }

    // Border and text
    context
      .fillWith(fillColor.inverse())
      .setFontSize(this.rect.h)
      .drawText(this.text, new Vec2(this.rect.x + 5, this.rect.y + this.rect.h * 0.85));
  }
};

/**
 * Row of items
 */
ListBox.Row = class extends Layer {
  constructor() {
    super(Layer.HBox, new Rect(0, 0, 0, 16));

    this.spacing = 0;
    this.eventForwarding = false;
  }

  /**
   * Checked row
   */
  set checked(checked) {
    _.each(this.children, child => { child.checked = checked; });
  }
  get checked() {
    return _.every(this.children, { checked: true });
  }

  /** @inheritdoc */
  onEvent(event) {
    // Check if one is selected, if yes select all
    if(super.onEvent(event) !== false)
      this.checked = !this.checked;
  }
};