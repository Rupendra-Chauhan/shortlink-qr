const jwt = require('jsonwebtoken');
const { getConfig } = require('../runtimeConfig');

// Optional auth: if token is valid, sets req.user, otherwise leaves it null.
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getConfig().jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id, phone: decoded.phone };
  } catch {
    req.user = null;
  }

  return next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  return next();
};

module.exports = { auth, requireAuth };

