import _ from "lodash";
import $ from "jquery";

import { Rect } from "../tools/math";

/** Asseration */
if(!window.assert)
  window.assert = function(condition, errTitle) {
    if(condition)
      throw Error(errTitle);
  };

/**
 * Resource loaders
 */
var Loaders = {};
Loaders["\.(?:png|jpg|jpeg)$"] = function(path) {
  return new Promise((resolve, reject) => {
    $("<img />").attr("src", path).load(e => {
      resolve(e.target);
    });
  });
};

/**
 * Canvas configuration from DOM element
 */
export default class Context {
  constructor(selector) {
    // Create canvas if DOM selector is not provided
    if(!selector) {
      this.domElement = $("<canvas />").prop({
          width: 800
        , height: 400
      })[0];
      $("body").append(this.domElement);

    // Query canvas from DOM if exists
    } else {
      this.domElement = $(selector)[0];
      if(!this.domElement)
        throw "Cannot find canvas!";
    }
    Context._loadFont("assets/font.ttf");

    // Context
    this.ctx = this.domElement.getContext("2d");

    // Disable antialiasing
    this.ctx.imageSmoothingEnabled = false;
    $(this.domElement).css("image-rendering", "pixelated");

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

    // If resources are loading its true
    this.currentLoading = 0;
  }

  /** Load fonts by adding them to head */
  static _loadFont(url) {
    $(document.head).prepend(
      `<style type='text/css'>
        @font-face {
          font-family: 'Canvas Font';
          src: url('${url}') format('truetype');
        }
      </style>`
    );
  }

  /**
   * Set font size
   * @param size  Font size
   * @returns {Context}
   */
  setFontSize(size=14) {
    this.ctx.font = `${size}px 'Canvas Font'`;
    return this;
  }

  /**
   * Draw text
   * @param text  Text
   * @param pos   Text position
   * @returns {Context}
   */
  drawText(text, pos) {
    this.ctx.fillText(text, pos.x, pos.y);
    return this;
  }

  /**
   * Get font size
   * @param text
   * @returns {Number}
   */
  textWidth(text) {
    return this.ctx.measureText(text).width;
  }

  /**
   * Set fill color
   * @param color Fill color
   * @returns {Context}
   */
  fillWith(color) {
    this.ctx.fillStyle = color.css || color;
    return this;
  }

  /**
   * Draw filled rect
   * @param rect  Rectangle
   * @returns {Context}
   */
  fillRect(rect) {
    this.ctx.fillRect(
        rect.x
      , rect.y
      , rect.w
      , rect.h
    );
    return this;
  }
  /**
   * Loads resource, load only if required
   * @param id    Resource ID
   * @param path  Path to resource
   * @returns {Context}
   */
  loadResource(id, path) {
    _.each(Loaders, (loader, regex) => {
      // Load resource and assign to array
      if(new RegExp(regex).test(path)) {
        this.currentLoading++;
        loader(path)
          // Called after loading
          .then(resource => {
            this.resources[id] = resource;
            this.currentLoading--;
          });
      }
    });
    return this;
  }
}