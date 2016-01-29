"use strict";
const md5 = require("blueimp-md5")
    , _ = require("lodash");

const { Vec2, Circle, Rect } = require("../shared/math")
    , io = require("./server");

/**
 * Room class
 */
class Room {
  constructor(name, admin, maxPlayers, password, hidden) {
    this.name = name;
    this.maxPlayers = maxPlayers || 2;
    this.password =  md5(password);

    // Players
    this.players = [];
    this.admin = this.join(admin);

    // Ball is separated object
    this.ball = new Circle(16, 16, 32);
    this.board = new Rect(0, 0, 400, 400);

    // hide room in rooms list
    if(hidden !== true)
      (Room.list = Room.list || []).push(this);
  }

  /**
   * Get teams with players nicks
   */
  get teamsHeaders() {
    return _
      .chain(this.players)
      .groupBy("team")
      .mapValues(_.partial(_.map, _, "nick"))
      .value();
  }

  /**
   * Returns true if passwords matches
   * @param password  Password in plain text
   * @returns {boolean}
   */
  checkPassword(password) {
    return md5(password) === this.password;
  }

  /**
   * Returns true if server is full
   * @returns {boolean}
   */
  isFull() {
    return this.maxPlayers <= this.players.length;
  }

  /**
   * Returns true is room is locked
   * @returns {boolean}
   */
  isLocked() {
    return this.password !== "d41d8cd98f00b204e9800998ecf8427e";
  }

  /**
   * Kick player from room
   * @param player  Player
   * @returns {Room}
   */
  kick(player) {
    player
      .socket
      .emit("roomKick", "You are kicked!")
      .leave(this.name);
    this.leave(player);
    return this;
  }

  /**
   * Get list of all players from all teams without omit
   * @param omit  Omit team name
   * @returns Players
   */
  omitTeam(omit) {
    return _.filter(this.players, player => player.team !== omit);
  }

  /**
   * Destroy room
   */
  destroy() {
    // Stop interval
    this.stop();

    // Kick all players ;)
    _.each(this.players, this.kick.bind(this));
    _.remove(Room.list, this);
    return this;
  }

  /**
   * Update physics in loop
   * @private
   */
  _updatePhysics() {
    let cachedPlayers = this.omitTeam("spectators");
    if(!cachedPlayers.length)
      return;

    // Socket data [x, y, r, flag, v.x, v.y]
    let packSize = 6
      , socketData = new Float32Array(cachedPlayers.length * packSize);

    _.each(cachedPlayers, (player, index) => {
      // Update physics
      player.body.circle.add(player.body.v);
      player.body.v.xy = [
          player.body.v.x * .95
        , player.body.v.y * .95
      ];

      // Set data
      socketData.set([
        /** position */
          player.body.circle.x
        , player.body.circle.y
        , player.body.circle.r
        , 0 /** todo: Flags */

        /** velocity */
        , player.body.v.x
        , player.body.v.y
      ], index * packSize)
    });

    // Broadcast
    this.broadcast("roomUpdate", socketData.buffer);
  }

  /**
   * Start/stop room loop
   */
  start() {
    this.physicsInterval && this.stop();
    this.physicsInterval = setInterval(this._updatePhysics.bind(this), 1000 / 60);
  }
  stop() {
    clearInterval(this.physicsInterval);
  }

  /**
   * Set player team
   * @param player    player
   * @param newTeam   New team
   * @returns {Room}
   */
  setTeam(player, newTeam) {
    player.team = newTeam || "spectators";

    // Reload teams
    newTeam && this._broadcastSettings();
    return this;
  }

  /**
   * Broadcast to all sockets connected to room
   * @param arguments Broadcast arguments
   * @returns {Room}
   */
  broadcast() {
    let obj = io.sockets.in(this.name);
    obj && obj.emit.apply(obj, arguments);
    return this;
  }

  /**
   * Send room settings to all player socket
   * @param socket  Socket
   * @returns {Room}
   * @private
   */
  _broadcastSettings(socket) {
    let data = {
        teams: this.teamsHeaders
      , board: this.board
    };
    (socket ? socket.emit.bind(socket) : this.broadcast.bind(this))("roomSettings", data);
    return this;
  }

  /**
   * Join to room
   * @param player  Player
   * @returns {Room}
   */
  join(player) {
    // Adding to list
    player.room = this;
    player.initBody();

    // Join socket
    player.socket.join(this.name);

    this.players.push(player);
    this.setTeam(player);

    // Broadcast to except player
    player.socket.broadcast.to(this.name).emit("roomPlayerJoin", {
        team: "spectators"
      , nick: player.nick
    });

    // Send list of players to player
    this._broadcastSettings(player.socket);
    return player;
  }

  /**
   * Leave player from room
   * @param player  Player
   * @returns {Room}
   */
  leave(player) {
    if(!player.team)
      return;

    // Leave
    this.broadcast("roomPlayerLeave", _.pick(player, "team", "nick"));

    // Reset variables for future room
    player.room = player.team = player.body = null;

    _.remove(this.players, player);
    this.admin === player && this.destroy();
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
        , password: room.isLocked() ? "yes" : "no"
        , players: _.flatten(this.player).length + "/" + room.maxPlayers
      };
    });
  }
}

/** Export modules */
module.exports = {
  Room: Room
};