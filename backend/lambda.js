const serverless = require('serverless-http');
const app = require('./dist/index.js');

module.exports.handler = serverless(app);