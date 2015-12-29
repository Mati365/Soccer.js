"use strict";
const md5 = require("blueimp-md5")
    , _ = require("lodash");

const Math = require("../shared/math");

class Team {
  constructor(color) {
    this.color = color;
  }
}

/**
 * Room class
 */
class Room {
  constructor(name, admin, password) {
    this.name = name;
    this.admin = admin;
    this.password = md5(password);
    this.teams = {
      spectators: []
    };

    (Room.list = Room.List || []).push(this);
  }

  /**
   * Change user team
   * @param user      User
   * @param teamName  Team name in this.teams, create if not exsists
   */
  changeTeam(user, teamName) {

  }

  /**
   * Join to room
   * @param player
   * @returns {Room}
   */
  join(player) {
    player.socket.join(this.name);
    this.teams.spectators.push(player);
    return this;
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