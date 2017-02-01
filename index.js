global['kevents'] = require('./lib/kemitter.js');

const config = require('./config.json');
const broker = require('./lib/broker');

const server = new broker(config);
server.start();