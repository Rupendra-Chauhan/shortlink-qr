/**
 * Dev entry: start the HTTP server using process env (see repo `.env.example`).
 * For a published install, use `examples/standalone-server.js` or `require('shortlink-qr').start()`.
 */
const { start, close } = require('./index');

async function main() {
  const { server, port } = await start({
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGODB_URI,
    baseUrl: process.env.BASE_URL,
    corsOrigin: process.env.CORS_ORIGIN,
    port: process.env.PORT ? Number(process.env.PORT) : 4000
  });

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
