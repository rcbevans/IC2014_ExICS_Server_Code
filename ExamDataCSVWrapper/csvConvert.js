var ppSpace = 2;
var http = require('http');

function defaultView(csvString, response){
	var lines = csvString.replace(/\n%/g, '\n').replace(/\n$|^%/g, '').split("\n");

	var result = {};

	result['dateProduced'] = lines[0].match(/\w{3}\s\w{3}\s\d+\s\d+:\d+:\d+\s\w+\s\d{4}/)[0];

	result['examPeriod'] = lines[1].match(/\d{4}-\d{4}/)[0];

	result['view'] = "Default"

	var headers = lines[3].split("\t");

	result['exams'] = [];

	for(var i = 4; i < lines.length; i++){
		var examObj = {};
		var currentExamLine = lines[i].split("\t");

		for (var j = 0; j < headers.length; j++){
			examObj[headers[j]] = currentExamLine[j];
		}

		result['exams'].push(examObj);
	}

	response.writeHead(200, http.STATUS_CODES[200], {'Content-Type': 'application/json'});
	response.end(JSON.stringify(result, null, ppSpace));
}

function dateView(csvString, response){
	var lines = csvString.replace(/\n%/g, '\n').replace(/\n$|^%/g, '').split("\n");

	var result = {};

	result['dateProduced'] = lines[0].match(/\w{3}\s\w{3}\s\d+\s\d+:\d+:\d+\s\w+\s\d{4}/)[0];

	result['examPeriod'] = lines[1].match(/\d{4}-\d{4}/)[0];

	result['view'] = "Date"

	var headers = lines[3].split("\t");

	result['dates'] = {};

	var datePosition = null;

	for (var i = 0; i < headers.length; i++){
		if (headers[i].toLowerCase() == "date"){
			datePosition = i;
			break;
		}
	}

	for(var i = 4; i < lines.length; i++){
		var currentExamLine = lines[i].split("\t");

		var examDate = currentExamLine[datePosition];

		examObj = {};

		for (var j = 0; j < headers.length; j++){
			examObj[headers[j]] = currentExamLine[j];
		}


		if (!(examDate in result['dates'])){
			console.log("Creating JSON array for ", examDate);
			result['dates'][examDate] = [];
		}

		result['dates'][examDate].push(examObj);
	}

	response.writeHead(200, http.STATUS_CODES[200], {'Content-Type': 'application/json'});
	response.end(JSON.stringify(result, null, ppSpace));
}

function yearGroupView(csvString, response){

	var lines = csvString.replace(/\n%/g, '\n').replace(/\n$|^%/g, '').split("\n");

	var result = {};

	result['dateProduced'] = lines[0].match(/\w{3}\s\w{3}\s\d+\s\d+:\d+:\d+\s\w+\s\d{4}/)[0];

	result['examPeriod'] = lines[1].match(/\d{4}-\d{4}/)[0];

	result['view'] = "Year Group"

	var headers = lines[3].split("\t");

	result['yearGroup'] = {};

	result['yearGroup'][1] = [];
	result['yearGroup'][2] = [];
	result['yearGroup'][3] = [];
	result['yearGroup'][4] = [];

	var examPosition = null;

	for (var i = 0; i < headers.length; i++){
		if (headers[i].toLowerCase() == "exam/subexam"){
			examPosition = i;
			break;
		}
	}

	for(var i = 4; i < lines.length; i++){
		var currentExamLine = lines[i].split("\t");

		var moduleNames = currentExamLine[examPosition].split("=");

		examObj = {};

		for (var j = 0; j < headers.length; j++){
			examObj[headers[j]] = currentExamLine[j];
		}

		for (var j = 0; j < moduleNames.length; j++){

			if (moduleNames[j].match(/C1|MC1/)){
				if(result['yearGroup'][1].indexOf(examObj) == -1){
					result['yearGroup'][1].push(examObj);
				}
			}

			if (moduleNames[j].match(/C2|MC2/)){
				if(result['yearGroup'][2].indexOf(examObj) == -1){
					result['yearGroup'][2].push(examObj);
				}
			}

			if (moduleNames[j].match(/C3|MC3/)){
				if(result['yearGroup'][3].indexOf(examObj) == -1){
					result['yearGroup'][3].push(examObj);
				}
			}

			if (moduleNames[j].match(/C4|MC4/)){
				if(result['yearGroup'][4].indexOf(examObj) == -1){
					result['yearGroup'][4].push(examObj);
				}			
			}
		}
	}

	response.writeHead(200, http.STATUS_CODES[200], {'Content-Type': 'application/json'});
	response.end(JSON.stringify(result, null, ppSpace));

}

exports.defaultView = defaultView;
exports.dateView = dateView;
exports.yearGroupView = yearGroupView;