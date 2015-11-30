import $ from "jquery";
import _ from "lodash";

import Vec2 from "../tools/vec2.js";

/**
 * Canvas configuration from DOM element
 */
export class Context {
  constructor(selector) {
    // Create canvas if DOM selector is not provided
    if(!selector) {
      this.dom_element = $("<canvas />").prop({
          width: 300
        , height: 300
      })[0];
      $("body").append(this.dom_element);
    } else {
      this.dom_element = $(selector)[0];
      if(!this.dom_element)
        throw "Cannot find canvas!";
    }

    // Context
    this.ctx = this.dom_element.getContext("2d");

    // Get size of canvas
    this.size = new Vec2(
        $(this.dom_element).width()
      , $(this.dom_element).height()
    );
  }
}

/**
 * Main renderer class
 */
export class Canvas {
  constructor(context) {
    this.context = _.isString(context) || !context
      ? new Context(context)
      : context;
  }
}
