// db-transport.js
import Transport from 'winston-transport';
import Log from '../models/Log.js';

class DBTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    const { level, message, ...meta } = info;

    // Filter levels
    if (!['error', 'warn', 'info'].includes(level)) {
      return callback();
    }

    try {
      const { userId = null, type = null, req = null, metadata = {} } = meta;

      await Log.create({
        userId,
        level,
        type,
        message,
        metadata,
        ip: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
      });
    } catch (err) {
      console.error('DB logger error:', err.message);
    }

    callback();
  }
}

export default DBTransport;
