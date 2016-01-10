import _ from "lodash";

import { Vec2, Rect } from "shared/math";
import Color from "shared/color";

import { Text } from "../engine/wrapper";
import Message from "../engine/message";

import { Layer } from "../engine/object";
import { Button } from "../ui/button";
import TextBox from "../ui/textbox";

/**
 * Popup window control
 * @class
 */
export default class Popup extends Layer {
  constructor(layout, rect, title) {
    super(layout, rect);
    this.title = title;
    this.init();
  }

  /**
   * Show input popup
   * @param layer Root layer
   * @param title Input title
   * @returns {Promise}
   */
  static input(layer, title) {
    return new Promise((resolve, reject) => {
      let popup = layer.showPopup(new Popup(Layer.HBox, new Rect(0, 0, 300, 60), title))
        , textBox = new TextBox(new Rect(0, 0, 300 - 90 - 20 - 5, 16), "enter text");

      popup.add(textBox);
      popup
        .add(new Button(new Rect(0, 0, 90, 16), "Enter")
        .addForwarder(Message.Type.MOUSE_CLICK, () => {
          popup.hide() && resolve(textBox.text);
        }));

      popup
        .makeCloseable()
        .addForwarder(Message.Type.MOUSE_CLICK, fn => {
          fn() && reject();
        });
    });
  }

  /**
   * Hide popup
   * @returns {Popup}
   */
  hide() {
    this.layer.showPopup(null);
    return this;
  }

  /** @inheritdoc */
  draw(context) {
    context
      .fillWith(Color.Hex.BLACK)
      .fillRect(this.rect);

      // Write popup title
    if(this.title)
      context
        .fillWith(Color.Hex.WHITE)
        .setFontSize(15)
        .drawText(this.title, new Vec2(
            this.rect.x + this.padding.x + 5
          , this.rect.y + this.rect.h - 5 - this.padding.y
        ));

    // Draw children
    super.draw(context);

    // Draw border
    context
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect);
  }

  /**
   * Make popup closeable
   * @returns {Button}
   */
  makeCloseable() {
    return this
      .add(new Button(new Rect(
          this.rect.w - 90 - this.padding.x - 5
        , this.rect.h - 16 - this.padding.y - 5
        , 90
        , 16
      ), "Return"), { useLayout: false })
      .addForwarder(Message.Type.MOUSE_CLICK, this.hide.bind(this));
  }
}