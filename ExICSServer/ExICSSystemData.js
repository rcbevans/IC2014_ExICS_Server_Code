//Node.JS singleton

function ExICSData() {
	var instance;

	ExICSData = function {
		return instance;
	}

	ExICSData.prototype = this;

	instance = new ExICSData();

	instance.constructor = ExICSData;

	instance.clientConnected = function clientConnected(){
		connectedClientsCounter++;
		serverUtils.log("New Client Connected.  We now have " + connectedClientsCounter + " clients");
	};
}

// var ExICSData = function ExICSData(){
// 	var serverUtils = require('./serverUtils');
	
// 	var connectedClientsCounter = 0;
// 	var connectedClients = [];
// 	var currentExams = [];

// 	clientConnected: function clientConnected(){
// 		connectedClientsCounter++;
// 		serverUtils.log("New Client Connected.  We now have " + connectedClientsCounter + " clients");
// 	};

// 	clientDisconnected: function clientDisconnected(){
// 		connectedClientsCounter--;
// 		serverUtils.log("Client Disconnected.  We now have " + connectedClientsCounter + " clients");
// 	};

// 	numConnectedClients: function numConnectedClients(){
// 		return connectedClientsCounter;
// 	};

// 	addClient: function addClient(wsSocket, username){
// 		var latest = connectedClients.length;
// 		connectedClients.push(wsSocket);
// 		connectedClients[latest].uname = username;
// 	};

// 	if(ExICS.caller != ExICSData.getInstance){
// 		throw new Error("This object cannot be instanciated!");
// 	}
// }

// ExICSData.instance = null;

// ExICSData.getInstance = function(){
// 	if(this.instance == null){
// 		this.instance = new ExICSData();
// 	}
// 	return this.instance;
// };