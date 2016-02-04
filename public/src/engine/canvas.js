import $ from "jquery";
import _ from "lodash";

import Color from "shared/color";
import { Vec2 } from "shared/math";

import Context from "./context";
import Message from "./message";

import Client from "../multiplayer/client";

/**
 * Main renderer class
 * @class
 */
export default class Canvas {
  constructor(context) {
    // Canvas context
    this.context = _.isString(context) || !context
      ? new Context(context)
      : context;

    // Background color
    this.background = Color.parseHex(Color.Hex.BLACK);

    // Application state e.g. game, menu
    this.states = {};
    this.activeState = null;

    // Create DOM actions
    this._initListeners();
  }

  /** Canvas context */
  get ctx() { return this.context.ctx; }
  get currentState() {
    return this.states[this.activeState];
  }

  /**
   * Set current state
   * @param name  State name
   * @returns {Canvas}
   */
  setState(name) {
    this.activeState = name;
    return this.states[name];
  }

  /**
   * Init keyboard listeners
   * @returns {Canvas}
   * @private
   */
  _initKeyboard() {
    // Characters that are buggy on firefox/chrome
    let illegalCharacters = [8, 13];

    // Pressed keys
    this.pressedKeys = {};

    // Handle key down
    let keyDownHandler = e => {
      this.pressedKeys[e.which] = true;
      this.broadcast(new Message(
          Message.Type[~illegalCharacters.indexOf(e.which) ? 'KEY_ENTER' : 'KEY_DOWN']
        , this, e.which
      ));
    };

    // Handle key press
    let keyPressHandler = e => {
      !~illegalCharacters.indexOf(e.which) && this.broadcast(new Message(Message.Type.KEY_ENTER, this, e.which));
      e.preventDefault();
    };

    // Handle key up
    let keyUpHandler = e => {
      this.pressedKeys[e.which] = false;
      this.broadcast(new Message(Message.Type.KEY_UP, this, e.which));
    };

    $(this.context.domElement)
      .on("keydown", keyDownHandler)
      .on("keypress", keyPressHandler)
      .on("keyup", keyUpHandler);
    return this;
  }

  /**
   * Init mouse listeners
   * @returns {Canvas}
   * @private
   */
  _initMouse() {
    let domInstance = $(this.context.domElement);

    // Translate event from DOM system to engine, "click" to Mouse.Type.MOUSE_CLICK
    let mousePressed = false;
    domInstance.translateEvent = (eventName, eventCode, data) => {
      let handler = () => {
        switch(eventCode) {
          case Message.Type.MOUSE_DOWN: mousePressed = true;  break;
          case Message.Type.MOUSE_UP:   mousePressed = false; break;
        }
        this.broadcast(new Message(eventCode, this, data));
      };
      return domInstance.on(eventName, handler);
    };

    // On mouse scroll
    let mouseScroll = e => {
      // Custom event data
      class ScrollAmount extends Vec2 {
        constructor(x, y) {
          super(x, y);
          this.amount =  Math.sign(e.detail || e.originalEvent.deltaY);
        }
        clone() { return new ScrollAmount(this.x, this.y); }
      }
      this.broadcast(new Message(Message.Type.MOUSE_SCROLL, this, new ScrollAmount(mousePos.x, mousePos.y)));
    };

    // Cached mouse position
    let mousePos = new Vec2;
    domInstance
    /** MOUSE SCROLL */
      .on("mousewheel DOMMouseScroll", mouseScroll)

      /** MOUSE EVENT LISTENERS */
      .mousemove(e => {
        mousePos.xy = [
            e.clientX - this.context.size.x
          , e.clientY - this.context.size.y
        ];

        this.context.domElement.style.cursor = "auto";
        this.broadcast(new Message(Message.Type[mousePressed ? 'MOUSE_DRAG' : 'MOUSE_MOVE'], this, mousePos));
      })

      .translateEvent("click", Message.Type.MOUSE_CLICK, mousePos)
      .translateEvent("mousedown", Message.Type.MOUSE_DOWN, mousePos)
      .translateEvent("mouseup", Message.Type.MOUSE_UP, mousePos);

    return this;
  }

  /**
   * Init all listeners
   * @returns {Canvas}
   * @private
   */
  _initListeners() {
    return this
      ._initKeyboard()
      ._initMouse();
  }

  /**
   * Broadcast message to states, e.g. keyboard click
   * @param data          Event data
   * @param currentState  If true sends only to visible state
   */
  broadcast(data, currentState=true) {
    if(currentState)
      !_.isFunction(this.currentState) && this.currentState.onEvent(data);
    else
      _.each(this.states, state => {
        state.onEvent(data);
      });
    data.finalCallback && data.finalCallback();
  }

  /**
   * Init state socket
   * @param state State
   * @private
   */
  static _initStateSocketListeners(state) {
    state.waitingForSocket = false;
    _.each(state.listeners, (callback, func) =>
      Client.socket.on(func, callback.bind(state))
    );
  }

  /**
   * Load state if is not initialized
   * @param state State
   * @private
   */
  _initState(state) {
    // Copy size of parent
    if(!state.rect.w)
      state.rect.wh = this.context.size.wh;

    state.canvas = this;
    state.waitingForSocket = true;
    state.init();

    // Load resources
    _.each(state.assets, (val, key) =>  this.context.loadResource(key, val));
    return state;
  }

  /**
   * Set state
   * @param name        State's name
   * @param State       State class
   * @param setDefault  Set state default
   */
  state(name, State, setDefault=false) {
    console.assert(!this.states[name], "Application state already exists!");

    // Set state and init
    this.states[name] = new State;
    if(setDefault || _.size(this.states) === 1)
      this.activeState = name;

    // Init on adding
    this._initState(this.states[name]);
    return this;
  }

  /**
   * Method called after connected to server
   * @returns {Canvas}
   */
  openSocketListeners() {
    _.each(this.states, state => {
      state.waitingForSocket && Canvas._initStateSocketListeners(state);
    });
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

      // Stop exec until something is loaded
      if(this.context.currentLoading) {
        let title = "Loading resources...";
        this.context
          .fillWith(Color.Hex.WHITE)
          .setFontSize(16)
          .drawText(title, new Vec2(this.context.size.w / 2 - this.context.textWidth(title) / 2, this.context.size.h - 18));

      } else {
        let state = this.currentState;
        if(state) {
          // Fixed step update
          if(delta >= frameTime) {
            delta -= frameTime;
            state.update();
          }

          // Calculate delta
          delta += -lastFrame + (lastFrame = Date.now());
          state.draw(this.context);
        }
      }

      // Request new frame
      window.requestAnimationFrame(renderer);
    };
    renderer();
  }
}
