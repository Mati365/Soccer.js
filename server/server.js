"use strict";
const io = require("socket.io")
    , request = require("request")
    , chalk = require("chalk");

// Get global ip
let ip = null;
request("https://diagnostic.opendns.com/myip", (err, data) =>ip = data.body);

// Try register in global server
setInterval(() => {
  ip && request.post({url: "http://soccerjs.herokuapp.com/list", form: {ip}});
}, 2000);

// Init server
console.log(chalk.red("Server is listening..."));
module.exports = io.listen(3000);