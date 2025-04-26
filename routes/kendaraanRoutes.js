const express = require('express');
const router = express.Router();
const verifyToken = require('../config/middleware/jwt');
const cacheMiddleware = require('../config/middleware/cacheMiddleware');
const { kendaraanQueue } = require('../config/middleware/queue');
const { encryptData } = require('../config/middleware/crypto');
const moment = require('moment-timezone');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });

// GET semua kendaraan
router.get('/', verifyToken, cacheMiddleware,  async (req, res) => {
    try {
        const job = await kendaraanQueue.add({ action: 'get' });
        const result = await job.finished();

        return res.status(200).json({
            status: true,
            message: 'Data Kendaraan',
            Data: result.Data
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
});

// GET kendaraan yang belum keluar
router.get('/belum-keluar', verifyToken, cacheMiddleware,  async (req, res) => {
    try {
        const job = await kendaraanQueue.add({ action: 'getBelumKeluar' });
        const result = await job.finished();

        return res.status(200).json({
            status: true,
            message: 'Data kendaraan yang belum keluar',
            data: result.Data
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat mengambil data',
            error: error.message
        });
    }
});

// GET kendaraan yang sudah keluar
router.get('/sudah-keluar', verifyToken, cacheMiddleware, async (req, res) => {
    try {
        const job = await kendaraanQueue.add({ action: 'getSudahKeluar' });
        const result = await job.finished();

        return res.status(200).json({
            status: true,
            message: 'Data kendaraan yang sudah keluar',
            data: result.Data
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat mengambil data',
            error: error.message
        });
    }
});

// GET total income semua
router.get('/total-income', verifyToken, cacheMiddleware, async (req, res) => {
    try {
        const job = await kendaraanQueue.add({ action: 'getTotalIncome' });
        const result = await job.finished();

        const encryptedIncome = encryptData(result.total_income);

        res.status(200).json({
            status: true,
            message: 'Total income keseluruhan',
            total_income: encryptedIncome
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat menghitung total income',
            error: error.message
        });
    }
});

// GET total income bulan ini
router.get('/total-income/bulan-ini', verifyToken, cacheMiddleware, async (req, res) => {
    try {
        const job = await kendaraanQueue.add({ action: 'getTotalIncomeBulanIni' });
        const result = await job.finished();

        const encryptedIncome = encryptData(result.total_income);

        res.status(200).json({
            status: true,
            message: 'Total income bulan ini',
            total_income: encryptedIncome
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat menghitung total income bulan ini',
            error: error.message
        });
    }
});

// GET total income hari ini dengan caching menggunakan NodeCache
router.get('/total-income/hari-ini', verifyToken, async (req, res) => {
    try {
        const cachedIncome = cache.get('totalIncomeHariIni');
        if (cachedIncome !== undefined) {
            return res.status(200).json({
                status: true,
                message: 'Total income hari ini (cache)',
                total_income: cachedIncome
            });
        }
        const job = await kendaraanQueue.add({ action: 'getTotalIncomeHariIni' });
        const result = await job.finished();
        const encryptedIncome = encryptData(result.total_income);
        cache.set('totalIncomeHariIni', encryptedIncome);
        res.status(200).json({
            status: true,
            message: 'Total income hari ini',
            total_income: encryptedIncome
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat menghitung total income hari ini',
            error: error.message
        });
    }
});


// POST /store kendaraan (hanya no_pol, petugas_id ambil dari JWT)
router.post('/store', verifyToken, async (req, res) => {
    try {
        let { no_pol } = req.body;
        let petugas_id = req.user.id;
        const jobSlot = await kendaraanQueue.add({ action: 'getSlotKosong' });
        const resultSlot = await jobSlot.finished();

        let no_parkir = resultSlot.slot;
        let Data = { no_pol, petugas_id, no_parkir };
        await kendaraanQueue.add({ action: 'store', Data })
        return res.status(201).json({
            status: true,
            message: `Kendaraan berhasil diparkir di slot ${no_parkir}`
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Terjadi kesalahan saat menyimpan kendaraan',
            error: error.message
        });
    }
});

router.patch('/update/:id', verifyToken, async (req, res) => {
    try {
        let id = req.params.id;
        const now = moment().tz('Asia/Jakarta');
        const formattedJamKeluar = now.format('YYYY-MM-DD HH:mm:ss');
        const jobGet = await kendaraanQueue.add({ action: 'get' });
        const resultGet = await jobGet.finished();
        const kendaraan = resultGet.Data.find(k => k.id == id);
        if (!kendaraan) {
            return res.status(404).json({
                status: false,
                message: 'Data kendaraan tidak ditemukan'
            });
        }
        const jamMasuk = moment(kendaraan.jam_masuk);
        if (now.isSameOrBefore(jamMasuk)) {
            return res.status(400).json({
                status: false,
                message: 'Jam keluar harus lebih besar dari jam masuk'
            });
        }
        const selisihMs = now.diff(jamMasuk);
        const selisihJam = Math.ceil(selisihMs / (1000 * 60 * 60));
        let biaya = 2000;
        if (selisihJam > 1) {
            biaya += (selisihJam - 1) * 1000;
        }
        const Data = {
            jam_keluar: formattedJamKeluar,
            biaya: biaya
        };
        await kendaraanQueue.add({ action: 'update', id, Data });
        return res.status(200).json({
            status: true,
            message: 'Data kendaraan berhasil diperbarui',
            durasi: selisihJam + ' jam',
            biaya: biaya,
            jam_keluar: formattedJamKeluar
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat update kendaraan',
            error: error.message
        });
    }
});


// DELETE /delete/:id kendaraan
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        let id = req.params.id;
        await kendaraanQueue.add({ action: 'delete', id });
        return res.status(200).json({
            status: true,
            message: 'Data kendaraan berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat menghapus kendaraan',
            error: error.message
        });
    }
});

module.exports = router;
