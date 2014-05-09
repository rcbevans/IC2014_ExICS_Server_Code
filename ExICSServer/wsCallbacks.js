// WS Callbacks
var ExICSData = require('./ExICSSystemData');
var wsEventCallbacks = require('./wsEventCallbacks')

function onConnection(socket){

	var auth = false;
	var username = "";

	console.log(ExICSData);

	ExICSData.clientConnected();

	socket.on('message', wsEventCallbacks.onMessage);
	socket.on('close', wsEventCallbacks.onClose);

	var auth = false;
	var username = "";

}

exports.onConnection = onConnection;