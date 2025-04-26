var express = require('express');
var router = express.Router();
const Model_Petugas = require('../../model/model_users');

// POST /auth/register_petugas
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password harus diisi' });
    }
    try {
        const existingUser = await Model_Petugas.getByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }
        await Model_Petugas.registerPetugas(username, password);
        res.status(201).json({ message: 'Registrasi petugas berhasil' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: err });
    }
});

module.exports = router;
