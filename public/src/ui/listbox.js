import _ from "lodash";

import { Rect, Vec2 } from "shared/math";
import Color from "shared/color";

import { Layer } from "../engine/object";
import { Button, Radio } from "./button";
import ScrollBar from "../ui/scrollbar";

import Text from "../engine/wrapper";
import Message from "../engine/message";

/**
 * ListBo, layer with scrollbar that shows list box items in list
 * @class
 */
export default class ListBox extends Layer {
  constructor(rect) {
    super(Layer.VBox, rect);

    this.multiselect = false;
    this.padding.xy = [0, 1];
  }

  /** @inheritdoc */
  init()  {
    this.scrollbar = new ScrollBar(new Rect(this.rect.x + this.rect.w - 12, this.rect.y, 12, this.rect.h));
    this.scrollbar.addForwarder(Message.Type.MOUSE_DRAG, () => {
      this.setVisibleChildren(this.scrollbar.position, this.scrollbar.visible);
    });
  }

  /**
   * Set visible item index
   * @param start   Start index
   * @param visible Visible count
   */
  setVisibleChildren(start, visible) {
    let pos = 0;
    _.each(this.children, (child, index) => {
      if(index < start || index >= start + visible)
        child.disabled = true;
      else {
        child.disabled = false;

        // Update position
        child.rect.y = pos;
        pos += child.rect.h;
      }
    });
  }

  /**
   * Return selected items
   * @returns {Array} Array of controls
   */
  get selected() {
    return _
      .chain(this.children)
      .filter({ checked: true })
      .map(child => {
        return child.children.length === 1
          ? child.children[0].text
          : _.map(child.children, _.partialRight(_.pick, 'text'));
      })
      .thru(array => {
        return array.length && !this.multiselect ? array[0] : array;
      })
      .value();
  }

  /**
   * Set selected child by index
   * @param index Child index
   * @returns {ListBox}
   */
  setSelectedIndex(index) {
    this.deselect();
    this.children[index].checked = true;
    return this;
  }

  /**
   * Deselect all fields
   * @returns {ListBox}
   */
  deselect() {
    _.each(this.children, element => {
      element.checked = false;
    });
    return this;
  }

  /** @inheritdoc */
  draw(context) {
    super.draw(context);

    // Border
    this.scrollbar.draw(context);
    context
      .strokeWith(Color.Hex.LIGHT_GRAY)
      .strokeRect(this.rect);
  }

  /**
   * Add list item
   * @param child List Item
   * @param opts  Opts
   */
  add(child, opts) {
    super.add(child, opts || { fill: [1.0, .0] });

    // Manage scrollbar
    this.scrollbar.setTotal(this.children.length);
    if(!this.scrollbar.visible)
      this.scrollbar.visible = Math.floor(this.rect.h / child.rect.h);

    // Overflow is hidden
    this.setVisibleChildren(0, this.scrollbar.visible);
    return child;
  }

  /** @inheritdoc */
  onEvent(event) {
    if(this.scrollbar.onEvent(event) === false && event.type === Message.Type.MOUSE_CLICK) {
      // Deselect all
      if(!this.multiselect && this.rect.contains(event.data))
        this.deselect();

      // Check is selected
      super.onEvent(event);
    }
  }
}

/**
 * ListBox Item
 */
ListBox.Item = class extends Radio {
  constructor(text) {
    super(new Rect(0, 0, 0, 14), text);
    this.border.xy = [0, 1];
  }

  /** @inheritdoc */
  draw(context) {
    let fillColor = Color.parseHex(
      this.checked
        ? Color.Hex.WHITE
        : Color.Hex.BLACK
    );

    // Background color
    if(this.checked) {
      context
        .fillWith(fillColor)
        .fillRect(this.rect);
    }

    // Border and text
    context
      .fillWith(fillColor.inverse())
      .setFontSize(this.rect.h)
      .drawText(this.text, new Vec2(this.rect.x + 5, this.rect.y + this.rect.h * 0.85));
  }
};

/**
 * Row of items
 */
ListBox.Row = class extends Layer {
  constructor() {
    super(Layer.HBox, new Rect(0, 0, 0, 14));

    this.eventForwarding = false;
    this.padding.xy = [0, 0];
  }

  /**
   * Checked row
   */
  set checked(checked) {
    _.each(this.children, child => { child.checked = checked; });
  }
  get checked() {
    return _.every(this.children, { checked: true });
  }

  /** @inheritdoc */
  onEvent(event) {
    // Check if one is selected, if yes select all
    if(super.onEvent(event) !== false)
      this.checked = !this.checked;
  }
};