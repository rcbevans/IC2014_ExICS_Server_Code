var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	csvConvert = require('./csvConvert'),
    csvURL = "https://146.169.13.35/prog/ttformjw03.cgi";
    //csvURL = "https://exams.doc.ic.ac.uk/prog/ttformjw03.cgi";

function redirect(query, auth, clientResponse){
	clientResponse.writeHead(302, http.STATUS_CODES[302], {
		'Location' : '/examData/apidoc'
	})
	clientResponse.end();
}

function examData(query, auth, clientResponse){

	var converters = {};
	converters['default'] = csvConvert.defaultView;
	converters['date'] = csvConvert.dateView;
  	converters['yeargroup'] = csvConvert.yearGroupView;
  	converters['room'] = csvConvert.roomView;
  	converters['session'] = csvConvert.sessionView;
  	converters['exics'] = csvConvert.ExICSView;

	request(
    {
        url : csvURL,
        headers : {
            "Authorization" : auth
        },
        strictSSL : false
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
  			if ('view' in query){
  				if(typeof converters[query['view']] === 'function'){
  					converters[query['view']](body, clientResponse);
  				} else {
  					converters['default'](body, clientResponse);
  				}
  			} else {
  				converters['default'](body, clientResponse);
  			}
  		} else {
  			console.log(error);
  			clientResponse.writeHead(403, http.STATUS_CODES[403]);
  			clientResponse.write("NOT AUTHORIZED!");
			clientResponse.end("NOT AUTHORIZED!");
  		}
    });
}

function apiDoc(query, auth, clientResponse){
	request(
    {
        url : csvURL,
        headers : {
            "Authorization" : auth
        },
        strictSSL : false
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {

  			fs.readFile('./apiDoc.html', function (err, html) {
				if (err) {
        			throw err; 
    			}
    			clientResponse.writeHeader(200, http.STATUS_CODES[200], {"Content-Type": "text/html"});  
        		clientResponse.write(html);  
        		clientResponse.end(); 
  			});
  			
  		} else {
  			console.log(error);
  			clientResponse.writeHead(403, http.STATUS_CODES[403]);
  			clientResponse.write("NOT AUTHORIZED!");
			clientResponse.end();
  		}
    });
}

exports.redirect = redirect;
exports.examData = examData;
exports.apiDoc = apiDoc;