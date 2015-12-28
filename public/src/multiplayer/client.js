import io from "socket.io-client";

export default class Client {
  constructor() {
    let socket = io.connect("ws://localhost:3000");
    socket.emit("setNick", "kutas321", data => {

    });
  }
}