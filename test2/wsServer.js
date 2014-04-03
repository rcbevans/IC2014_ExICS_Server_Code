var sys = require("sys");
var WebSocketServer = require("ws").Server;

var ldapAuthenticate = require("./wsAuth").authenticate;

var MSG_TYPE = {
	PROTOCOL_HANDSHAKE: {
		value: 0,
		name: "PROTOCOL_HANDSHAKE"
	},
	GET_USERS: {
		value: 1,
		name: "GET_USERS"
	},
	SEND_MESSAGE: {
		value: 2,
		name: "SEND_MESSAGE"
	},
	FAILURE_OCCURRED: {
		value: -1,
		name: "FAILURE_OCCURRED"
	},
	TERMINATE_CONNECTION: {
		value: -3,
		name: "TERMINATE_CONNECTION"
	}
};

var counter = 0;
var clients = [];

console.log("Starting WebSocket Server");
var wss = new WebSocketServer({
	port: 8080
});

wss.on('connection', onConnection);

// Function Definitions for callbacks

function onConnection(socket) {

	console.log("New User Connecting");

	counter++;

	console.log("We now have %d Users", counter);

	socket.on('message', onMessage);
	socket.on('close', onClose);

	var auth = false;
	var username = "";

	function onMessage(data, flags) {
		try {
			var parsedMessage = JSON.parse(data);
			switch (parseInt(parsedMessage["header"]["type"])) {
				case MSG_TYPE.PROTOCOL_HANDSHAKE.value:
					console.log("Received protocol handshake from user %s", parsedMessage["header"]["sender"]);
					ldapAuthenticate(parsedMessage["payload"]["username"], parsedMessage["payload"]["password"], completeAuth);
					break;

				case MSG_TYPE.SEND_MESSAGE.value:
					if (!auth) {
						closeSocket(parsedMessage["header"]["sender"]);
					} else {
						console.log("Received Send Message Response From User %s", username);
						if (parsedMessage["header"]["receiver"] == "") {
							for (var i = 0; i < clients.length; i++) {
								if (clients[i] != socket) {
									clients[i].send(data);
								}
							}
						} else {
							var found = false;
							for (var i = 0; i < clients.length; i++) {
								if (clients[i] != socket && clients[i].name.toLowerCase() == parsedMessage["header"]["receiver"].toLowerCase()) {
									clients[i].send(data);
									found = true;
									break;
								}
							}
							if (!found) {
								var response;
								response["header"]["type"] = MSG_TYPE.FAILURE_OCCURRED.value;
								response["header"]["sender"] = parsedMessage["header"]["sender"];
								response["header"]["receiver"] = parsedMessage["header"]["receiver"];
								response["payload"] = parsedMessage["payload"];
								socket.send(JSON.stringify(response));
							}
						}
					}
					break;

				case MSG_TYPE.TERMINATE_CONNECTION.value:
					console.log("Received request to disconnect from user %s", parsedMessage["header"]["sender"]);
					socket.close();
					counter--;
					console.log("We now have %d users", counter);
					break;

				default:
					console.log("Unknown Message type Received, closing socket");
					socket.close();
					counter--;
					console.log("We now have %d users", counter);
					break;
			}
		} catch (e) {
			console.log("An error has occurred parsing message: %s", data);
		}
	}

	function onClose(code, message) {
		if (auth) {
			for (var i = 0; i < clients.length; i++) {
				if (clients[i] == socket) {
					clients.splice(i, 1);
					break;
				}
			}
		} else {

		}
	}

	function closeSocket(uname) {
		if(username != "")
			console.log("User %s was not authorised, terminating connection", username);
		else
			console.log("User %s was not authorised, terminating connection", uname);
		socket.close();
		counter--;
		console.log("We now have %d users", counter);
	}


	function completeAuth(uname, success) {
		if (success) {
			var id = clients.length;
			clients.push(socket);
			clients[id].uname = uname;
			username = uname;
			auth = true;
			console.log("Successfully authenticated user %s", uname);
		} else {
			console.log("Disconnecting user %s as authentication failed", uname);
			socket.close();
			counter--;
			console.log("We now have %d users", counter);
		}
	}
}