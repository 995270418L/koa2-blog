//日志传输流
const winston = require('winston');

let successLogger = new (winston.Logger)({
    transports:[
        new winston.transports.Console({
            name:'console-success-log',
            level: 'info',
            json:true,
            colorize: true
        }),
        new (winston.transports.File)({
            name: 'file-info-log',
            filename: 'logs/success.log'
        })
    ]
});

let errorLogger = new (winston.Logger)({
    transport:[
        new winston.transports.Console({
            name: 'console-error-log',
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            name: 'file-error-log',
            filename: 'logs/error.log'
        })
    ]
});

module.exports = {
    success : successLogger,
    error : errorLogger
}
