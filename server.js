// server.js
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    const domain = process.env.DOMAIN || process.env.RENDER_EXTERNAL_URL;
    const protocol = NODE_ENV === 'production' ? 'https' : 'http';
    const finalDomain = domain || `localhost:${PORT}`;
    const url = `${protocol}://${finalDomain}`;

    logger.info(`Server running at ${url}`);
  });
};

startServer();
