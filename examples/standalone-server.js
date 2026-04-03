/**
 * Example: run the shortener as its own HTTP server.
 *
 * Loads `.env` from the **current working directory** (your project root), not from
 * inside `node_modules`. Copy variables from `shortlink-qr`’s `.env.example` into your `.env`.
 *
 * From this repo: `npm start` or `node examples/standalone-server.js`
 * From another project: `node node_modules/shortlink-qr/examples/standalone-server.js`
 *
 * You can still use shell env instead of `.env` (e.g. `$env:JWT_SECRET="..."` in PowerShell).
 */

require('dotenv').config();

const { start, close } = require('..');

async function main() {
  const { app, server, port } = await start({
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGODB_URI,
    baseUrl: process.env.BASE_URL,
    corsOrigin: process.env.CORS_ORIGIN,
    port: process.env.PORT ? Number(process.env.PORT) : 4000
  });

  app.set('title', 'shortlink-qr');
  console.log(`Listening on http://localhost:${port}`);
  console.log(`API docs: http://localhost:${port}/api/docs`);

  const shutdown = async (signal) => {
    console.log(`${signal}, closing...`);
    await close(server);
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
