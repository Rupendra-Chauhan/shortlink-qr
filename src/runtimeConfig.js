/**
 * Per-process options for shortlink-qr (merged with process.env).
 * Repeated initConfig() calls merge; omitted keys keep previous values.
 */

let config = {
  jwtSecret: undefined,
  mongoUri: undefined,
  corsOrigin: undefined,
  baseUrl: undefined,
  port: undefined,
  enableSwagger: true,
  jsonLimit: '10kb',
  morgan: 'dev',
  trustProxy: false
};

function initConfig(user = {}) {
  config = {
    jwtSecret: user.jwtSecret ?? config.jwtSecret ?? process.env.JWT_SECRET,
    mongoUri: user.mongoUri ?? config.mongoUri ?? process.env.MONGODB_URI,
    corsOrigin: user.corsOrigin ?? config.corsOrigin ?? process.env.CORS_ORIGIN,
    baseUrl: user.baseUrl ?? config.baseUrl ?? process.env.BASE_URL,
    port:
      user.port !== undefined
        ? user.port
        : config.port !== undefined
          ? config.port
          : process.env.PORT
            ? Number(process.env.PORT)
            : undefined,
    enableSwagger:
      user.enableSwagger !== undefined
        ? user.enableSwagger
        : config.enableSwagger !== undefined
          ? config.enableSwagger
          : true,
    jsonLimit: user.jsonLimit ?? config.jsonLimit ?? '10kb',
    morgan: user.morgan !== undefined ? user.morgan : config.morgan ?? 'dev',
    trustProxy:
      user.trustProxy !== undefined ? user.trustProxy : !!config.trustProxy
  };
}

function getConfig() {
  return config;
}

module.exports = { initConfig, getConfig };
