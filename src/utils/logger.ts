import winston, { format } from 'winston';
import httpContext from 'express-http-context';

const myFormat = format.printf(info => `[${info.level.toLocaleUpperCase().padStart(5)}] ${info.timestamp} [${httpContext.get('reqId')}]: ${info.message}`);

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    myFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' }),
  ],
});

export default logger;
