const mosca = require('mosca');
const kevents = require('./kemitter');
const authenticator = require('./authenticator');

// var authorizePublish = authorize.publish;
// var authorizeSubscribe = authorize.subscribe;

/**
* Broker to
* @constructor
* @param {object} config The configuration options object
*/
function broker(config) {
  const that = this;

  function prepareConfig() {
        // Settings for mosca broker
    that.settings = {};
    that.settings.secure = {
      port: config.brokerSettings.port,
      keyPath: config.brokerSettings.keyFile,
      certPath: config.brokerSettings.certFile,
    };
  }

    // Bootstrap broker
  prepareConfig();
}

/**
* Start the MQTT broker and attach listeners on it
*/
broker.prototype.start = function start() {
  const that = this;
  const server = new mosca.Server(that.settings);
    // When the server is in ready status
    // Authenticate clients
    // Authorize clients
  server.on('ready', () => {
    authenticator(); // Prepare the authenticator;

    kevents.on('authenticator.ready', (authHandler) => {
      server.authenticate = authHandler.authenticate;
      server.authorizePublish = authHandler.authorizePublish;
      kevents.emit('server.started');
    });

        // server.authorizeSubscribe = authorizeSubscribe;
  });

  server.on('clientConnected', (client) => {
        // console.log("Client connected");
        // console.log(client.id);
    kevents.emit('client.connected', client);
  });

  server.on('clientDisconnected', (client) => {
        // console.log("Client connected");
    kevents.emit('client.disconnected', client);
  });

  server.on('published', (msg, client) => {
    // If client exists then its a published message, else it could be a connect/disconnect message
    if (client) {
      console.log(client.id);
    }
  });

  server.on('closed', () => {
    kevents.emit('server.closed');
  });

  that.mqtt_server = server;
};

/**
* Stop the MQTT broker
 */
broker.prototype.stop = function stop() {
  const that = this;
  that.mqtt_server.close();
};

module.exports = broker;
