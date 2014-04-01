var querystring = require("querystring");
var ActiveDirectory = require('activedirectory');

var ad_config = require("./AD_CONFIG");

var ad = new ActiveDirectory({
		url: ad_config.url,
		baseDN: ad_config.baseDN,
		username: ad_config.username,
		password: ad_config.password
	});

function start(response, postData) {
	console.log("Request handler 'start' was called.");
	var body = '<html>' +
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form action="/upload" method="post">' +
		'<textarea name="text" rows="1" cols="60"></textarea>' +
		'<input type="submit" value="Submit text" />' +
		'</form>' +
		'</body>' +
		'</html>';
	response.writeHead(200, {
		"Content-Type": "text/html"
	});
	response.write(body);
	response.end();
}

function upload(response, postData) {
	console.log("Request handler 'upload' was called.");
	response.writeHead(200, {
		"Content-Type": "text/plain"
	});
	response.write("You've sent the text: " +
		querystring.parse(postData).text);
	response.end();
}

function active_dir(response, postData) {
	console.log("Request handler 'active_dir' was called.");
	var body = '<html>' +
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form name="input" action="/ad_result" method="post">' +
		'Username: <input type="text" name="user">' +
		'<br>' +
		'Password: <input type="password" name="pwd">' +
		'<br>' +
		'<input type="submit" value="Submit">' +
		'</form>' +
		'</body>' +
		'</html>';
	response.writeHead(200, {
		"Content-Type": "text/html"
	});
	response.write(body);
	response.end();
}

function ad_result(response, postData) {

	var QS = querystring.parse(postData);

	var uname = QS.user + "@IC.AC.UK";
	var pwd = QS.pwd;

	ad.authenticate(uname, pwd, function(err, auth) {
		if (err) {
			console.log('ERROR: ' + JSON.stringify(err));
		}

		var authenticated = '';

		if (auth) {
			console.log('Authenticated!');
			authenticated = 'YAYYYY AUTHENTICATED!';
		} else {
			console.log('Authentication failed!');
			authenticated = 'SUCH SAD, NO AUTH';
		}
		response.writeHead(200, {
			"Content-Type": "text/html"
		});
		response.write(authenticated);
		response.end();
	});

	// ad.userExists(uname, function(err, exists) {
	// 	if (err) {
	// 		console.log('ERROR: ' + JSON.stringify(err));
	// 		response.writeHead(200, {
	// 			"Content-Type": "text/html"
	// 		});
	// 		response.write(JSON.stringify(err));
	// 		response.end();
	// 		return;
	// 	}

	// 	console.log(uname + ' exists: ' + exists);

	// 	response.writeHead(200, {
	// 		"Content-Type": "text/html"
	// 	});
	// 	response.write(uname + ' exists: ' + exists);
	// 	response.end();
	// });
}

exports.start = start;
exports.upload = upload;
exports.active_dir = active_dir;
exports.ad_result = ad_result;