const express = require('express');
const { createGuestDailyCreateLimiter } = require('../../middleware/guestRateLimit');
const { requireAuth } = require('../../middleware/auth');
const { createShortUrl, getUrlAnalytics, getUserUrls } = require('../../controllers/urlController');
const {
  generateQr,
  generateQrDirect,
  getQrAnalytics,
  getUserQrTracks
} = require('../../controllers/qrController');

const router = express.Router();
const guestShortenLimiter = createGuestDailyCreateLimiter();
const guestQrLimiter = createGuestDailyCreateLimiter();

router.post('/shorten', guestShortenLimiter, createShortUrl);

// Direct QR (encode target URL only) — login required
router.post('/qr/direct', requireAuth, generateQrDirect);

router.post('/qr', guestQrLimiter, generateQr);

router.get('/qr/list', requireAuth, getUserQrTracks);

router.get('/qr/:code', getQrAnalytics);

// Logged-in only: list my URLs
router.get('/', requireAuth, getUserUrls);

// Analytics: guest links (no owner) public by code; owned links need matching JWT
router.get('/:code', getUrlAnalytics);

module.exports = router;

