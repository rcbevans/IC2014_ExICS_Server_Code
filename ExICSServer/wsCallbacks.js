// WS Callbacks
var ExICSData = require('./ExICSSystemData').ExICSData;
var serverUtils = require('./serverUtils').ServerUtils.getInstance();
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
						socket.close();
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
							serverUtils.log("Received Change Room Request from User " + username + " to room " + parsedMessage["payload"]["room"]);
							systemData.changeRoom(username, parsedMessage["payload"]["room"]);
							break;

						case PACKET_TYPE.EXAM_START:
							serverUtils.log("Received Request from User " + username + " to Start Exam " + parsedMessage['payload']['exam'] + " in room " + parsedMessage['payload']['room']);
							systemData.startExam(username, parsedMessage['payload']['room'], parsedMessage['payload']['exam'], function(){
								systemData.sendFailure(socket, username, "Failed to start exam " + parsedMessage['payload']['exam']);
							});
							break;

						case PACKET_TYPE.EXAM_PAUSE:
							serverUtils.log("Received Request from User " + username + " to Pause Exam " + parsedMessage['payload']['exam'] + " in room " + parsedMessage['payload']['room']);
							systemData.pauseExam(username, parsedMessage['payload']['room'], parsedMessage['payload']['exam'], function(){
								systemData.sendFailure(socket, username, "Failed to pause exam " + parsedMessage['payload']['exam']);
							});
							break;

						case PACKET_TYPE.EXAM_STOP:
							serverUtils.log("Received Request from User " + username + " to Stop Exam " + parsedMessage['payload']['exam'] + " in room " + parsedMessage['payload']['room']);
							systemData.stopExam(username, parsedMessage['payload']['room'], parsedMessage['payload']['exam'], function(){
								systemData.sendFailure(socket, username, "Failed to stop exam " + parsedMessage['payload']['exam']);
							});
							break;

						case PACKET_TYPE.EXAM_XTIME:
							serverUtils.log("Received Request from User " + username + " to Add " + parsedMessage['payload']['time'] + " Minutes to Exam " + parsedMessage['payload']['exam'] + " in room " + parsedMessage['payload']['room']);
							systemData.xtimeExam(username, parsedMessage['payload']['room'], parsedMessage['payload']['exam'], parsedMessage['payload']['time'], function(){
								systemData.sendFailure(socket, username, "Failed to add extra time to exam " + parsedMessage['payload']['exam']);
							});
							break;

						case PACKET_TYPE.SEND_MESSAGE_ALL:
							serverUtils.log("Received Send Message Response From User " + username);
							systemData.sendToAllClients(username, data);
							break;

						case PACKET_TYPE.SEND_MESSAGE_ROOM:
							systemData.sendToAllInRoom(username, parsedMessage["payload"]["room"], data);
							break;

						case PACKET_TYPE.SEND_MESSAGE_USER:
							systemData.sendToClient(username, parsedMessage["payload"]["username"], data, function(){
								systemData.sendMessageFailure(username, socket, parsedMessage, "Failed to send message to " + parsedMessage["payload"]["username"]);
							});
							break;

						case PACKET_TYPE.TERMINATE_CONNECTION:
							serverUtils.log("Received request to disconnect from user " + username);
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
			serverUtils.log('ERROR', "An error has occurred parsing message: " + data);
			serverUtils.log('ERROR', "Error: " + e.toString());
			serverUtils.log('ERROR', e.stack);
			systemData.sendFailure(socket, username, "An error has occurred parsing message: " + data);
		}
	}

	function onClose(code, message) {
		if (auth) {
			serverUtils.log(username + " Socket Closed, Removing From Connected Clients");
			systemData.removeClient(username, socket);
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
					systemData.sendAuthSuccess(socket, username);
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