var server = require('./apiServer');
var router = require('./requestRouter');
var requestHandlers = require('./requestHandlers');

var handles = {};

handles['/'] = requestHandlers.redirect;
handles['/examData'] = requestHandlers.examData;

server.startServer(8080, router, handles);
server.startSSLServer(8443, router, handles);