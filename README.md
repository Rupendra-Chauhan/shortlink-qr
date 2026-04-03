# shortlink-qr

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

**shortlink-qr** is a **drop-in [Express](https://expressjs.com/) app** for URL shortening, **QR codes** (tracked or direct), **phone OTP → JWT** auth, guest rate limits, and **Swagger UI** at `/api/docs`. Data is stored in **MongoDB** via Mongoose.

Use it to **mount in your own server** (`createApp`) or **run a standalone HTTP service** (`start`).

## Requirements

- **Node.js** 18+
- **MongoDB** (local or Atlas). Default connection if `MONGODB_URI` is unset: `mongodb://localhost:27017/url_shortner`

## Install

```bash
npm install shortlink-qr
```

## Quick start (standalone)

1. **Required:** set `JWT_SECRET` (see [Configuration](#configuration)). Easiest: in your project root, add a `.env` file (copy fields from `.env.example` in this package). The bundled example runs `dotenv` against **your** project directory when you start it.
2. From your project (after `npm install shortlink-qr`):

```bash
node node_modules/shortlink-qr/examples/standalone-server.js
```

Or clone this repo and run:

```bash
npm install
npm start
```

Then open **http://localhost:4000/api/docs** for interactive API docs.

## Programmatic API

```js
const { createApp, start, close, connectDatabase } = require('shortlink-qr');

// Option A — you manage listen() and Mongo separately
await connectDatabase({ mongoUri: process.env.MONGODB_URI });
const app = createApp({ jwtSecret: process.env.JWT_SECRET });
app.listen(4000);

// Option B — connect, build app, listen (returns { app, server, port })
const { server, port } = await start({
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  port: 4000
});
```

`createApp` and `start` **throw** if `jwtSecret` is missing (pass it or set `JWT_SECRET`).

### Graceful shutdown

```js
const { start, close } = require('shortlink-qr');

const { server } = await start({ jwtSecret: '...' });
process.on('SIGTERM', async () => {
  await close(server);
  process.exit(0);
});
```

### Advanced options

| Option | Type | Description |
|--------|------|-------------|
| `jwtSecret` | `string` | **Required** for signing JWTs (or `JWT_SECRET` env). |
| `mongoUri` | `string` | MongoDB URI (or `MONGODB_URI`). |
| `corsOrigin` | `string` | Comma-separated allowed origins (or `CORS_ORIGIN`). If unset, CORS allows all origins. |
| `baseUrl` | `string` | Public base URL for short links (or `BASE_URL`). Origin may be added to CORS allowlist. |
| `port` | `number` | Port for `start()` (or `PORT`). |
| `enableSwagger` | `boolean` | Default `true`. Set `false` to skip `/api/docs`. |
| `trustProxy` | `boolean` | Sets Express `trust proxy` (e.g. behind a reverse proxy). |
| `jsonLimit` | `string` | Body parser limit (default `10kb`). |
| `morgan` | `string \| false` | Morgan format or `false` to disable HTTP logging. |

You can also call `initConfig(options)` / `getConfig()` from the package export for shared runtime configuration.

## HTTP surface (summary)

| Area | Path | Notes |
|------|------|--------|
| Health | `GET /health` | `{ "status": "ok" }` |
| API v1 | `/api/v1/...` | Auth, URLs, QR, analytics — see OpenAPI |
| OpenAPI file | `GET /api/docs/openapi.yaml` | Raw YAML |
| Swagger UI | `GET /api/docs` | Interactive docs (unless disabled) |
| Redirect | `GET /:code` | Public short-link redirect (registered **last**) |

Full detail: **Swagger UI** when enabled, or `src/docs/openapi.yaml` in the repo.

## Configuration (environment)

| Variable | Required | Purpose |
|----------|----------|---------|
| `JWT_SECRET` | Yes (unless passed in code) | JWT signing secret |
| `MONGODB_URI` | No | MongoDB connection string |
| `BASE_URL` | No | Public base URL for generated short URLs |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |
| `PORT` | No | HTTP port (default `4000` in `start`) |
| `NODE_ENV` | No | `production` affects Mongoose `autoIndex` |

Example `.env` for local development is provided as [`.env.example`](./.env.example).

## Mounting under a path prefix

This package builds a full Express app with `GET /:code` at the **root**. If you need a path prefix (e.g. `/shortener`), mount the returned app with Express [`app.use('/shortener', subApp)`](https://expressjs.com/en/4x/api.html#app.use). Be aware that **short links and redirects** are designed for root paths unless you also set `BASE_URL` and routing accordingly.

## Security notes

- OTP responses may expose the code in development-style flows; **replace with SMS or similar in production**.
- Use a **strong** `JWT_SECRET` and **HTTPS** in production.
- Configure **CORS** (`CORS_ORIGIN`) for production instead of allowing all origins.

## License

MIT — see [LICENSE](./LICENSE).

## Repository

[https://github.com/Rupendra-Chauhan/shortlink-qr](https://github.com/Rupendra-Chauhan/shortlink-qr)

## Developing this repo

Copy `.env.example` to `.env` and fill in `JWT_SECRET`. Optional: this package lists `dotenv` as a dev dependency so you can run with env loaded automatically:

```bash
node -r dotenv/config src/server.js
```

## Publish to npm

```bash
npm login
npm publish
```

If the unscoped name is already taken on the registry, switch `name` in `package.json` to a [scoped package](https://docs.npmjs.com/cli/v10/using-npm/scope) (for example `@rupendra-chauhan/shortlink-qr`) and run `npm publish --access public`.
