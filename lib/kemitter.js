const EventEmitter = require('events').EventEmitter;
const util = require('util');

/**
* Returns a singleton emitter for Kangeyam
* convention is to emit events by <module/entity name>.<event name>
* E.g. Emit 'server.closed' if the server is closed
*/
function KEmitter() {
  EventEmitter.call(this);
}

util.inherits(KEmitter, EventEmitter);

const singletonEmitter = (function singletonEmitter() {
  let instance;
  function createInstance() {
    return new KEmitter();
  }
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
}());

module.exports = singletonEmitter.getInstance();
