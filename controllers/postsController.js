import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'static/uploads/feeds');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'thumbnail-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    mimetype && extname ? cb(null, true) : cb(new Error('Hanya file gambar yang diperbolehkan!'));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const PostsController = {

    getAllPosts: async (req, res) => {
        try {
            const [posts] = await db.query('SELECT * FROM postingan');

            // Di postsController.js
            const postsWithUrls = posts.map(post => ({
                ...post,
                Thumbnail_postingan: post.Thumbnail_postingan
                    ? `${req.protocol}://${req.get('host')}${post.Thumbnail_postingan}`
                    : null
            }));

            res.json({ success: true, data: postsWithUrls });
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data postingan' });
        }
    },

    createPost: async (req, res) => {
        try {
            const { title_postingan, deskripsi_postingan, text_postingan, kategori, keyword } = req.body;

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Thumbnail wajib diunggah' });
            }

            // FIX: Simpan path dengan forward slashes
            const thumbnailPath = `/static/uploads/feeds/${req.file.filename}`

            const [result] = await db.query(
                `INSERT INTO postingan SET ?`,
                {
                    title_postingan,
                    Thumbnail_postingan: thumbnailPath,
                    deskripsi_postingan,
                    text_postingan,
                    kategori,
                    keyword,
                    author: req.user.id
                }
            );

            res.status(201).json({
                success: true,
                data: {
                    id: result.insertId,
                    Thumbnail_postingan: thumbnailPath,
                }
            });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path); // Hapus file jika error
            res.status(500).json({ success: false, message: 'Gagal membuat postingan' });
        }
    },

    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const { title_postingan, deskripsi_postingan, text_postingan, kategori, keyword, keepExistingImage } = req.body;

            // Verifikasi kepemilikan postingan
            const [post] = await db.query('SELECT * FROM postingan WHERE id = ?', [id]);
            if (!post.length) return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan' });
            if (post[0].author !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses' });
            }

            // Handle gambar
            let thumbnailPath;
            if (req.file) {
                const thumbnailPath = `/ static / uploads / feeds / ${req.file.filename}`
                // Hapus gambar lama jika ada
                if (post[0].Thumbnail_postingan) {
                    const oldPath = path.join(process.cwd(), 'public', post[0].Thumbnail_postingan);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            } else if (keepExistingImage === "true") {
                thumbnailPath = post[0].Thumbnail_postingan;
            }

            // Update postingan
            const [result] = await db.query(
                `UPDATE postingan SET ? WHERE id = ? `,
                [
                    {
                        title_postingan,
                        Thumbnail_postingan: thumbnailPath,
                        deskripsi_postingan,
                        text_postingan,
                        kategori,
                        keyword
                    },
                    id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan' });
            }

            res.json({
                success: true,
                data: {
                    id,
                    title_postingan,
                    Thumbnail_postingan: Thumbnail_postingan,
                    deskripsi_postingan,
                    text_postingan,
                    kategori,
                    keyword
                }
            });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui postingan' });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { id } = req.params;

            // Verifikasi kepemilikan
            const [post] = await db.query('SELECT * FROM postingan WHERE id = ?', [id]);
            if (!post.length) return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan' });
            if (post[0].author !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses' });
            }

            // Hapus gambar terkait jika ada
            if (post[0].Thumbnail_postingan) {
                const imagePath = path.join(process.cwd(), 'public', post[0].Thumbnail_postingan);
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }

            // Hapus dari database
            const [result] = await db.query('DELETE FROM postingan WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan' });
            }

            res.json({ success: true, message: 'Postingan berhasil dihapus' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus postingan' });
        }
    }
};