import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const authenticate = async (req, res, next) => {
    const tokenSources = [
        req.cookies?.token,
        req.headers.authorization?.split(' ')[1],
        req.headers['x-access-token']
    ];

    const token = tokenSources.find(t => t);

    if (!token) {
        console.log('No token provided - but this might be normal for first visit');
        return next(); // Lanjut tanpa error untuk route yang tidak membutuhkan auth
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Gunakan connection pool dengan error handling
        try {
            const [rows] = await db.query(
                'SELECT id, username, role FROM users WHERE id = ?',
                [decoded.userId]
            );

            if (!rows.length) {
                console.log('User not found in database');
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            req.user = rows[0];
            return next();
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(503).json({
                success: false,
                message: 'Database connection error'
            });
        }
    } catch (jwtError) {
        console.error('JWT verification error:', jwtError.message);

        // Handle token expired khusus
        if (jwtError.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                error: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: 'INVALID_TOKEN'
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