import _ from "lodash";
import io from "socket.io-client";

/** Connect socket to server */
var socket = io.connect("ws://localhost:3000");

/** Send ping and pong to server */
var latency = 0;
setInterval(() => {
  let t = Date.now();
  socket.emit("latency", null, () => {
    latency = Date.now() - t;
  });
}, 100);

export default {
    socket: socket

  /**
   * Get client ping
   */
  , get ping() { return latency;  }

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
          reject(callback.error);
        else
          resolve(callback);
      });
    };
    return new Promise(resolver);
  }
}