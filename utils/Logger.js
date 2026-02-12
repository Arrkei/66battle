 
var { createLogger, format, transports } = require('winston');
var winston = require('winston');
var wdrf = require('winston-daily-rotate-file');
var wdrftransport = new (winston.transports.DailyRotateFile)({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
	maxFiles: '14d',
	level: 'info'
  });
  wdrftransport.on('rotate', function(oldFilename, newFilename) {
	// do something fun
	console.log("Logger: rotate log file from: " + oldFilename + " to " + newFilename);
  });

  var { combine, timestamp, label, printf } = format;
  var logger = winston.createLogger({
      level: 'info',
      //format: winston.format.json(),
       format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
      transports: [
          //new winston.transports.File({ filename: 'logs/app-info.log', level: 'info' }),
          wdrftransport,
          new winston.transports.File({ filename: 'logs/app-error.log', level: 'error' }),
          new winston.transports.Console({level: 'info'})
      ]
      });

module.exports = logger;
