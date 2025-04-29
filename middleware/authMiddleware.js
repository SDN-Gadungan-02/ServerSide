import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    const tokenSources = [
        req.cookies?.token,
        req.headers.authorization?.split(' ')[1],
        req.headers['x-access-token']
    ];

    const token = tokenSources.find(t => t);

    if (!token) {
        console.log('Authentication failed: No token provided');
        return res.status(401).json({
            success: false,
            message: "Authentication token required"
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get fresh user data
        const result = await db.query(
            'SELECT id, username, role FROM tb_users WHERE id = $1 LIMIT 1',
            [decoded.id]
        );

        if (!result.rows[0]) {
            console.log('Authentication failed: User not found');
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Attach user to request
        req.user = result.rows[0];
        next();
    } catch (err) {
        console.error('Authentication error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired",
                error: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token",
            error: "INVALID_TOKEN"
        });
    }
};

// Middleware untuk route yang wajib auth
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};