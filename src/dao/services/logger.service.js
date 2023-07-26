import dotenv from 'dotenv';
import winston from 'winston';
import config from '../../config/config.js';

dotenv.config()
console.log(config.mode);



const devLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({level: 'debug'}),
    ]
})

const prodLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({level: 'info'}),
        new winston.transports.File({ level: 'error', filename: '../logs/errors.log'}),
    ]
})

export const addLogger = (req, res, next) => {
    req.logger = config.mode === 'DEVELOPMENT' ? devLogger : prodLogger;
    req.logger.http(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
}