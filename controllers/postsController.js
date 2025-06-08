import db from '../config/db.js';
import Post from '../models/Post.js';
import fs from 'fs';

const PostsController = {
    getAllPosts: async (req, res) => {
        try {
            const { search, category, month } = req.query;

            let query = `
        SELECT p.*, u.username as author_name 
        FROM tb_postingan p
        LEFT JOIN tb_users u ON p.author = u.id
        WHERE 1=1
        `;

            const params = [];
            let paramIndex = 1;

            if (search) {
                query += `
                AND (
                    p.title_postingan ILIKE $${paramIndex} OR 
                    p.deskripsi_postingan ILIKE $${paramIndex} OR 
                    p.kategori ILIKE $${paramIndex} OR
                    p.keyword ILIKE $${paramIndex} OR
                    u.username ILIKE $${paramIndex}
                )
            `;
                params.push(`%${search}%`);
                paramIndex++;
            }

            if (category) {
                query += ` AND p.kategori = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }

            if (month) {
                query += ` AND EXTRACT(MONTH FROM p.created_at) = $${paramIndex}`;
                params.push(month);
                paramIndex++;
            }

            query += ` ORDER BY p.created_at DESC`;

            const result = await db.query(query, params);

            const postsWithUrls = result.rows.map(post => ({
                ...post,
                thumbnail_postingan: post.thumbnail_postingan
                    ? `${req.protocol}://${req.get('host')}${post.thumbnail_postingan}`
                    : null
            }));

            res.json({ success: true, data: postsWithUrls });
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch posts',
                error: error.message
            });
        }
    },

    getPostsById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await Post.getPostsById(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }

            const postWithUrl = {
                ...result,
                thumbnail_postingan: result.thumbnail_postingan
                    ? `${req.protocol}://${req.get('host')}${result.thumbnail_postingan}`
                    : null
            };

            res.json({
                success: true,
                data: postWithUrl
            });
        } catch (error) {
            console.error('Error fetching post:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch post',
                error: error.message
            });
        }
    },
    createPost: async (req, res) => {
        try {
            if (!req.file && !req.body.keepExistingImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Thumbnail is required for new posts'
                });
            }

            const postData = {
                ...req.body,
                thumbnail_postingan: req.file
                    ? `/static/uploads/feeds/${req.file.filename}`
                    : null,
                author: req.body.author || req.user.id // Ambil dari form data atau dari auth middleware
            };

            const newPost = await Post.create(postData);

            res.status(201).json({
                success: true,
                data: newPost
            });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            console.error('Error creating post:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create post',
                error: error.message
            });
        }
    },

    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.findById(id);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }

            // Verifikasi author
            if (post.author !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized - You are not the author of this post'
                });
            }

            const thumbnail_postingan = req.file
                ? `/static/uploads/feeds/${req.file.filename}`
                : req.body.keepExistingImage === "true"
                    ? post.thumbnail_postingan
                    : null;

            if (req.file && post.thumbnail_postingan) {
                await Post.deleteImageFile(post.thumbnail_postingan);
            }

            const updatedPost = await Post.update(id, {
                ...req.body,
                thumbnail_postingan
            });

            res.json({
                success: true,
                data: updatedPost
            });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            console.error('Error updating post:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update post'
            });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { id } = req.params;
            const isOwner = await Post.isOwner(id, req.user.id);

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            await Post.deletePostAndImage(id);

            res.json({
                success: true,
                message: 'Post deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(error.message === 'Post not found' ? 404 : 500).json({
                success: false,
                message: error.message || 'Failed to delete post'
            });
        }
    }
};

export default PostsController;