import $ from "jquery";

import { Rect } from "../tools/math";

/**
 * Canvas configuration from DOM element
 */
export default class Context {
  constructor(selector) {
    // Create canvas if DOM selector is not provided
    if(!selector) {
      this.domElement = $("<canvas />").prop({
          width: 300
        , height: 300
      })[0];
      $("body").append(this.domElement);

    // Query canvas from DOM if exists
    } else {
      this.domElement = $(selector)[0];
      if(!this.domElement)
        throw "Cannot find canvas!";
    }

    // Context
    this.ctx = this.domElement.getContext("2d");

    // Get size of canvas
    let offset = $(this.domElement).offset();
    this.size = new Rect(
        offset.left
      , offset.top
      , $(this.domElement).width()
      , $(this.domElement).height()
    );

    // Context resources
    this.resources = {};
  }
}