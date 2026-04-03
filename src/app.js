const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { getConfig } = require('./runtimeConfig');
const v1Routes = require('./routes/v1');
const { loadOpenApi } = require('./docs/loadOpenApi');
const { handleRedirect } = require('./controllers/redirectController');

const parseOriginList = (raw) =>
  String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

function buildCorsAllowedOrigins() {
  const cfg = getConfig();
  const fromEnv = parseOriginList(cfg.corsOrigin);
  if (fromEnv.length === 0) {
    return null;
  }
  const set = new Set(fromEnv);
  if (cfg.baseUrl) {
    try {
      set.add(new URL(cfg.baseUrl).origin);
    } catch {
      /* ignore */
    }
  }
  const port = String(cfg.port || process.env.PORT || 4000);
  if (process.env.NODE_ENV !== 'production') {
    set.add(`http://localhost:${port}`);
    set.add(`http://127.0.0.1:${port}`);
  }
  return set;
}

/**
 * Build Express app (initConfig must already be set, including jwtSecret).
 * Registers short-link redirect last at `GET /:code`.
 */
function buildExpressApp() {
  const cfg = getConfig();
  const app = express();
  if (cfg.trustProxy) {
    app.set('trust proxy', true);
  }

  const corsAllowedOrigins = buildCorsAllowedOrigins();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"]
        }
      }
    })
  );
  app.use(
    cors({
      exposedHeaders: ['X-QR-Short-Code', 'X-QR-Short-Url'],
      origin:
        corsAllowedOrigins && corsAllowedOrigins.size > 0
          ? (origin, callback) => {
              if (!origin || corsAllowedOrigins.has(origin)) {
                return callback(null, true);
              }
              return callback(new Error('Not allowed by CORS'));
            }
          : true
    })
  );
  app.use(express.json({ limit: cfg.jsonLimit || '10kb' }));
  if (cfg.morgan !== false) {
    app.use(morgan(cfg.morgan || 'dev'));
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1', v1Routes);

  if (cfg.enableSwagger !== false) {
    let openApiSpec;
    try {
      openApiSpec = loadOpenApi();
    } catch (err) {
      console.error('OpenAPI spec not loaded:', err.message);
    }

    if (openApiSpec) {
      app.get('/api/docs/openapi.yaml', (req, res) => {
        res.type('text/yaml; charset=utf-8');
        res.sendFile(path.join(__dirname, 'docs', 'openapi.yaml'));
      });
      app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(openApiSpec, {
          customSiteTitle: 'URL Shortener API — Docs',
          swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            displayRequestDuration: true,
            tryItOutEnabled: true
          }
        })
      );
    }
  }

  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });

  app.get('/:code', handleRedirect);

  return app;
}

module.exports = { buildExpressApp };
