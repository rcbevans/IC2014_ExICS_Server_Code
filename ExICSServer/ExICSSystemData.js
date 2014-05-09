//Node.JS singleton
var MSG_TYPE = require('./protocolParameters').MSG_TYPE;

var ExICSData = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init() {

    // Singleton

    // Private methods and variables
   	var connectedClientsCounter = 0;
	var connectedClients = [];
	var currentExams = [];

    return {
      // Public methods and variables
      clientConnected: function clientConnected(){
			connectedClientsCounter++;
			serverUtils.log("New Client Connected.  We now have " + connectedClientsCounter + " clients");
		},

		clientDisconnected: function clientDisconnected(){
			connectedClientsCounter--;
			serverUtils.log("Client Disconnected.  We now have " + connectedClientsCounter + " clients");
		},

		numConnectedClients: function numConnectedClients(){
			return connectedClientsCounter;
		},

		addClient: function addClient(wsSocket, username){
			var latest = connectedClients.length;
			connectedClients.push(wsSocket);
			connectedClients[latest].uname = username;
		},

		removeClient: function removeClient(wsSocket){
			for (var i = 0; i < connectedClients.length; i++) {
				if (connectedClients[i] == wsSocket) {
					connectedClients.splice(i, 1);
					break;
				}
			}
		},

		getClients: function getClients(){
			return connectedClients;
		},

		numClientsAuthenticated: function numClientsAuthenticated(){
			return connectedClients.length;
		},

		sendToAllClients: function sendToAllClients(data){
			for (var i = 0; i < connectedClients.length; i++) {
				connectedClients[i].send(data);
			}
		},

		sendToClient: function sendToClient(username, data, failureCallback){
			var success = false;
			for (var i = 0; i < connectedClients.length; i++) {
				if(connectedClients[i].uname === username){
					connectedClients[i].send(data);
					success = true;
					break;
				}
			}
			if(!success){
				failureCallback();
			}
		},

		sendSuccess: function sendSuccess(socket, uname) {
			var response = {};
			response["header"] = {};
			response["header"]["type"] = MSG_TYPE.SUCCESS;
			response["header"]["sender"] = uname;
			response["payload"] = {};
			response["payload"]["message"] = "Authentication Successful!";
			socket.send(JSON.stringify(response));
		},

		sendFailure: function sendFailure(socket, parsedMessage){
			var response = {};
			response["header"] = {};
			response["header"]["type"] = MSG_TYPE.FAILURE_OCCURRED;
			response["header"]["sender"] = parsedMessage["header"]["sender"];
			response["header"]["receiver"] = parsedMessage["header"]["receiver"];
			response["payload"] = parsedMessage["payload"];
			socket.send(JSON.stringify(response));
		},

		addCurrentExams: function addExam(exam){
			currentExams.push(exam);
		},

		clearCurrentExams: function clearCurrentExams(){
			while(currentExams.pop()){};
		},

		getCurrentExams: function getCurrentExams(){
			return currentExams;
		}
    };

  };

  return {

    getInstance: function () {

      if ( !instance ) {
        instance = init();
      }

      return instance;
    }

  };

})();

exports.ExICSData = ExICSData;


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