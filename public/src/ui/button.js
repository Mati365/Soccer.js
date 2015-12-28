import { Vec2 } from "shared/math";
import Color from "shared/color";

import Control from "./control";
import Schema from "./schema";
import Message from "../engine/message";

/** Button */
export class Button extends Control {
  /**
   * @param rect  Button dimensions
   * @param text  Text
   */
  constructor(rect, text) {
    super(rect);
    this.text = text;
  }

  /**
   * Draw button
   * @param context Canvas context
   */
  draw(context) {
    // Button fill color
    let fillColor = Color.parseHex(
      this.state === Message.Type.MOUSE_DOWN
        ? Color.Hex.WHITE
        : Schema.button.background
    );

    // Draw background
    context
      .fillWith(fillColor)
      .fillRect(this.rect, Schema.button.background);

    // Draw text
    let fontSize = this.rect.h * 0.9;
    context
      .fillWith(fillColor.inverse())
      .setFontSize(fontSize)
      .drawText(this.text, new Vec2(
          this.rect.x + this.rect.w / 2 - context.textWidth(this.text) / 2
        , this.rect.y + this.rect.h / 2 + fontSize / 2
      ));
  }
}

/** Radiobutton */
export class Radio extends Button {
  /**
   * Forward event to callbacks
   * @param event  Event
   */
  onEvent(event) {
    if(this._checkMouseEvent(event) && event.type === Message.Type.MOUSE_CLICK)
      this.checked = !this.checked;
    return super.onEvent(event);
  }

  /**
   * Draw radio
   * @param context Canvas context
   */
  draw(context) {
    // Radiobutton color
    context.fillWith(Color.Hex.WHITE);

    // Filled in when checked
    if(this.checked) {
      context.fillRect(this.rect.clone().borderReduce(3));
    }

    // Border and text
    context
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect)

      .setFontSize(this.rect.h)
      .drawText(this.text, new Vec2(
          this.rect.x + this.rect.w + 10
        , this.rect.y + this.rect.h * 0.85
      ));
  }
}