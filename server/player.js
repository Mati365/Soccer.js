"use strict";
const _ = require("lodash");

class Player {
  constructor(socket) {
    this.socket = socket;
    this._initListener();
  }

  /**
   * Init socket listeners
   * @private
   */
  _initListener() {
    this.socket
      /** Authorize to server */
      .on("setNick", (nick, fn) => { fn(this.setNick(nick) ? `Welcome ${nick}!` : false); })

      /** Disconnect from server */
      .on("disconnect", _.partial(Player.remove, this));
  }

  /**
   * Set user nick, check if exists
   * @param nick  Nick
   * @returns true if not exists
   */
  setNick(nick) {
    if(Player.isNickAvailable(nick))
      return false;
    else
      return this.nick = nick;
  }

  static isNickAvailable(nick) {
    return !_.find(Player.list, _.matchesProperty("nick", nick));
  }

  /**
   * Create player
   * @param socket  Player socket
   * @returns Player
   */
  static create(socket) {
    return Player.list.push(new Player(socket)) && _(Player.list).last();
  }

  /**
   * Remove player
   * @param player
   */
  static remove(player) {
    Player.list = _.without(Player.list, player);
  }
}

/** List of all players */
Player.list = [];

module.exports = Player;