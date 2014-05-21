//Node.JS singleton
var PACKET_TYPE = require('./protocolParameters').PACKET_TYPE;

var ExICSData = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init() {

    // Singleton

    var serverUtils = require('./serverUtils').ServerUtils.getInstance();

    var syncLock = false;

    // Private methods and variables
   	var connectedClientsCounter = 0;

   	//Object with socket indexed by username
	var connectedClients = {};

	//Object with arrays indexed by room number
	var currentExams = {};
	var lastSynchronized = new Date(-8640000000000000);
	//0:00 this morning
	// var s1Begin = new Date();
	var s1Begin = getMockTime();
	s1Begin.setHours(0);
	s1Begin.setMinutes(1);
	//13.30 Today
	// var s2Begin = new Date();
	var s2Begin = getMockTime();
	s2Begin.setHours(13);
	s2Begin.setMinutes(30);
	//Midnight Tonight
	// var s2End = new Date();
	var s2End = getMockTime();
	s2End.setHours(23);
	s2End.setMinutes(59);

	refreshSessionTimes: function refreshSessionTimes(currentTime){

		serverUtils.log("Refreshing Session Times");

		if((currentTime.getDay() != s1Begin.getDay()) || (currentTime.getMonth() != s1Begin.getMonth())){
			s1Begin = new Date();
			s1Begin.setHours(0);
			s1Begin.setMinutes(1);
		}
		if((currentTime.getDay() != s2Begin.getDay()) || (currentTime.getMonth() != s2Begin.getMonth())){
			s2Begin = new Date();
			s2Begin.setHours(0);
			s2Begin.setMinutes(1);
		}
		if((currentTime.getDay() != s2End.getDay()) || (currentTime.getMonth() != s2End.getMonth())){
			s2End = new Date();
			s2End.setHours(0);
			s2End.setMinutes(1);
		}
	}

	getMockTime: function getMockTime(){
		var mockDate = new Date();
		mockDate.setFullYear(2013);
		mockDate.setMonth(3);
		mockDate.setDate(29);
		mockDate.setHours(1);
		mockDate.setMinutes(35);
		mockDate.setSeconds(0);
		return mockDate;
	}

	broadcastConnected: function broadcastConnected(username){
		var msg = {};
		msg['header'] = {};
		msg['header']['type'] = PACKET_TYPE.USER_CONNECTED;
		msg['header']['sender'] = 'SYS';
		msg['payload'] = {};
		msg['payload']['username'] = username;
		for(var user in connectedClients){
			if(connectedClients.hasOwnProperty(user) && !(user === username)){
				connectedClients[user]["Socket"].send(JSON.stringify(msg));
			}
		}
	}

	broadcastRoomChange: function broadcastRoomChange(username, newRoom){
		var msg = {};
		msg['header'] = {};
		msg['header']['type'] = PACKET_TYPE.CHANGE_ROOM;
		msg['header']['sender'] = 'SYS';
		msg['payload'] = {};
		msg['payload']['username'] = username;
		msg['payload']['room'] = newRoom;
		for(var user in connectedClients){
			if(connectedClients.hasOwnProperty(user) && !(user === username)){
				connectedClients[user]["Socket"].send(JSON.stringify(msg));
			}
		}
	}

	broadcastExamStateChange: function broadcastExamStateChange(msgType, room, exam){
		var msg = {};
		msg['header'] = {};
		msg['header']['type'] = msgType;
		msg['header']['sender'] = 'SYS';
		msg['payload'] = {};
		msg['payload']['room'] = room;
		msg['payload']['exam'] = exam;
		for(var user in connectedClients){
			if(connectedClients.hasOwnProperty(user)){
				connectedClients[user]["Socket"].send(JSON.stringify(msg));
			}
		}
	}

	broadcastExtraTime: function broadcastExtraTime(room, exam, time){
		var msg = {};
		msg['header'] = {};
		msg['header']['type'] = PACKET_TYPE.EXAM_XTIME;
		msg['header']['sender'] = 'SYS';
		msg['payload'] = {};
		msg['payload']['room'] = room;
		msg['payload']['exam'] = exam;
		msg['payload']['time'] = time;
		for(var user in connectedClients){
			if(connectedClients.hasOwnProperty(user)){
				connectedClients[user]["Socket"].send(JSON.stringify(msg));
			}
		}
	}

	broadcastDisconnected: function broadcastDisconnected(username){
		var msg = {};
		msg['header'] = {};
		msg['header']['type'] = PACKET_TYPE.USER_DISCONNECTED;
		msg['header']['sender'] = 'SYS';
		msg['payload'] = {};
		msg['payload']['username'] = username;
		for(var user in connectedClients){
			if(connectedClients.hasOwnProperty(user) && !(user === username)){
				connectedClients[user]["Socket"].send(JSON.stringify(msg));
			}
		}
	}

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

		addClient: function addClient(wsSocket, username, callback){
			if(!(connectedClients.hasOwnProperty(username))){
				connectedClients[username] = {};
				connectedClients[username]["Socket"] = wsSocket;
				connectedClients[username]["Room"] = -1;
				callback(true);
			} else {
				callback(false);
			}
			broadcastConnected(username);
			this.printClients();
		},

		changeRoom: function changeRoom(username, newRoom){
			if(connectedClients.hasOwnProperty(username)){
				connectedClients[username]["Room"] = newRoom;
			}
			broadcastRoomChange(username, room);
			this.printClients();
		},

		removeClient: function removeClient(username, wsSocket){
			var uname = "";
			var room = "";
			if(connectedClients.hasOwnProperty(username) && connectedClients[username]['Socket'] === wsSocket){
				serverUtils.log("Successfully Removed " + username);
				delete connectedClients[username];
			}
			broadcastDisconnected(uname, room);
			this.printClients();
		},

		startExam: function startExam(room, exam, failure){
			if(currentExams.hasOwnProperty(room)){
				var found = false;
				for(var i = 0; i < currentExams[room].length; i++){
					if(currentExams[room][i]['Exam/Subexam'] === exam){
						found = true;
						currentExams[room][i]['Running'] = true;
						currentExams[room][i]['Start'] = new Date().toJSON();
						serverUtils.log("Successfully started exam " + exam + " in room " + room);
						break;
					}
				}
				if(found){
					this.broadcastExamStateChange(PACKET_TYPE.EXAM_START, room, exam);
					this.pushSystemStateAllClients();
				} else {
					failure();
				}
			} else {
				failure();
			}
		},

		pauseExam: function pauseExam(room, exam, failure){
			if(currentExams.hasOwnProperty(room)){
				var found = false;
				for(var i = 0; i < currentExams[room].length; i++){
					if(currentExams[room][i]['Exam/Subexam'] === exam){
						found = true;
						currentExams[room][i]['Running'] = false;
						serverUtils.log("Successfully paused exam " + exam + " in room " + room);
						break;
					}
				}
				if(found){
					this.broadcastExamStateChange(PACKET_TYPE.EXAM_PAUSE, room, exam);
					this.pushSystemStateAllClients();
				} else {
					failure();
				}
			} else {
				failure();
			}
		},

		stopExam: function stopExam(room, exam, failure){
			if(currentExams.hasOwnProperty(room)){
				var found = false;
				for(var i = 0; i < currentExams[room].length; i++){
					if(currentExams[room][i]['Exam/Subexam'] === exam){
						found = true;
						currentExams[room][i]['Running'] = false;
						currentExams[room][i]['Finish'] = new Date().toJSON(); 
						serverUtils.log("Successfully stopped exam " + exam + " in room " + room);
						break;
					}
				}
				if(found){
					this.broadcastExamStateChange(PACKET_TYPE.EXAM_STOP, room, exam);
					this.pushSystemStateAllClients();
				} else {
					failure();
				}
			} else {
				failure();
			}
		},

		xtimeExam: function xtimeExam(room, exam, time, failure){
			if(currentExams.hasOwnProperty(room)){
				var found = false;
				for(var i = 0; i < currentExams[room].length; i++){
					if(currentExams[room][i]['Exam/Subexam'] === exam){
						found = true;
						currentExams[room][i]['xTime'] = +currentExams[room][i]['xTime'] + +time;
						serverUtils.log("Successfully extended time in exam " + exam + ", room " + room + " by " + time + " to " + currentExams[room][i]['xTime']);
						break;
					}
				}
				if(found){
					this.broadcastExtraTime(room, exam, time);
					this.pushSystemStateAllClients();
				} else {
					failure();
				}
			} else {
				failure();
			}
		},

		printClients: function printClients(){
			var ConnectedUsers = "ConnectedUsers: ";
			for (var client in connectedClients){
				if(connectedClients.hasOwnProperty(client)){
					ConnectedUsers += client + ", " + connectedClients[client]["Room"] + "; ";
				}
			}
			serverUtils.log(ConnectedUsers);
		},

		getClients: function getClients(){
			return connectedClients;
		},

		numClientsAuthenticated: function numClientsAuthenticated(){
			return Object.keys(connectedClients).length;
		},

		sendToAllClients: function sendToAllClients(username, data){
			serverUtils.log("Sending " + data + " to all connected clients");
			for (var client in connectedClients) {
				if (connectedClients.hasOwnProperty(client) && !(client === username)){
					connectedClients[i]["Socket"].send(data);
				}
			}
		},

		sendToClient: function sendToClient(username, data, failureCallback){
			var success = false;
			serverUtils.log("Sending " + data + " to client " + username);
			if(connectedClients.hasOwnProperty(username)){
				connectedClients[username]["Socket"].send(data);
				success = true;
			}
			if(!success){
				failureCallback();
			}
		},

		sendSuccess: function sendSuccess(socket, uname, reason) {
			serverUtils.log("Sending success message to client " + uname);
			var response = {};
			response["header"] = {};
			response["header"]["type"] = PACKET_TYPE.SUCCESS;
			response["header"]["sender"] = 'SYS';
			response["payload"] = {};
			response["payload"]["message"] = reason;
			socket.send(JSON.stringify(response));
		},

		sendAuthSuccess: function sendAuthSuccess(socket, username){
			serverUtils.log("Sending Auth Success to Client" + username);
			var response = {};
			response["header"] = {};
			response["header"]["type"] = PACKET_TYPE.PROTOCOL_HANDSHAKE;
			response["header"]["sender"] = 'SYS';
			response["payload"] = {};
			response["payload"]["message"] = "Authorisation Successful";
			socket.send(JSON.stringify(response));
		},

		sendMessageFailure: function sendMessageFailure(socket, parsedMessage, reason){
			serverUtils.log("Sending failure message to client " + uname);
			var response = {};
			response["header"] = {};
			response["header"]["type"] = PACKET_TYPE.FAILURE;
			response["header"]["sender"] = 'SYS';
			response["header"]["receiver"] = parsedMessage["header"]["receiver"];
			response["payload"] = parsedMessage["payload"];
			response["payload"]["reason"] = reason;
			socket.send(JSON.stringify(response));
		},

		sendFailure: function sendFailure(socket, uname, reason){
			serverUtils.log("Sending failure message to client " + uname);
			var response = {};
			response["header"] = {};
			response["header"]["type"] = PACKET_TYPE.FAILURE;
			response["header"]["sender"] = 'SYS';
			response["payload"] = {};
			response["payload"]["message"] = reason;
			socket.send(JSON.stringify(response));
		},

		synchronizeServerState: function synchronizeServerState(socket){
		//	s1Begin 						s2Begin								s2End
		//	|-------------------------------|--------------------------------------|
			if(!syncLock){
				syncLock = true;
				serverUtils.log("Beginning to synchronize server state");
				// var timeNow = new Date();
				var timeNow = getMockTime();
				refreshSessionTimes(timeNow);
				if ((lastSynchronized < s1Begin) || (lastSynchronized < s2Begin && timeNow > s2Begin)){
					serverUtils.log("Synchronization necessary");
					var request = require('request');
					var credentials = require('./AD_CONFIG');

					if(timeNow < s2Begin){
						var examDataURL = "https://146.169.44.162:8443/examData?view=exics&sessionStart="+s1Begin.toJSON()+"&sessionEnd="+s2Begin.toJSON();
					} else {
						var examDataURL = "https://146.169.44.162:8443/examData?view=exics&sessionStart="+s2Begin.toJSON()+"&sessionEnd="+s2End.toJSON();
					}

					var options = {
					    url : examDataURL,
				        headers : {
				            'Authorization': 'Basic ' + new Buffer(credentials.username + ':' + credentials.password).toString('base64')
				        },
				        strictSSL : false      
					};

					request(options, function(error, response, body){
						var ExICSData = require('./ExICSSystemData').ExICSData.getInstance();
						if (!error && response.statusCode == 200) {
							lastSynchronized = timeNow;
							var examData = JSON.parse(body);
							var exams = examData['exams'];

							for (var index = 0;  index < exams.length; index++){
								exam = {};
								rooms = [];
								for (var prop in exams[index]){
									if (exams[index].hasOwnProperty(prop)){
										if(!(prop.toLowerCase() === "room")){
											exam[prop] = exams[index][prop];
										} else if (typeof exams[index][prop] === "object") {
											for (var roomNum = 0; roomNum < exams[index][prop].length; roomNum++){
												rooms.push(exams[index][prop][roomNum]);
											}
										} else {
											rooms.push(exams[index][prop]);
										}
									}
								}
								exam["Running"] = false;
								exam["Start"] = exam["Date"];
								exam["Finish"] = null;
								exam["xTime"] = 0;
								for (var roomNum = 0; roomNum < rooms.length; roomNum++){
									var tempObj = JSON.parse(JSON.stringify(exam));
									if(!(currentExams.hasOwnProperty(rooms[roomNum]))){
										currentExams[rooms[roomNum]] = [];
									}
									tempObj["Room"] = rooms[roomNum];
									currentExams[rooms[roomNum]].push(tempObj);
								}
							}
							serverUtils.log("Completed Adding Exams, added exams in " + Object.keys(currentExams).length + " rooms");
							syncLock = false;
							ExICSData.pushSystemState(socket);
						} else {
							serverUtils.log("Failed to fetch exam data information for API");
							syncLock = false;
							ExICSData.sendFailure(socket, "", "Failed to fetch exam data from API")
						}
					});
					// syncLock = false;
				} else {
					serverUtils.log("Data Sync Not Necessary");
					syncLock = false;
					this.pushSystemState(socket);
				}
			} else {
				serverUtils.log("Synchronization Already in Progress");
				this.pushSystemState(socket);
			}
		},

		addCurrentExams: function addExam(room, exam){
			if(!(currentExams.hasOwnProperty(room))){
				currentExams[room] = []
			}
			currentExams[room].push(exam);
		},

		clearCurrentExams: function clearCurrentExams(){
			currentExams = {};
		},

		getCurrentExams: function getCurrentExams(){
			return currentExams;
		},

		pushSystemStateAllClients: function pushSystemStateAllClients(){
			while(syncLock){};

			var response = {};
			response['header'] = {};
			response['header']['type'] = PACKET_TYPE.SYSTEM_STATE;
			response['header']['sender'] = 'SYS';
			response['payload'] = {}
			response['payload']['users'] = [];
			for (var user in connectedClients){
				if(connectedClients.hasOwnProperty(user)){
					User = {}
					User['name'] = user;
					User['room'] = connectedClients[user]['Room'];
					response['payload']['users'].push(User);
				}
			}
			response['payload']['exams'] = currentExams;

			for (var client in connectedClients){
				if(connectedClients.hasOwnProperty(client)){
					connectedClients[client]['Socket'].send(JSON.stringify(response));
				}
			}
		},

		pushSystemState: function pushSystemState(socket){
			//Hack to busy-wait thread until syncronization is completed
			while(syncLock){};

			var response = {};
			response['header'] = {};
			response['header']['type'] = PACKET_TYPE.SYSTEM_STATE;
			response['header']['sender'] = 'SYS';
			response['payload'] = {}
			response['payload']['users'] = [];
			for (var user in connectedClients){
				if(connectedClients.hasOwnProperty(user)){
					User = {}
					User['name'] = user;
					User['room'] = connectedClients[user]['Room'];
					response['payload']['users'].push(User);
				}
			}
			response['payload']['exams'] = currentExams;
			socket.send(JSON.stringify(response));
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