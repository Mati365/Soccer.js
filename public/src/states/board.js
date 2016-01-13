import _ from "lodash";

import { State } from "../engine/object";
import { Rect } from "shared/math";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import Client from "../multiplayer/client";

/**
 * Load room data
 * @class
 */
export default class Board extends State {
  /** @inheritdoc */
  get assets() {
    return {
      'ball': "assets/ball.png"
    };
  }

  /** @inheritdoc */
  init() {
  }
};