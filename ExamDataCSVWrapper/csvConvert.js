var ppSpace = 2;
var http = require('http');

function defaultView(csvString, response){
	var lines = csvString.replace(/\n%/g, '\n').replace(/\n$|^%/g, '').split("\n");

	var result = {};

	result['dateProduced'] = lines[0].match(/\w{3}\s\w{3}\s\d+\s\d+:\d+:\d+\s\w+\s\d{4}/)[0];

	result['examPeriod'] = lines[1].match(/\d{4}-\d{4}/)[0];

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

	var headers = lines[3].split("\t");

	result['dates'] = [];

	var datePosition = null;

	for (var i = 0; i < headers.length; i++){
		if (headers[i].toLowerCase() == "date"){
			datePosition = i;
			break;
		}
	}

	var currentDate = null;

	for(var i = 4; i < lines.length; i++){
		var currentExamLine = lines[i].split("\t");

		var examDate = currentExamLine[datePosition];

		if (examDate != currentDate){
			if (currentDate != null){
				result['dates'].push(dateObj);
			}
			dateObj = {};
			dateObj[headers[datePosition]] = examDate;
			dateObj['exams'] = [];
		}

		examObj = {};

		for (var j = 0; j < headers.length; j++){
			if (j != datePosition){
				examObj[headers[j]] = currentExamLine[j];
			}
		}

		dateObj['exams'].push(examObj);
		currentDate = examDate;
	}

	response.writeHead(200, http.STATUS_CODES[200], {'Content-Type': 'application/json'});
	response.end(JSON.stringify(result, null, ppSpace));
}

exports.defaultView = defaultView;
exports.dateView = dateView;