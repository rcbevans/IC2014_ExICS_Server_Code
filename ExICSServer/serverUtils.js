// Server Utils

function log(message){
	var currentDateTime = new Date();
	console.log(currentDateTime.toJSON(), message);
}

exports.log = log;