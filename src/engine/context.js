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

    // If resources are loading its true
    this.currentLoading = 0;
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