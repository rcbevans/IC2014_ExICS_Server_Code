var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');

function startServer(port, router, handles){
	function onRequest(request, response){
		console.log("Received http request");
		
		var url_parts = url.parse(request.url, true);

		var pathName = url_parts.pathname;
		var query = url_parts.query;

		var auth = request.headers['authorization'];

		if (!auth){
			response.statusCode = 401;
			response.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
			response.end('<html><body>I\'m gonna need to see some credentials I\'m afraid...</body></html>');
		} else {
			router.route(handles, pathName, query, auth, response);
		}
	}

	http.createServer(onRequest).listen(port);
	console.log("Started http server on port ", port);
}

function startSSLServer(port, router, handles){

	function onRequest(request, response){
		console.log("Received https request");
		
		var url_parts = url.parse(request.url, true);

		var pathName = url_parts.pathname;
		var query = url_parts.query;

		var auth = request.headers['authorization'];

		if (!auth){
			response.statusCode = 401;
			response.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
			response.end('<html><body>I\'m gonna need to see some credentials I\'m afraid...</body></html>');
		} else {
			router.route(handles, pathName, query, auth, response);
		}
	}

	var options = {
	  	key: fs.readFileSync('ssl/server.key'),
	  	cert: fs.readFileSync('ssl/server.crt')
	};

	https.createServer(options, onRequest).listen(port);
	console.log("Started https server on port ", port);
}

exports.startServer = startServer;
exports.startSSLServer = startSSLServer;