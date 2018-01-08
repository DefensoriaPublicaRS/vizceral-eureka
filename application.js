var express = require('express');
var app = express();
var configuration = require('./configuration').get();
var vizceralCache = require('./vizceralCache.js');

require('promise.prototype.finally').shim();
require("./data_extraction/extractionLoop").startLoop();

app.use(express.static('webapp/dist'));

app.get('/data', function (request, response) {
    response.setHeader('content-type', 'application/json');
    response.write(JSON.stringify(vizceralCache.get()));
    response.end();
});

console.log('Starting server on port ' + configuration.serverPort);
app.listen(configuration.serverPort);
