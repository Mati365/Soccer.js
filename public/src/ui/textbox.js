import _ from "lodash";

import { Vec2, Rect } from "shared/math";
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

    // Append to text box
    if(event.isKeyboardEvent() && this.hasFocus()) {
      switch(event.data) {
        case 8:   this.text = this.text.slice(0, -1); break;  /** BACKSPACE */
        case 13:  this.state = 0;                     break;  /** ENTER */

        default:
          this.text += String.fromCharCode(event.data);
      }
      return true;
    }
  }

  /** @inheritdoc */
  draw(context) {
    // Draw text
    let fontSize = this.rect.h * 0.9;
    context
      .setFontSize(fontSize)
      .strokeWith(Color.Hex.WHITE)
      .strokeRect(this.rect);

    // Set timer once, only one UI object has focus so interval is only one
    if(!this.caretTimer && this.hasFocus()) {
      // Render caret
      this.caretTimer = window.setInterval(() => {
        this.caretVisible = !this.caretVisible || false;
      }, 300);

    } else if(this.caretTimer && !this.hasFocus()) {
      // Clear interval
      this.caretTimer = window.clearInterval(this.caretTimer);
      this.caretVisible = false;
    }

    // Do not use clipping, it's terrible slow!
    let textWidth = context.textWidth(this.text)
      , text = this.text;

    // Show only overflow, hide previous characters
    if(textWidth >= this.rect.w) {
      let characterWidth = textWidth / text.length
        , visibleCharacters = Math.floor((this.rect.w - 7) / characterWidth);
      text = text.substring(text.length - visibleCharacters);
    }

    context
      .fillWith(Color.Hex[this.state == Message.Type.MOUSE_CLICK ? 'GREEN' : 'WHITE'])
      .drawText(text, new Vec2(
          this.rect.x + 5
        , this.rect.y + this.rect.h / 2 + fontSize * .4
      ));

    // Render caret
    if(this.caretVisible)
      context
        .fillWith(Color.Hex.GREEN)
        .fillRect(new Rect(this.rect.x + Math.min(textWidth + 6, this.rect.w - 4), this.rect.y + 2, 2, this.rect.h - 4));
  }
}