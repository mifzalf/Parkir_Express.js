const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 5, // Maksimal 5 permintaan per windowMs
    keyGenerator: (req, res) => req.ip,
    message: 'Terlalu banyak permintaan. Coba lagi dalam 5 menit...',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;
