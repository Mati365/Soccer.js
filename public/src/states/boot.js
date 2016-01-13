import _ from "lodash";

import { State } from "../engine/object";
import { Rect } from "shared/math";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import Client from "../multiplayer/client";

/**
 * Setting nick and connecting to server
 * @class
 */
export default class Boot extends State {
  /** @inheritdoc */
  get assets() {
    return {
      'ball': "assets/ball.png"
    };
  }

  /** @inheritdoc */
  init() {
    //this.add(new Sprite(
    //    new Rect(this.rect.w / 2 - 64, this.rect.h / 2 + 128, 128, 128)
    //  , "ball"
    //));

    // Repeat message if incorrect nick
    let repeatPromise = promiseGenerator => {
      return new Promise(resolve => {
        promiseGenerator()
          .then(resolve, _.partial(Popup.confirm, this, "Wrong nick", Popup.Type.CANCEL))
          .catch(() => {
            repeatPromise(promiseGenerator).then(resolve);
          });
      });
    };
    repeatPromise(() => {
      return Popup
        .input(this, "Enter nick")
        .then(_.partial(Client.emit, "setNick"));
    }).then(() => {
      this.canvas.activeState = "roomList";
    });
  }
};