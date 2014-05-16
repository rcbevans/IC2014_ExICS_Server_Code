// ExiCSServer
var wsServer = require('./wsServer');
var serverUtils = require('./serverUtils').ServerUtils.getInstance();

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup){
    	serverUtils.closeLogStream();
    };
    if (err){
		serverUtils.log("The Process is exiting, closing log gracefully,\nError Stack:\n" + err.stack);
    };
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

wsServer.startWSServer(8081);