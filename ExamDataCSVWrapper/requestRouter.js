function route(handles, pathname, query, auth, response){

	console.log("Routing request for ", pathname, ", Query ", query);
	
	if (typeof handles[pathname] === 'function') {
		handles[pathname](query, auth, response);
	} else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {
			"Content-Type": "text/plain"
		});
		response.write("404 Not found");
		response.end();
	}
}

exports.route = route;