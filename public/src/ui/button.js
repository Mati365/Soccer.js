import Control from "./control";
import Schema from "./schema";
import Message from "../engine/message";
import Color from "../tools/color";
import { Vec2 } from "../tools/math";

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

    // Draw border
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
        , this.rect.y + (this.rect.h - fontSize) / 2 + fontSize
      ));
  }
}

/** Radiobutton */
export class Radio extends Control {

}