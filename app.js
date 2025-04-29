import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));

// Tambahkan header CORS untuk static files
app.use('/static', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
}, express.static(path.join(__dirname, 'static')));

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/uploads', express.static(path.join(__dirname, 'static', 'uploads')));

app.get('/static/uploads/feeds/:file', (req, res) => {
    res.redirect(`/static/uploads/feeds/${req.params.file}`);
});

// Test endpoint
app.get('/test-images', (req, res) => {
    const testPath = path.join(__dirname, 'static', 'uploads', 'feeds');
    try {
        const files = fs.readdirSync(testPath);
        res.json({
            success: true,
            files: files,
            firstFileUrl: `${req.protocol}://${req.get('host')}/static/uploads/feeds/${files[0]}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            path: testPath
        });
    }
});
// CORS Middleware (jika frontend & backend terpisah)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Pastikan path route diawali dengan /
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes);

// JANGAN gunakan URL lengkap seperti:
// app.use('https://example.com/api', router); // SALAH

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});