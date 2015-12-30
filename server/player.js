"use strict";
const _ = require("lodash");
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
      .on("createRoom", data => {
        this.createRoom(data.name, data.password);
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
   * Create room
   * @param name      Name of room
   * @param password  Password
   */
  createRoom(name, password) {
    if(this.room)
      return false;
    return this.room = new Room(name, this, password || "");
  }

  /**
   * Set user nick, check if exists
   * @param nick  Nick
   * @returns true if not exists
   */
  setNick(nick) {
    if(!Player.isNickAvailable(nick))
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
    _.remove(Player.list, player);
  }
}

/** List of all players */
Player.list = [];

module.exports = Player;