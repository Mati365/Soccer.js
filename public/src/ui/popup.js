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
    this.padding.xy = [5, 42];
    this.init();
  }

  /**
   * Show input popup
   * @param layer Root layer
   * @param title Input title
   * @returns {Promise}
   */
  static input(layer, title) {
    return new Promise(resolve => {
      let popup = layer.showPopup(new Popup(Layer.HBox, new Rect(0, 0, 300, 70), title))
        , textBox = new TextBox(new Rect(0, 0, 0, 20));

      textBox.border.x = 0;
      popup.add(textBox, { fill: [.8, .0] });

      popup
        .add(new Button(new Rect(0, 0, 0, 20), "Ok"), { fill: [.2, .0] })
        .addForwarder(Message.Type.MOUSE_CLICK, () => {
          popup.hide() && resolve(textBox.text);
        });
    });
  }

  /**
   * Create confirm dialog
   * @param layer Root layer
   * @param title Confirm title
   * @param type  Popup type
   * @returns {Promise}
   */
  static confirm(layer, title, type=Popup.Type.OK) {
    return new Promise((resolve, reject) => {
      let popup = layer.showPopup(new Popup(null, new Rect(0, 0, 300, 70), title))
        , pos = 300 - 5;

      if(type == Popup.Type.OK)
        popup
          .add(new Button(new Rect(pos -= 50, 49, 50, 16), "Ok"))
          .addForwarder(Message.Type.MOUSE_CLICK, () => { popup.hide() && resolve(); });

      if(type == Popup.Type.CANCEL)
        popup
          .add(new Button(new Rect(pos -= 90, 49, 90, 16), "Cancel")
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
      .fillRect(this.rect);

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
Popup.Type = {
    CANCEL: 1
  , OK: 2
  , OK_CANCEL: 3
};