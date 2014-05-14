// WS Callbacks
var ExICSData = require('./ExICSSystemData').ExICSData;
var serverUtils = require('./serverUtils');
var ldapAuthenticate = require('./ldapAuth').authenticate;
var PACKET_TYPE = require('./protocolParameters').PACKET_TYPE;

function onConnection(socket){

	var auth = false;
	var username = "";

	var systemData = ExICSData.getInstance();

	systemData.clientConnected();

	function onMessage(data, flags) {
		try {
			var parsedMessage = JSON.parse(data.toString());
			if(!auth){
				switch (parseInt(parsedMessage["header"]["type"])) {
					case PACKET_TYPE.PROTOCOL_HANDSHAKE:
						serverUtils.log("Received protocol handshake from user " + parsedMessage["payload"]["username"]);
						ldapAuthenticate(parsedMessage["payload"]["username"], parsedMessage["payload"]["password"], completeAuth);
						break;

					case PACKET_TYPE.TERMINATE_CONNECTION:
						serverUtils.log("Received request to disconnect from user " + parsedMessage["header"]["sender"]);
						break;

					default:
						serverUtils.log("Unauthorised User Sent Non Handshake Request, Closing Connection");
						socket.close();
						break;
				}
			} else {
				if(!(parsedMessage["header"]["sender"] === username)){
					serverUtils.log("Message Received from User " + parsedMessage["header"]["sender"] + " Does not Match Authenticated Username " + username);
					socket.close();
				} else {
					switch (parseInt(parsedMessage["header"]["type"])) {
						case PACKET_TYPE.SYSTEM_STATE:
							serverUtils.log("Received request for Current System State from " + username);
							systemData.pushSystemState(socket);
							break;

						case PACKET_TYPE.CHANGE_ROOM:
							console.log("I'm Here", parsedMessage);
							systemData.changeRoom(username, parsedMessage["payload"]["room"]);
							break;

						case PACKET_TYPE.SEND_MESSAGE:
							serverUtils.log("Received Send Message Response From User " + username);
							if (parsedMessage["header"]["receiver"] === "") {
								systemData.sendToAllClients(username, data);
							} else {
								systemData.sendToClient(parsedMessage["header"]["receiver"], data, function(){
									systemData.sendMessageFailure(socket, parsedMessage, "Failed to send message to " + parsedMessage["header"]["receiver"]);
								});
							}
							break;

						case PACKET_TYPE.TERMINATE_CONNECTION:
							serverUtils.log("Received request to disconnect from user " + username)
							socket.close();
							break;

						default:
							serverUtils.log("Unknown Message type Received, closing socket");
							socket.close();
							break;
					}
				}
			}
		} catch (e) {
			serverUtils.log("An error has occurred parsing message: " + data);
			serverUtils.log("Error: " + e.toString());
		}
	}

	function onClose(code, message) {
		if (auth) {
			systemData.removeClient(socket);
		}
		systemData.clientDisconnected();
	}

	function completeAuth(uname, success) {
		if (success) {
			systemData.addClient(socket, uname, function(success){
				if(!success){
					serverUtils.log("User " + uname + " is already connected, closing latest connection");
					socket.close();
				} else {
					username = uname;
					auth = true;
					serverUtils.log("Successfully authenticated user " + uname);
					systemData.synchronizeServerState(socket);
				}
			});
		} else {
			serverUtils.log("Disconnecting user " + uname + " as authentication failed");
			socket.close();
		}
	}

	socket.on('message', onMessage);
	socket.on('close', onClose);
}

exports.onConnection = onConnection;