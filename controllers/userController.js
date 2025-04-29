import db from '../config/db.js';
import bcrypt from 'bcryptjs';

const UserController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const result = await db.query('SELECT id, username, email, role FROM tb_users');
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    },

    // Create user (PostgreSQL)
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

    // Update user (PostgreSQL)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, password, role } = req.body;

            if (!username || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'username and email are required'
                });
            }

            const userCheck = await db.query(
                'SELECT id FROM tb_users WHERE id = $1',
                [id]
            );

            if (userCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const emailCheck = await db.query(
                'SELECT id FROM tb_users WHERE email = $1 AND id != $2',
                [email, id]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use by another user'
                });
            }

            let queryText;
            let queryParams;

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                queryText = `
                    UPDATE tb_users 
                    SET username = $1, email = $2, role = $3, password = $4 
                    WHERE id = $5
                    RETURNING id, username, email, role
                `;
                queryParams = [username, email, role || 'user', hashedPassword, id];
            } else {
                queryText = `
                    UPDATE tb_users 
                    SET username = $1, email = $2, role = $3 
                    WHERE id = $4
                    RETURNING id, username, email, role
                `;
                queryParams = [username, email, role || 'user', id];
            }

            const updatedUser = await db.query(queryText, queryParams);

            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser.rows[0]
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    },

    // Delete user (PostgreSQL)
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            const userCheck = await db.query(
                'SELECT id FROM tb_users WHERE id = $1',
                [id]
            );

            if (userCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await db.query('DELETE FROM tb_users WHERE id = $1', [id]);

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
};

export default UserController;