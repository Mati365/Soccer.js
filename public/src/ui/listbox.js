import _ from "lodash";

import { Rect, Vec2 } from "../tools/math";
import { Layer } from "../engine/object";
import Message from "../engine/message";
import Color from "../tools/color";
import { Button, Radio } from "./button";

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
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect);
  }

  /**
   * Add list item
   * @param child List Item
   */
  add(child) {
    return super.add(child, { fill: new Vec2(1.0, 0.0) });
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