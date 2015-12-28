"use strict";
const io = require("socket.io")
    , chalk = require("chalk");

const Player = require("./player.js");

io
  .listen(3000)
  .on("connection", Player.create);