const mongoose = require('mongoose');
const { initConfig, getConfig } = require('./runtimeConfig');
const connectDB = require('./config/db');
const { buildExpressApp } = require('./app');

/**
 * @typedef {object} UrlShortenerOptions
 * @property {string} jwtSecret - Required for JWT auth (or set env JWT_SECRET).
 * @property {string} [mongoUri] - MongoDB connection string (or MONGODB_URI).
 * @property {string} [corsOrigin] - Comma-separated allowed origins (or CORS_ORIGIN).
 * @property {string} [baseUrl] - Public base URL for short links (or BASE_URL).
 * @property {number} [port] - Listen port when using start() (or PORT).
 * @property {boolean} [enableSwagger=true] - Mount /api/docs when true.
 * @property {boolean} [trustProxy=false] - express trust proxy setting.
 * @property {string} [jsonLimit='10kb'] - express.json limit.
 * @property {string|false} [morgan='dev'] - Morgan format or false to disable.
 */

/**
 * Create the full Express app (API + Swagger + `GET /:code` redirect).
 * @param {UrlShortenerOptions} [options]
 * @returns {import('express').Express}
 */
function createApp(options = {}) {
  initConfig(options);
  if (!getConfig().jwtSecret) {
    throw new Error(
      'shortlink-qr: jwtSecret is required. Pass { jwtSecret } to createApp() or set JWT_SECRET.'
    );
  }
  return buildExpressApp();
}

/**
 * Connect to MongoDB using options / env (does not start HTTP).
 * @param {Pick<UrlShortenerOptions, 'mongoUri'>} [options]
 */
async function connectDatabase(options = {}) {
  if (options.mongoUri !== undefined) {
    initConfig(options);
  }
  await connectDB();
}

/**
 * Connect DB, build app, listen. Returns app, server, and port.
 * @param {UrlShortenerOptions} options
 * @returns {Promise<{ app: import('express').Express, server: import('http').Server, port: number }>}
 */
async function start(options = {}) {
  initConfig(options);
  if (!getConfig().jwtSecret) {
    throw new Error(
      'shortlink-qr: jwtSecret is required. Pass { jwtSecret } to start() or set JWT_SECRET.'
    );
  }
  await connectDB();
  const app = buildExpressApp();
  const port = getConfig().port || Number(process.env.PORT) || 4000;

  const server = await new Promise((resolve, reject) => {
    const s = app.listen(port, (err) => {
      if (err) reject(err);
      else resolve(s);
    });
  });

  return { app, server, port };
}

/**
 * Graceful shutdown helper.
 * @param {import('http').Server} server
 */
async function close(server) {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await mongoose.connection.close();
}

module.exports = {
  createApp,
  connectDatabase,
  start,
  close,
  initConfig,
  getConfig
};
