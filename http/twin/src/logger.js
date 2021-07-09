"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
const winston_1 = require("winston");
const chalk_1 = require("chalk");
const getDetailsFromFile = (fileDetails) => {
    const fileAndRow = fileDetails
        .split('at ')
        .pop()
        .split('(')
        .pop()
        .replace(')', '')
        .split(':');
    const detailsFromFile = {
        file: fileAndRow[0].trim(),
        line: fileAndRow[1],
        row: fileAndRow[2],
    };
    // @ts-ignore
    detailsFromFile.formattedInfos = chalk_1.white(Object.keys(detailsFromFile).reduce((previous, key) => 
    // @ts-ignore
    `${previous}${chalk_1.underline(key)}: ${chalk_1.italic(detailsFromFile[key])}`, `\n`));
    return detailsFromFile;
};
exports.logger = winston_1.createLogger({
    level: 'info',
    transports: [
        new winston_1.transports.Console({
            handleExceptions: true,
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({
                format: 'YY/MM/DD:HH:mm:ss:SSS',
            }), winston_1.format.printf((info) => {
                const detailsFromFile = getDetailsFromFile(new Error().stack);
                // S'il y a un objet, on le formatte
                const meta = info.meta && Object.keys(info.meta).length
                    ? JSON.stringify(info.meta, null, 2)
                    : '';
                return `[${info.timestamp}] ${info.level}: ${info.message}${info.splat !== undefined ? `${info.splat}` : ' '}`;
            })),
        }),
    ],
    exitOnError: false,
});
// creates a new Winston Logger
exports.httpLogger = winston_1.createLogger({
    level: 'info',
    transports: [
        new winston_1.transports.Console({
            level: 'http',
            handleExceptions: true,
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({
                format: 'YY/MM/DD:HH:mm:ss:SSS',
            }), winston_1.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}` +
                (info.splat !== undefined ? `${info.splat}` : ' '))),
        }),
        new winston_1.transports.File({
            filename: './logs/error.log',
            level: 'error',
        }),
    ],
    exitOnError: false,
});
