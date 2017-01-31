const mongodb = require('mongodb');
const kevents = require('../kemitter');
/**
 * Creates a mongodb client and emits an event
 * 'auth.mongo.connected' once it is connected to the client db collection
 */
function MongoAuth(connector) {
  console.log('Inside MongoAuth');

  const MongoClient = mongodb.MongoClient;
  const url = connector.connURI;
  const coll = connector.collection;

  MongoClient.connect(url)
    .then((db) => {
        // if(err) {throw err;}
      console.log('Sub handler');
      const mongoAuthHandler = {
        authenticate(user, pass) {
          console.log(coll);
          return new Promise((resolve, reject) => {
            db.collection(coll).findOne({ user })
                    .then((doc) => {
                      resolve(doc.pass === pass);
                    })
                    .catch((err) => {
                      reject(err);
                    });
          });
        },

        authorizePublish(id, topic) {
          console.log(id);
          console.log(topic);
        },

        authorizeSubscribe(id, topic) {
          console.log(id);
          console.log(topic);
        },
      };
      console.log('Sub handler emitting');
      kevents.emit('authenticator.connected', mongoAuthHandler);
    }, (err) => {
      console.log(err);
    });
}

module.exports = MongoAuth;
