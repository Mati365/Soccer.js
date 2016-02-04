import _ from "lodash";
import io from "socket.io-client";

/** Connect socket to server */
var socket = null;

/** Send ping and pong to server */
var latency = 0;
setInterval(() => {
  let t = Date.now();
  socket && socket.emit("latency", null, () => {
    latency = Date.now() - t;
  });
}, 100);

export default {
    get socket() { return socket; }

  /**
   * Connect to server
   * @param ip  Server ip
   */
  , connect(ip) {
    return new Promise((resolve, reject) => {
      socket = io.connect(`ws://${ip}:3000`, {'connect timeout': 500, 'max reconnection attempts': 1});
      socket.on("serverReady", resolve);

      // 'connect_failed' and 'connect timeout' are not working so trying with timeout
      setTimeout(() => {
        !socket.connected && reject("Server refused connection!");
      }, 1000);
    });
  }

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
          reject(callback.error || callback);
        else
          resolve(callback);
      });
    };
    return new Promise(resolver);
  }
}