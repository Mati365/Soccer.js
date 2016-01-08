import { Vec2, Rect } from "shared/math";
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

  /** @inheritdoc */
  draw(context) {
    // Button fill color
    let fillColor = Color.parseHex(
      Color.Hex[this.state !== Message.Type.MOUSE_DOWN ? 'WHITE' : 'BLACK']
    );

    // Draw background
    context
      .fillWith(fillColor)
      .fillRect(this.rect, Color.Hex.BLACK);

    // Draw text
    let fontSize = this.rect.h * 0.9;
    context
      .strokeWith(Color.Hex.WHITE)
      .strokeRect(this.rect)

      .fillWith(fillColor.inverse())
      .setFontSize(fontSize)
      .drawText(this.text, new Vec2(
          this.rect.x + this.rect.w / 2 - context.textWidth(this.text) / 2
        , this.rect.y + this.rect.h / 2 + fontSize * .4
      ));
  }
}

/** Radiobutton */
export class Radio extends Button {
  /** @inheritdoc */
  onEvent(event) {
    if(this._checkMouseEvent(event) && event.type === Message.Type.MOUSE_CLICK)
      this.checked = !this.checked;
    return super.onEvent(event);
  }

  /** @inheritdoc */
  draw(context) {
    let box = new Rect(this.rect.x, this.rect.y, this.rect.h, this.rect.h);

    // Radiobutton color
    context.fillWith(Color.Hex.WHITE);

    // Filled in when checked
    this.checked && context.fillRect(box.clone().borderReduce(2));

    // Border and text
    context
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(box)

      .setFontSize(this.rect.h)
      .drawText(this.text, new Vec2(
          this.rect.x + this.rect.h + 10
        , this.rect.y + this.rect.h * 0.85
      ));
  }
}