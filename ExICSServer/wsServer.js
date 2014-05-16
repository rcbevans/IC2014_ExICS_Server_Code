// wsServer
var WebSocketServer = require("ws").Server,
	wsCallbacks = require('./wsCallbacks');
	serverUtils = require('./serverUtils').ServerUtils.getInstance();

function startWSServer(wsPort){
	serverUtils.log("Starting Websocket Server on Port " + wsPort);
	var wss = new WebSocketServer({port: wsPort});
	wss.on('connection', wsCallbacks.onConnection);
	serverUtils.log("Successfully Started Websocket Server");
}

exports.startWSServer = startWSServer;