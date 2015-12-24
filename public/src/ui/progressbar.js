import { Rect } from "../tools/math";
import Color from "../tools/color";
import Control from "./control";

/** Button */
export default class Progressbar extends Control {
  /**
   * @param rect        Rectangle dimensions
   * @param percentage  Percentage
   */
  constructor(rect, percentage=0) {
    super(rect);
    this.percentage = percentage;
  }

  /**
   * Draw progress
   * @param context Canvas context
   */
  draw(context) {
    context
      .strokeWith(Color.Hex.WHITE)
      .strokeRect(this.rect)

      .fillWith(Color.Hex.WHITE)
      .fillRect(new Rect(
          this.rect.x + 3
        , this.rect.y + 3
        , (this.rect.w - 6) * (this.rect.w > this.rect.h ? this.percentage : 1.0)
        , (this.rect.h - 6) * (this.rect.w < this.rect.h ? this.percentage : 1.0)
      ));
  }
}