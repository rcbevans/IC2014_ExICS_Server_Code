// LDAP Authentication

var ActiveDirectory = require('activedirectory');
var ad_config = require("./AD_CONFIG");
var serverUtils = require('./serverUtils');

var ad = new ActiveDirectory({
		url: ad_config.url,
		baseDN: ad_config.baseDN,
		username: ad_config.username,
		password: ad_config.password
	});

function authenticate(uname, pwd, authCompleteCallback) {

	var fqUsername = uname + "@IC.AC.UK";

	serverUtils.log("Attempting to authenticate user: " + fqUsername);

	ad.authenticate(fqUsername, pwd, function(err, auth) {
		if (err) {
			serverUtils.log('ERROR: ' + JSON.stringify(err));
			authCompleteCallback(uname, false);
		} else {
			if (auth) {
				serverUtils.log('Authenticated user ' + uname);
				authCompleteCallback(uname, true);
			} else {
				serverUtils.log('Authentication failed for user ' + uname);
				authCompleteCallback(uname, false);
			}
		}
	});
}

exports.authenticate = authenticate;