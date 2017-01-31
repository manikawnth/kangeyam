global['kevents'] = require('./lib/kemitter.js');

var broker = require('./lib/broker');
var config = require('./config.json')

var server = new broker(config);
server.start();