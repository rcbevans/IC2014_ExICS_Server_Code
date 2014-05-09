// WS Callbacks
var ExICSData = require('./ExICSSystemData').ExICSData;
var wsEventCallbacks = require('./wsEventCallbacks');
var serverUtils = require('./serverUtils');
var ldapAuthenticate = require('./ldapAuth').authenticate;
var MSG_TYPE = require('./protocolParameters').MSG_TYPE;

function onConnection(socket){

	var auth = false;
	var username = "";

	var systemData = ExICSData.getInstance();

	systemData.clientConnected();

	function onMessage(data, flags) {
		try {
			var parsedMessage = JSON.parse(data.toString());
			switch (parseInt(parsedMessage["header"]["type"])) {
				case MSG_TYPE.PROTOCOL_HANDSHAKE:
					serverUtils.log("Received protocol handshake from user " + parsedMessage["header"]["sender"]);
					ldapAuthenticate(parsedMessage["payload"]["username"], parsedMessage["payload"]["password"], completeAuth);
					break;

				case MSG_TYPE.SEND_MESSAGE:
					if (!auth) {
						closeSocket(parsedMessage["header"]["sender"]);
					} else {
						serverUtils.log("Received Send Message Response From User %s", username);
						if (parsedMessage["header"]["receiver"] === "") {
							systemData.sendToAllClients(data);
						} else {
							systemData.sendToClient(parsedMessage["header"]["receiver"], data, function(){
								systemData.sendFailure(socket, parsedMessage);
							});
						}
					}
					break;

				case MSG_TYPE.TERMINATE_CONNECTION:
					serverUtils.log("Received request to disconnect from user %s", parsedMessage["header"]["sender"]);
					socket.close();
					systemsystemData.clientDisconnected();
					break;

				default:
					serverUtils.log("Unknown Message type Received, closing socket");
					socket.close();
					counter--;
					serverUtils.log("We now have %d users", counter);
					break;
			}
		} catch (e) {
			serverUtils.log("An error has occurred parsing message: " + data);
			serverUtils.log("Error: " + e.toString());
		}
	}

	function onClose(code, message) {
		if (auth) {
			systemData.removeClient(socket);
			systemData.clientDisconnected();
		} else {
			systemData.clientDisconnected();
		}
	}

	function closeSocket(uname) {
		if (username != "")
			serverUtils.log("User " + username + " was not authorised, terminating connection");
		else
			serverUtils.log("User was not authorised, terminating connection");
		socket.close();
	}


	function completeAuth(uname, success) {
		if (success) {
			systemData.addClient(socket, uname);
			username = uname;
			auth = true;
			serverUtils.log("Successfully authenticated user " + uname);
			systemData.sendSuccess(socket, uname);
		} else {
			serverUtils.log("Disconnecting user " + uname + " as authentication failed");
			socket.close();
		}
	}

	socket.on('message', onMessage);
	socket.on('close', onClose);
}

exports.onConnection = onConnection;