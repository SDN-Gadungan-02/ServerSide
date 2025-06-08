import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const UserController = {
    // Di UserController.js
    getAllUsers: async (req, res) => {
        try {
            const { search } = req.query;

            let query = `
            SELECT id, username, email, role 
            FROM tb_users
            WHERE 1=1
        `;

            const params = [];
            let paramIndex = 1;

            if (search) {
                query += `
                AND (
                    username ILIKE $${paramIndex} OR 
                    email ILIKE $${paramIndex} OR 
                    role ILIKE $${paramIndex}
                )
            `;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ` ORDER BY username ASC`;

            const result = await db.query(query, params);

            res.json({
                success: true,
                data: result.rows // Langsung mengembalikan array users
            });
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get users',
                error: error.message
            });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, email, password, role } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'username, email, and password are required'
                });
            }

            const emailCheck = await db.query(
                'SELECT id FROM tb_users WHERE email = $1',
                [email]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await db.query(
                `INSERT INTO tb_users (username, email, password, role) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, username, email, role`,
                [username, email, hashedPassword, role || 'user']
            );

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: newUser.rows[0]
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }
    },

    // controllers/userController.js
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, password, role } = req.body;

            // Siapkan data update
            const updateData = { username, email, role };

            // Jika ada password baru, hash password
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }

            const updatedUser = await User.update(id, updateData);

            res.json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error.message
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            await User.delete(id);
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Failed to delete user' });
        }
    }
};

export default UserController;