var http = require("http");

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World fron an anonymous function!");
  response.end();
}).listen(8888);
