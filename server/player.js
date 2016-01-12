"use strict";
const validate = require("validate.js")
    , _ = require("lodash");

const { Room } = require("./room");

/**
 * Player socket class
 */
class Player {
  constructor(socket) {
    this.socket = socket;
    this.room = null;

    this._initListener();
  }

  /**
   * Init socket listeners
   * @private
   */
  _initListener() {
    this.socket
      /** Authorize to server */
      .on("setNick", (nick, fn) => {
        fn(this.setNick(nick) ? `Welcome ${nick}!` : false);
      })

      /** Create room on server */
      .on("createRoom", (data, fn) => {
        let validation = validate(data, {
            name: {
              presence: true
            , length: { minimum: 2, maximum: 32 }
          }
          , players: { numericality: { lessThanOrEqualTo: 20 } }
        });
        if(validation || this.room) {
          fn({
            error: "Invalid form data!"
          });
        } else {
          this.room = new Room(data.name, this, data.players, data.password, data.hidden);
          fn(`Login to ${data.name} room as admin!`);
        }
      })

      /** Start room physics */
      .on("startRoom", () => {
        this.room && this.room.start();
      })

      /** List all rooms */
      .on("listRooms", (data, fn) => {
        fn(Room.headers());
      })

      /** Disconnect from server */
      .on("disconnect", _.partial(Player.remove, this));
  }

  /**
   * Set user nick, check if exists
   * @param nick  Nick
   * @returns true if not exists
   */
  setNick(nick) {
    if(!nick.length || !Player.isNickAvailable(nick))
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
    if(player.room && player.room.admin === player)
      player.room.destroy();
    _.remove(Player.list, player);
  }
}

/** List of all players */
Player.list = [];

module.exports = Player;