import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Post from '../models/Post.js';

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
    mimetype && extname ? cb(null, true) : cb(new Error('Only image files are allowed!'));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const PostsController = {
    getAllPosts: async (req, res) => {
        try {
            const posts = await Post.findAll(req.query.search);

            const postsWithUrls = posts.map(post => ({
                ...post,
                thumbnail_postingan: post.thumbnail_postingan
                    ? `${req.protocol}://${req.get('host')}${post.thumbnail_postingan}`
                    : null
            }));

            res.json({ success: true, data: postsWithUrls });
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch posts' });
        }
    },

    createPost: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Thumbnail is required' });
            }

            const thumbnailPath = `/static/uploads/feeds/${req.file.filename}`;
            const postData = {
                ...req.body,
                thumbnail_postingan: thumbnailPath,
                author: req.user.id
            };

            const newPost = await Post.create(postData);

            res.status(201).json({
                success: true,
                data: newPost
            });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            console.error('Error creating post:', error);
            res.status(500).json({ success: false, message: 'Failed to create post' });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { id } = req.params;
            const isOwner = await Post.isOwner(id, req.user.id);

            if (!isOwner) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }

            await Post.deletePostAndImage(id);

            res.json({
                success: true,
                message: 'Post and associated image deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            const status = error.message === 'Post not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete post'
            });
        }
    },

    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const isOwner = await Post.isOwner(id, req.user.id);

            if (!isOwner) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }

            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            // Prepare update data
            const updateData = {
                title_postingan: req.body.title_postingan,
                deskripsi_postingan: req.body.deskripsi_postingan,
                text_postingan: req.body.text_postingan,
                kategori: req.body.kategori,
                keyword: req.body.keyword,
                thumbnail_postingan: req.file
                    ? `/static/uploads/feeds/${req.file.filename}`
                    : req.body.keepExistingImage === "true"
                        ? post.thumbnail_postingan
                        : null // ini akan menghapus gambar jika keepExistingImage false
            };

            const updatedPost = await Post.updateWithImageCleanup(
                id,
                updateData,
                post.thumbnail_postingan
            );

            // Generate full URL untuk thumbnail
            const postWithUrl = {
                ...updatedPost,
                thumbnail_postingan: updatedPost.thumbnail_postingan
                    ? `${req.protocol}://${req.get('host')}${updatedPost.thumbnail_postingan}`
                    : null
            };

            res.json({
                success: true,
                data: postWithUrl
            });
        } catch (error) {
            if (req.file) {
                const newImagePath = path.join(process.cwd(), 'static/uploads/feeds', req.file.filename);
                Post.deleteImageFile(newImagePath);
            }
            console.error('Error updating post:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update post'
            });
        }
    }
};