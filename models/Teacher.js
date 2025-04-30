import db from '../config/db.js';
import path from 'path';
import fs from 'fs';

class Teacher {
    static async findAll(search = '') {
        try {
            let query = `
                SELECT g.*, u.username as author_name 
                FROM tb_guru g
                LEFT JOIN tb_users u ON g.author = u.id
            `;
            const params = [];

            if (search) {
                query += ' WHERE g.nama_guru LIKE ? OR g.NIP LIKE ?';
                params.push(`%${search}%`, `%${search}%`);
            }

            const [rows] = await db.query(query, params);
            return rows; // Just return the rows directly
        } catch (error) {
            console.error('Error in Teacher.findAll:', error);
            throw error;
        }
    }
    static async findById(id) {
        try {
            const results = await db.query(
                'SELECT * FROM tb_guru WHERE id = ?',
                [id]
            );
            return results[0][0]; // First row of first result
        } catch (error) {
            console.error('Error in Teacher.findById:', error);
            throw error;
        }
    }

    static async create({ nama_guru, pas_foto, NIP, keterangan_guru, status, author }) {
        try {
            const results = await db.query(
                `INSERT INTO tb_guru 
                (nama_guru, pas_foto, NIP, keterangan_guru, status, author) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [nama_guru, pas_foto, NIP, keterangan_guru, status, author]
            );
            return { id: results[0].insertId };
        } catch (error) {
            console.error('Error in Teacher.create:', error);
            throw error;
        }
    }

    static async update(id, { nama_guru, pas_foto, NIP, keterangan_guru, status }) {
        try {
            const results = await db.query(
                `UPDATE tb_guru SET 
                nama_guru = ?, pas_foto = ?, NIP = ?, 
                keterangan_guru = ?, status = ? 
                WHERE id = ?`,
                [nama_guru, pas_foto, NIP, keterangan_guru, status, id]
            );
            return results[0]; // Return the result object
        } catch (error) {
            console.error('Error in Teacher.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const results = await db.query(
                'DELETE FROM tb_guru WHERE id = ?',
                [id]
            );
            return results[0]; // Return the result object
        } catch (error) {
            console.error('Error in Teacher.delete:', error);
            throw error;
        }
    }

    static async getImagePath(id) {
        try {
            const results = await db.query(
                'SELECT pas_foto FROM tb_guru WHERE id = ?',
                [id]
            );
            return results[0][0]?.pas_foto; // First row's pas_foto
        } catch (error) {
            console.error('Error in Teacher.getImagePath:', error);
            throw error;
        }
    }

    static async deleteImageFile(filePath) {
        try {
            if (filePath) {
                const fullPath = path.join(process.cwd(), filePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error in Teacher.deleteImageFile:', error);
            throw error;
        }
    }
}

export default Teacher;