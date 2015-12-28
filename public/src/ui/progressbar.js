import { Rect } from "shared/math";
import Color from "shared/color";
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
    // Value must be between 0 and 1, not 3 or -1
    let percentage = Math.max(0, Math.min(this.percentage, 1.0));
    context
      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect)

      .fillWith(Color.Hex.WHITE)
      .fillRect(new Rect(
          this.rect.x + 3
        , this.rect.y + 3
        , (this.rect.w - 6) * (this.rect.w > this.rect.h ? percentage : 1.0)
        , (this.rect.h - 6) * (this.rect.w < this.rect.h ? percentage : 1.0)
      ));
  }
}