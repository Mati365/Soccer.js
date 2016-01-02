import _ from "lodash";

import { Rect } from "shared/math";
import Color from "shared/color";

import { Layer } from "../engine/object";

/**
 * Popup window control
 */
export default class Popup extends Layer {
  draw(context) {
    context
      .fillWith(Color.Hex.BLACK)
      .fillRect(this.rect)

      .strokeWith(Color.Hex.DARK_GRAY)
      .strokeRect(this.rect)

      .fillWith(Color.Hex.LIGHT_GRAY)
      .fillRect(new Rect(this.rect.x, this.rect.y, this.rect.w, 20));
    super.draw(context);
  }
}