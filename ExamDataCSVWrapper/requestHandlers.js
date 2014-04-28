var request = require('request'),
	http = require('http'),
	csvConvert = require('./csvConvert'),
    //csvURL = "https://146.169.13.35/prog/ttformjw03.cgi";
    csvURL = "https://exams.doc.ic.ac.uk/prog/ttformjw03.cgi";

function redirect(query, auth, clientResponse){
	clientResponse.writeHead(302, http.STATUS_CODES[302], {
		'Location' : '/examData'
	})
	clientResponse.end();
}

function examData(query, auth, clientResponse){

	var converters = {};
	converters['default'] = csvConvert.defaultView;
	converters['date'] = csvConvert.dateView;
  converters['yeargroup'] = csvConvert.yearGroupView;

	request(
    {
        url : csvURL,
        headers : {
            "Authorization" : auth
        },
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

exports.redirect = redirect;
exports.examData = examData;