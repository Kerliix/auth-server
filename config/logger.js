import winston from 'winston';
import Log from '../models/Log.js'; // import the Log model

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: winston.config.npm.levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat
  ),
  transports: [new winston.transports.Console()]
});

// ✅ Optional: Save important logs to the database
const shouldLogToDb = (level) => {
  return ['error', 'warn', 'info'].includes(level);
};

// Monkey-patch logger to intercept logs
const originalLog = logger.log.bind(logger);

logger.log = async (level, message, meta = {}) => {
  originalLog(level, message);

  if (shouldLogToDb(level)) {
    try {
      const { userId = null, type = null, req = null, metadata = {} } = meta;

      await Log.create({
        userId,
        level,
        type,
        message,
        metadata,
        ip: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null
      });
    } catch (err) {
      // Avoid crashing the app if logging fails
      originalLog('error', `Failed to save log to DB: ${err.message}`);
    }
  }
};

export default logger;
