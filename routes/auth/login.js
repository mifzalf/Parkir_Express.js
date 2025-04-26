var express = require('express');
var router = express.Router();
const Model_Petugas = require('../../model/model_users');
const limiter = require('../../config/middleware/rateLimiter');

router.post('/', limiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password harus diisi' });
    }
    try {
        const result = await Model_Petugas.login(username, password);
        res.json({
            status: true,
            message: 'Login berhasil',
            token: result.token
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            status: false,
            message: error.message 
        });
    }
});

module.exports = router;
