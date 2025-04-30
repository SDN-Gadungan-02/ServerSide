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
                query += ' WHERE g.nama_guru ILIKE $1 OR g.NIP ILIKE $2';
                params.push(`%${search}%`, `%${search}%`);
            }

            // For PostgreSQL, the result is { rows, fields }
            const result = await db.query(query, params);
            return result.rows; // Return just the rows array
        } catch (error) {
            console.error('Error in Teacher.findAll:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const result = await db.query(
                'SELECT * FROM tb_guru WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in Teacher.findById:', error);
            throw error;
        }
    }

    static async create({ nama_guru, pas_foto, NIP, keterangan_guru, status, author }) {
        try {
            const result = await db.query(
                `INSERT INTO tb_guru 
                (nama_guru, pas_foto, NIP, keterangan_guru, status, author) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [nama_guru, pas_foto, NIP, keterangan_guru, status, author]
            );
            return result.rows[0];
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