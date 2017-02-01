const mosca = require('mosca');
const kevents = require('./kemitter');
const authenticator = require('./authenticator');
//const tv = requier('./topic-ventilator');
const debug = require('debug')('broker - ');


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
  that.topicHandlers = {};
}

/**
* Start the MQTT broker and attach listeners on it
*/
broker.prototype.start = function start() {
  debug('Stop Server');
  const that = this;
  const server = new mosca.Server(that.settings);
    // When the server is in ready status
    // Authenticate clients
    // Authorize clients
  server.on('ready', () => {
     
     // Prepare the authenticator;
    authenticator(); 
    kevents.on('authenticator.ready', (authHandler) => {
      server.authenticate = authHandler.authenticate;
      server.authorizePublish = authHandler.authorizePublish;
      kevents.emit('server.started');
      debug('Authenticator handlers registered on mosca');
    });

    // Spin-up topic ventillators;
    

    
  });

  server.on('clientConnected', (client) => {
    debug('client connected');
    kevents.emit('client.connected', client);
  });

  server.on('clientDisconnected', (client) => {
    debug('client disconnected');
    kevents.emit('client.disconnected', client);
  });

  server.on('published', (msg, client) => {
    // If client exists then its a published message, else it could be a connect/disconnect message
    debug('published %o', msg);
    if (client) {
      debug('client %s published a message', client.id);
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
  debug('Stop server');
  const that = this;
  that.mqtt_server.close();
};

module.exports = broker;
