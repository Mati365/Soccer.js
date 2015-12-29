import _ from "lodash";

import { Rect, Vec2 } from "shared/math";
import Color from "shared/color";

import { Layer } from "../engine/object";
import Message from "../engine/message";
import { Button, Radio } from "./button";
import Text from "../engine/wrapper";

/**
 * ListBox control
 */
export default class ListBox extends Layer {
  constructor(rect) {
    super(Layer.VBox, rect);

    this.spacing = 0;
  }

  /**
   * Return selected items
   * @returns {Array} Array of controls
   */
  get selected() {
    return _.filter(this.children, { checked: true });
  }

  /**
   * Draw listbox
   * @param context Canvas context
   */
  draw(context) {
    super.draw(context);
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
    return super.add(child, opts || { fill: new Vec2(1.0, 0.0) });
  }
}

/**
 * ListBox Item
 */
ListBox.Item = class extends Radio {
  constructor(text) {
    super(new Rect(0, 0, 0, 16), text);
  }

  /**
   * Draw listbox item
   * @param context Canvas context
   */
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

  /**
   * Receive event
   * @param event Event
   */
  onEvent(event) {
    // Check if one is selected, if yes select all
    if(super.onEvent(event) !== false)
      this.checked = !this.checked;
  }

  /**
   * Draw listbox item
   * @param context Canvas context
   */
  draw(context) {
    super.draw(context);
  }
};