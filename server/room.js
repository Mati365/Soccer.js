"use strict";
const md5 = require("blueimp-md5")
    , _ = require("lodash");

/**
 * Room class
 */
class Room {
  constructor(name, admin, password) {
    this.name = name;
    this.admin = admin;
    this.password = md5(password);

    (Room.list = Room.List || []).push(this);
  }

  /**
   * Return list of rooms
   * @returns {Array}
   */
  static headers() {
    return _.map(Room.list, room => {
      return {
          name: room.name
        , admin: room.admin.nick
        , password: this.password === ""
      };
    });
  }
}

module.exports = Room;