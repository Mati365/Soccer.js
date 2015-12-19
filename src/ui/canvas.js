import $ from "jquery";
import _ from "lodash";

import {Vec2, Rect} from "../tools/math.js";
import Color from "../tools/color.js";

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
    this.size = new Rect(
        0, 0
      , $(this.dom_element).width()
      , $(this.dom_element).height()
    );
  }
}

/**
 * Main renderer class
 */
export default class Canvas {
  constructor(context) {
    // Canvas context
    this.context = _.isString(context) || !context
      ? new Context(context)
      : context;

    // Background color
    this.background = Color.hexColor(Color.Hex.BLACK);

    // Application state e.g. game, menu
    this.states = {};
    this.activeState = null;
  }

  /** Canvas context */
  get ctx() { return this.context.ctx; }

  /**
   * Set state
   * @param name  State's name
   * @param state State object
   */
  state(name, state) {
    if(name in this.states)
      throw new Error("Application state already exists!");
    this.states[name] = state;
    return this;
  }

  /** Game loop */
  run() {
    let lastFrame = Date.now()
      , delta = 0
      , frameTime = 1000 / 30;

    // Render loop
    let renderer = () => {
      // Rendering
      this.ctx.fillStyle = this.background.css;
      this.ctx.fillRect(0, 0, this.context.size.w, this.context.size.h);

      let state = this.states[this.activeState];
      if(state) {
        // Fixed step update
        if(delta >= frameTime) {
          delta -= frameTime;
          state.update && state.update();
        }

        // Calculate delta
        delta += -lastFrame + (lastFrame = Date.now());
        state.draw && state.draw();
      }

      // Request new frame
      window.requestAnimationFrame(renderer);
    };
    renderer();
  }
}
