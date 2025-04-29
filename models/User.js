import db from '../config/db.js';
import bcrypt from 'bcrypt';

class User {
    static async create({ username, password, role = 'admin' }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO tb_users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
            [username, hashedPassword, role]
        );
        return result.rows[0];
    }

    static async findByUsername(username) {
        const result = await db.query(
            'SELECT * FROM tb_users WHERE username = $1 LIMIT 1',
            [username]
        );
        return result.rows[0] || null;
    }

    static async findById(id) {
        const result = await db.query(
            'SELECT id, username, role FROM tb_users WHERE id = $1 LIMIT 1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async comparePassword(candidatePassword, hashedPassword) {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }
}

export default User;