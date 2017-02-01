const config = require('../config.json');
const kevents = require('./kemitter');
const MongoAuth = require('./auth/mongo');
const debug = require('debug')('authenticator - ');
/**
 * Authenticator and topic pub/sub authorizer for clients.
 *
 * Authenticator registering - It performs the following functions in sequence
 *   1. Based on the connector, it will require the corresponding db connector module
 *   2. The sub module will successfully connect to client database
 *   3. We also register a `authenticator.connected` event listener, from which we'll get the subHandler object which has:
 *     - subHandler.authenticate
 *     - subHandler.authPublish
 *     - subHandler.authSubscribe
 *   4. Then we'll populate the mosca mqtt broker's authenticator/authorizer functions
 *   5. Finally emit an `authenticator.ready` event and pass the mosca auth functions in an object
 *   6. Once the ready event is emitted, mosca registers the functions against its mqtt server's auth handlers
 *   7. By now, we successfully registered mqtt broker's server.authenticate, server.authPublish, server.authSubscribe (refer broker.js)
 *
 * Authenticator invoking -
 *   1. Mosca will invoke the authenticate function whenever a client attempts to connect to mqtt broker
 *   2. The auth function checks the client.id and user. If not equal, invoke mosca auth callback with authenticated as `false`
 *   3. Else, the Authenticate function will call the authenticate function of the sub-handler passing user/pass parms
 *   4. The sub-handler returns a promise to resolve the `authenticated` status or reject with an error.
 *   5. If the promise is resolved, we'll invoke mosca's auth callback with the corresponding `authenticated` status
 *
 */
function Authenticator() {
  const connector = config.clientSettings.authConnector;

  switch (connector.type) {
    case 'mongo':
      debug('Invoking mongo auth connector');
      MongoAuth(connector);
      break;

    default:
      break;
  }

  kevents.on('authenticator.connected', (subHandler) => {
    debug('Sub authenticator connected');
    const authenticate = function authenticate(client, user, pass, cb) {
      if (client.id !== user) {
        debug('%s has invalid client id', user);
        cb(null, false);
      } else {
        const authenticator = subHandler.authenticate(user, pass);
        authenticator.then((authenticated) => {
          debug('Is %s authenticated - %s', user, authenticated);
          cb(null, authenticated);
        })
                .catch((err) => {
                  throw err;
                });
      }
    };

    const authorizePublish = function authPublish(client, topic, payl, cb) {
      debug('Authorizing publish for %s on %s', client.id, topic);
      cb(null, true);
    };


    const authHandler = {
      authenticate,
      authorizePublish,
    };

    kevents.emit('authenticator.ready', authHandler);
  });
}


module.exports = Authenticator;
