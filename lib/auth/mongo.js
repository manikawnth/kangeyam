const mongodb = require('mongodb');
const kevents = require('../kemitter');
const debug = require('debug')('auth-mongo - ');
/**
 * Creates a mongodb client and emits an event
 * 'auth.mongo.connected' once it is connected to the client db collection
 */
function MongoAuth(connector) {
  const MongoClient = mongodb.MongoClient;
  const url = connector.connURI;
  const coll = connector.collection;

  debug('MongoAuth invoked');
  MongoClient.connect(url)
    .then((db) => {
      const mongoAuthHandler = {
        authenticate(user, pass) {
          debug('authenticating %s', user);
          return new Promise((resolve, reject) => {
            db.collection(coll).findOne({ user }, (err, doc) => {
              if (err) {
                reject(err);
              } else {
                // .toString() is necessary 'coz the type of pass is `object` and not `string`
                const passx = pass.toString();
                resolve(doc.pass.toString() === passx);
              }
            });
          });
        },

        authorizePublish(id, topic) {
          debug('Authorizing %s for publish on topic %s', id, topic);
        },

        authorizeSubscribe(id, topic) {
          debug('Authorizing %s for subscribe on topic %s', id, topic);
        },
      };
      kevents.emit('authenticator.connected', mongoAuthHandler);
    }, (err) => {
      debug('Error encountered: %s', err);
    });
}

module.exports = MongoAuth;
