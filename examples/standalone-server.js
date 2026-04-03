/**
 * Example: run the shortener as its own HTTP server.
 *
 * From this repo (after `npm install`):
 *   Set JWT_SECRET (and optionally MONGODB_URI); see `.env.example`.
 *   PowerShell: $env:JWT_SECRET="devsecret"; node examples/standalone-server.js
 *   bash:       export JWT_SECRET=devsecret && node examples/standalone-server.js
 *
 * From another project (after `npm install shortlink-qr`):
 *   node node_modules/shortlink-qr/examples/standalone-server.js
 */

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
