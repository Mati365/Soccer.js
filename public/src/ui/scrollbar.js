import _ from "lodash";

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
    return (this.grip.y - this.rect.y) / this.rect.h * this._total;
  }

  /**
   * Set grip y position
   * @param position  Y position relative to parent x, y
   * @returns {ScrollBar}
   * @private
   */
  _setGripPos(position) {
    this.state = Message.Type.MOUSE_DRAG;
    this.grip.y = Math.min(
        this.rect.y + this.rect.h - this.grip.h
      , Math.max(this.rect.y, position)
    );
    return this;
  }

  /**
   * Event listener
   * @param event Event
   */
  onEvent(event) {
    // Scroll event was accepted by parent so do not check when cursor is over
    if(!this.handlePos
        && event.type !== Message.Type.MOUSE_SCROLL
        && !this.rect.contains(event.data))
      return false;

    // Set state
    this.state = event.type;

    // Make moveable
    switch(event.type) {
      case Message.Type.MOUSE_DOWN:
        this.handlePos = event.data.y - this.grip.y;
        break;

      case Message.Type.MOUSE_UP:
        this.handlePos = null;
        break;

      case Message.Type.MOUSE_SCROLL:
        this._setGripPos(this.grip.y + event.data.amount * 5.0);
        this.state = Message.Type.MOUSE_DRAG;
        break;

      case Message.Type.MOUSE_DRAG:
        this._setGripPos(event.data.y - this.handlePos);
        break;
    }

    // Send to forwarder
    this._sendToForwarder(_.assign(event, { type: this.state }));
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
        .fillWith(Color.Hex.WHITE)
        .fillRect(this.grip);
  }
}