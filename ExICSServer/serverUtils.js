// Server Utils

//Node.JS singleton
var ServerUtils = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init(level) {
    // Singleton
    // Private methods and variables
    var fs = require('fs');
    var mongoose = require('mongoose');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
      writeToLog("Successfully connected to mongodb test database");
      var examSchema = mongoose.Schema({
          exam: String,
          title: String,
          numqns: Number,
          duration: Number,
          date: String,
          running: Boolean,
          paused: Boolean,
          pauseTimings: [{paused: String, resumed: String}],
          start: String,
          finish: String,
          xTime: Number,
          room: Number
        });

        exam = mongoose.model('Exam', examSchema);
    });
    var exam = null;
    mongoose.connect('mongodb://localhost/completedExams');

    var currDateTime = new Date();
    if(!fs.existsSync('logs')){
    	fs.mkdirSync('logs', 0755, function(err){
    		throw new Error("Failed to make log file directory");
    	});
    }
    filePath = "logs/" + currDateTime.getFullYear() + "-" + (+currDateTime.getMonth() + +1) + "-" + currDateTime.getDate() + "/";
    var fileName = new Date().toJSON() + ".txt";
    fileName = fileName.replace(/:/g,'.');
    if(!fs.existsSync(filePath)){
    	fs.mkdirSync(filePath, 0755, function(err){
    		throw new Error("Failed to make log file directory");
    	});
    }

    var logStream = fs.createWriteStream(filePath + fileName, {'flags':'a', 'encoding':'utf8'});

    var LOG_LEVEL = {
    	VERBOSE: 0,
    	DEBUG: 1,
    	INFO: 2,
    	WARN: 3,
    	ERROR: 4,
    	FATAL: 5
    }

    if(typeof level === 'undefined')
    	logLevel = 'INFO';
    else {
    	if (LOG_LEVEL.hasOwnProperty(level)){
    		logLevel = level;
    	} else if(typeof level === 'number'){
    		logLevel = getLogLevelText(level);
    	} else {
    		logLevel = 'INFO';
    	}
    }

    getLogLevelText: function getLogLevelText(level){
    	for(var prop in LOG_LEVEL){
    		if(LOG_LEVEL.hasOwnProperty(prop)){
    			if(LOG_LEVEL[prop] === level){
    				return prop;
    			}
    		}
    	}
    }

    writeToLog: function writeToLog(level, message){
      var logLvl, logMessage;

      if(typeof message === 'undefined'){
        logLvl = logLevel;
        logMessage = level;
      } else {
        if(typeof level === 'number'){
          logLvl = getLogLevelText(level);
        } else if(LOG_LEVEL.hasOwnProperty(level)){
          logLvl = level; 
        } else {
          logLvl = logLevel;
        }
        logMessage = message;
      }

      var currentDateTime = new Date();
      var finalMessage = "[" + currentDateTime.toJSON() + "][" + logLvl + "] " + logMessage;
      console.log(finalMessage);
      logStream.write(finalMessage + "\n");
    }
    

    return {
      	// Public methods and variables
      	log: function log(level, message){
      		writeToLog(level, message);
      	},

      	closeLogStream: function closeLogStream(){
      		var logLvl = 'INFO';
      		var currentDateTime = new Date();
      		var finalMessage = "[" + currentDateTime.toJSON() + "][" + logLvl + "] " + "The Log File is Being Closed Gracefully\n";
      		logStream.write(finalMessage);
      		console.log(finalMessage);
      		logStream.end();
      	},

        commitExam: function commitExam(completedExam){
          this.log("Attempting to store exam " + completedExam.title);
          if(exam != null){
            var examToCommit = new exam(completedExam);
            var logfunc = this.log;
            examToCommit.save(function(err, examToCommit){
              if(!err){
                logfunc("Successfully saved exam version 1");
              } else {
                logfunc("Error occurred saving exam v1");
              }
            });
          } else {
            this.log("An Error has occurred trying to save exam " + completedExam.title);
          }
        }
    };
  };

  return {

    getInstance: function (level) {

      if ( !instance ) {
        instance = init(level);
      }

      return instance;
    }

  };

})();

exports.ServerUtils = ServerUtils;