import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    let token;

    // Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Then check cookies
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await db.query(
            'SELECT id, username, role FROM tb_users WHERE id = $1 LIMIT 1',
            [decoded.id]
        );

        if (!result.rows[0]) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

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