import { Vec2 } from "shared/math";
import Color from "shared/color";

import Control from "./control";
import Message from "../engine/message";

/**
 * TextBox class
 * @class
 */
export default class TextBox extends Control {
  /**
   * @param rect  TextBox dimensions
   * @param text  Text
   */
  constructor(rect, text) {
    super(rect);
    this.text = text;
  }

  /** @inheritdoc */
  onEvent(event) {
    super.onEvent(event);
  }

  /** @inheritdoc */
  draw(context) {
    // Draw text
    let fontSize = this.rect.h * 0.9;
    context
      .strokeWith(Color.Hex.WHITE)
      .strokeRect(this.rect)

      .fillWith(Color.Hex.WHITE)
      .drawText(this.text, new Vec2(
          this.rect.x + 5
        , this.rect.y + this.rect.h / 2 + fontSize * .4
      ));
  }
}