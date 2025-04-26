const connection = require('../config/database');

class kendaraanModel {
    // Ambil semua data kendaraan
    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM kendaraan', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Ambil data kendaraan berdasarkan id
    static async getById(id) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM kendaraan WHERE id = ?`, [id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
    //ambil data kendaraan yang belum keluar
    static async getBelumKeluar() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM kendaraan WHERE jam_keluar IS NULL ORDER BY id DESC',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
    //kendaraan yang sudah keluar
    static async getSudahKeluar() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM kendaraan WHERE jam_keluar IS NOT NULL ORDER BY id DESC',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

        // Total income semua
    static async getTotalIncome() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT SUM(biaya) AS total_income FROM kendaraan WHERE jam_keluar IS NOT NULL',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0].total_income || 0);
                }
            );
        });
    }

    // Total income bulan ini
    static async getTotalIncomeBulanIni() {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT SUM(biaya) AS total_income 
                FROM kendaraan 
                WHERE jam_keluar IS NOT NULL 
                AND MONTH(jam_keluar) = MONTH(CURRENT_DATE())
                AND YEAR(jam_keluar) = YEAR(CURRENT_DATE())`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0].total_income || 0);
                }
            );
        });
    }

    // Total income hari ini
    static async getTotalIncomeHariIni() {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT SUM(biaya) AS total_income 
                FROM kendaraan 
                WHERE jam_keluar IS NOT NULL 
                AND DATE(jam_keluar) = CURRENT_DATE()`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0].total_income || 0);
                }
            );
        });
    }


    // Parkir masuk — simpan data kendaraan (POST /store)
    static async Store(data) {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO kendaraan SET ?', 
                data, 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }    
    static async getSlotKosong() {
        return new Promise((resolve, reject) => {
            let allSlots = [];
    
            ['A', 'B', 'C'].forEach(sektor => {
                for (let i = 1; i <= 10; i++) {
                    allSlots.push(`${sektor}${i}`);
                }
            });
            connection.query(
                `SELECT no_parkir FROM kendaraan WHERE jam_keluar IS NULL`,
                (err, rows) => {
                    if (err) return reject(err);
                    const occupied = rows.map(row => row.no_parkir);
                    const available = allSlots.find(slot => !occupied.includes(slot));
                    if (available) {
                        resolve(available);
                    } else {
                        reject(new Error('Parkiran penuh'));
                    }
                }
            );
        });
    }
    
    // Parkir keluar — update jam_keluar & biaya (PATCH /update/:id)
    static async update(id, data) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE kendaraan SET ? WHERE id = ?', [data, id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // Hapus data kendaraan berdasarkan id (DELETE /delete/:id)
    static async delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM kendaraan WHERE id = ?', [id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

module.exports = kendaraanModel;
