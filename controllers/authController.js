import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required",
            error: "MISSING_CREDENTIALS"
        });
    }

    try {
        // 1. Cari user by username
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                error: 'USER_NOT_FOUND'
            });
        }

        // 2. Verifikasi password
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                error: 'INVALID_PASSWORD'
            });
        }

        // 3. Buat token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        // 4. Set cookie HTTP Only
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: parseInt(process.env.COOKIE_EXPIRES) || 3600000, // 1 jam
            sameSite: 'strict'
        });

        // 5. Response tanpa password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            token, // Kirim token juga di body untuk fallback
            user: userWithoutPassword
        });


    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: "SERVER_ERROR"
        });
    }
};

export const verify = async (req, res) => {
    // Middleware sudah menangani verifikasi
    res.json({
        success: true,
        user: req.user
    });
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: "Logged out successfully" });
};