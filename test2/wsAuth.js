var ActiveDirectory = require('activedirectory');

var ad_config = require("./AD_CONFIG");

var ad = new ActiveDirectory({
		url: ad_config.url,
		baseDN: ad_config.baseDN,
		username: ad_config.username,
		password: ad_config.password
	});

function authenticate(uname, pwd, completeAuth) {

	var fqUsername = uname + "@IC.AC.UK";

	console.log("Attempting to authenticate user: %s", fqUsername);

	ad.authenticate(fqUsername, pwd, function(err, auth) {
		if (err) {
			console.log('ERROR: ' + JSON.stringify(err));
		}

		if (auth) {
			console.log('Authenticated user ' + uname);
			completeAuth(uname, true);
		} else {
			console.log('Authentication failed for user ' + uname);
			completeAuth(uname, false);
		}
	});
}

exports.authenticate = authenticate;