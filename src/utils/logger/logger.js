import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';
import { config } from 'dotenv';
config();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({ format: format.simple() }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.MongoDB({
      db: process.env.MONGO_URI,
      // options: { useUnifiedTopology: true },
      collection: 'log',
      level: 'info',
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
});

export default logger;
