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
        .fillWith(Color.Hex.WHITE)
        .setFontSize(13)
        .drawText(this.title, new Vec2(
            this.rect.x + 5
          , this.rect.y + this.rect.h - 2
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
      .add(new Button(new Rect(this.rect.w - 92, this.rect.h - 19, 90, 16), "Return"), { useLayout: false })
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        this.layer.showPopup(null);
      });
  }
}