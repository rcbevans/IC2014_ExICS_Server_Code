var server = require("./server2");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/active_dir"] = requestHandlers.active_dir;
handle["/ad_result"] = requestHandlers.ad_result;

server.start(router.route, handle);