import { Rect } from "shared/math";

import Color from "shared/color";
import Control from "./control";
import Message from "../engine/message";

/** ScrollBar */
export default class ScrollBar extends Control {
  constructor(rect, visible) {
    super(rect);
    this.visible = visible;
    this.setTotal(0);
  }

  /**
   * Actual position relative to total
   * @returns {number}
   */
  get position() {
    return this.grip.y / this.rect.h * this._total;
  }

  /**
   * Event listener
   * @param event Event
   */
  onEvent(event) {
    if(!this.rect.contains(event.data))
      return false;

    // Make moveable
    switch(event.type) {
      case Message.Type.MOUSE_DOWN:
        this.handlePos = event.data.y - this.grip.y;
        break;

      case Message.Type.MOUSE_DRAG:
        this.grip.y = Math.min(
            this.rect.y + this.rect.h - this.grip.h
          , Math.max(this.rect.y, event.data.y - this.handlePos)
        );
        break;
    }

    super.onEvent(event);
  }

  /**
   * Calc grip size
   * @param total Total values number
   */
  setTotal(total) {
    let gripHeight = 0;
    if(total > this.visible)
      gripHeight = Math.max(50, this.rect.h * (1.0 - (total - this.visible) / this.visible));

    this.grip = new Rect(this.rect.x, this.rect.y, this.rect.w, gripHeight);
    this._total = total;
    return this;
  }

  /**
   * Draw progress
   * @param context Canvas context
   */
  draw(context) {
    // Background
    context
      .fillWith(Color.Hex.DARK_GRAY)
      .fillRect(this.rect);

    // Draw bar
    if(this.grip)
      context
        .fillWith(this.state === Message.Type.MOUSE_DRAG ? Color.Hex.LIGHT_GRAY : Color.Hex.WHITE)
        .fillRect(this.grip);
  }
}