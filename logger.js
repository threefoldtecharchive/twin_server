const winston = require('winston');
var path = require('path')

var options = {
    info: {
      level: 'info',
      filename: path.join('logs', 'info.log'),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
    error: {
        level: 'error',
        filename: path.join('logs', 'error.log'),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
};

// creates a new Winston Logger
const logger = new winston.createLogger({
  level: 'info' ,
  transports: [
    new winston.transports.File(options.info),
    new winston.transports.File(options.error),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false
});
module.exports = logger;