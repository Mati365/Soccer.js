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
    this.padding.y = 42;
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
      let popup = layer.showPopup(new Popup(Layer.HBox, new Rect(0, 0, 300, 70), title))
        , textBox = new TextBox(new Rect(0, 0, 300 - 50 - 15, 16));

      textBox.border.x = 0;
      popup.add(textBox);

      popup
        .add(new Button(new Rect(0, 0, 50, 16), "Ok")
          .addForwarder(Message.Type.MOUSE_CLICK, () => {
            popup.hide() && resolve(textBox.text);
          })
        );

      popup
        .makeCloseable()
        .addForwarder(Message.Type.MOUSE_CLICK, fn => {
          fn() && reject();
        });
    });
  }

  /**
   * Create confirm dialog
   * @param layer Root layer
   * @param title Confirm title
   * @returns {Promise}
   */
  static confirm(layer, title) {
    return new Promise((resolve, reject) => {
      let popup = layer.showPopup(new Popup(null, new Rect(0, 0, 300, 70), title));
      popup
        .add(new Button(new Rect(300 - 50 - 90 - 10, 49, 50, 16), "Ok")
          .addForwarder(Message.Type.MOUSE_CLICK, () => { popup.hide() && resolve(); })
        );
      popup
        .add(new Button(new Rect(300 - 90 - 5, 49, 90, 16), "Cancel")
        .addForwarder(Message.Type.MOUSE_CLICK, () => { popup.hide() && reject(); }));
    });
  }

  /**
   * Hide popup
   * @returns {Popup}
   */
  hide() {
    this.layer.showPopup(null);
    this.layer = null;
    return this;
  }

  /** @inheritdoc */
  draw(context) {
    context
      // Fill in
      .fillWith(Color.Hex.BLACK)
      .fillRect(this.rect)

      // Draw border
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect);

      // Write popup title
    if(this.title)
      context
        .fillWith(Color.Hex.WHITE)
        .setFontSize(15)
        .drawText(this.title, new Vec2(
            this.rect.x + this.padding.x
          , this.rect.y + 20
        ));

    // Draw children
    super.draw(context);
  }

  /**
   * Make popup closeable
   * @returns {Button}
   */
  makeCloseable() {
    return this
      .add(new Button(new Rect(
          this.rect.w - 60 - this.padding.x
        , 5, 60, 16
      ), "Close"), { useLayout: false })
      .addForwarder(Message.Type.MOUSE_CLICK, this.hide.bind(this));
  }
}