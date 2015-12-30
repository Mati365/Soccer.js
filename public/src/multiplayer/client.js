import io from "socket.io-client";

var socket = io.connect("ws://localhost:3000");
socket.emit("setNick", "kupsztal", () => {});

export default {
    socket: socket

  /**
   * Emit data via socket
   * @param func  Socket function string
   * @param data  Socket data
   * @returns {Promise}
   */
  , emit: function(func, data) {
    let resolver = (resolve, reject) => {
      socket.emit(func, data, callback => {
        if(!callback || callback.error)
          reject(callback);
        else
          resolve(callback);
      });
    };
    return new Promise(resolver);
  }
}