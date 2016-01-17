"use strict";
const io = require("socket.io")
    , chalk = require("chalk");

console.log(chalk.red("Server is listening..."));
module.exports = io.listen(3000);