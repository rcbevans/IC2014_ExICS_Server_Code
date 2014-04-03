var sys = require("sys"),
    WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 8080});

var counter = 0;
var clients = [];

var MSG_TYPE = {
	FIRST_CONNECT : {value : 0, name : "FIRST_CONNECT"},
	GET_USERS : {value : 1, name : "GET_USERS"},
	SEND_MESSAGE : {value : 2, name : "SEND_MESSAGE"}
};

wss.on('connection', function(socket){

	console.log("New User Connecting");

	counter++;
	clients.push(socket);

	console.log("We now have %d Users", counter);

	socket.on('message', function(data, flags){
		try{
			var parsed = JSON.parse(data);
			console.log("Got Message " + data);
			switch(parsed["message_type"])
			{
				case MSG_TYPE.FIRST_CONNECT.value:
					clients[id].uname = parsed["from"];
					var newUser = {"message_type" : MSG_TYPE.FIRST_CONNECT.value, "payload" : clients[id].uname}
					for (var i = 0; i < clients.length; i++) {
						if (i != id){
							clients[i].send(JSON.stringify(newUser));
						}
					};
					console.log('sent ' + newUser.tostring());
					break;
				case MSG_TYPE.GET_USERS.value:
					var response = {"message_type" : MSG_TYPE.GET_USERS.value,
					"payload" : []};
					for (var i = 0; i < clients.length; i++) {
						if (i != id){
							response.payload.push(clients[i].uname);
						}
					};
					socket.send(JSON.stringify(response));
					console.log('sent ' + response.tostring());
					break;
				case MSG_TYPE.SEND_MESSAGE.value:

					break;
			}
		}catch(e){
			console.log("Received " + data);
		}

	});

	socket.on('close', function(code, message){

		console.log("Connection to %s Closed", clients[id].uname);
		clients.splice(id);
		counter--;
		console.log("We now have %d users", counter);

	});
});