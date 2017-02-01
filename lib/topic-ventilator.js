const zmq = require('zeromq');
const kevents = require('./kemitter');
const debug = require('debug');

function TopicVentilator(settings) {
  const that = this;

  that.topicName = settings.topic;
  that.pushPort = settings.ventilatorPort;
  that.limitWorkers = settings.workerInstances;

     // Just create a push socket. Don't bind it yet.
  that.__sender = zmq.socket('push');

    // debugger implementation. May need changes;
  that.__debug = debug(`topic-ventilator:${that.topicName} - `);
}

Topicventilator.prototype.start = function start() {
  const that = this;
  const bindURI = `tcp://*:${that.pushPort}`;
     // Purposefully sync bind.
  that.__sender.bindSync(bindURI);
  that.__debug('ventilator started');
};

Topicventilator.prototype.send = function send(msg) {
  const that = this;
  that.__debug('ventilator pushed the message %o', msg);
};

Topicventilator.prototype.stop = function stop() {
  const that = this;
  that.__sender.close();
  that.__sender.on('close', () => {
    kevents.emit('ventilator.closed', that.topicName);
  });
};

module.exports = Topicventilator;
