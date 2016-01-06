import _ from "lodash";

import { Vec2, Rect } from "shared/math";
import Color from "shared/color";

import { Text } from "../engine/wrapper";
import Message from "../engine/message";

import { Layer } from "../engine/object";
import { Button } from "../ui/button";

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

  /** @inheritdoc */
  draw(context) {
    context
      .fillWith(Color.Hex.BLACK)
      .fillRect(this.rect);

      // Write popup title
    if(this.title)
      context
        .fillWith(Color.Hex.LIGHT_GRAY)
        .setFontSize(20)
        .drawText(this.title, new Vec2(
            this.rect.x + this.rect.w / 2 - context.textWidth(this.title) / 2
          , this.rect.y + 20
        ));

    // Draw children
    super.draw(context);

    // Draw border
    context
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect);
  }

  /** @inheritdoc */
  init() {
    // Return button
    this
      .add(new Button(new Rect(this.rect.w / 2 - 45, this.rect.h - 22, 90, 20), "Previous"), { useLayout: false })
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        this.layer.showPopup(null);
      });
  }
}