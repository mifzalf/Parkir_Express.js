const connection = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Model_petugas {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, username, created_at FROM petugas ORDER BY id DESC', 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async Store(data) {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO petugas SET ?', 
                data, 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, username, created_at FROM petugas WHERE id = ?', 
                [id], 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async update(id, data) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE petugas SET ? WHERE id = ?', 
                [data, id], 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                'DELETE FROM petugas WHERE id = ?', 
                [id], 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getByUsername(username) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM petugas WHERE username = ?', 
                [username], 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0]);
                }
            );
        });
    }

    static async registerPetugas(username, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                connection.query(
                    'INSERT INTO petugas (username, password) VALUES (?, ?)', 
                    [username, hashedPassword], 
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    static async login(username, password) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM petugas WHERE username = ?';
            connection.query(sql, [username], async (err, result) => {
                if (err) return reject({ status: 500, message: 'Error pada server', error: err });
                
                if (result.length === 0) {
                    return reject({ status: 401, message: 'Username tidak ditemukan' });
                }
                
                const user = result[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return reject({ status: 401, message: 'Password salah' });
                }
                
                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                resolve({ token });
            });
        });
    }
}

module.exports = Model_petugas;
