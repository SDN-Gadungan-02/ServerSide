import express from 'express';
import { PostsController } from '../controllers/postsController.js'; // Note plural "postsController"
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../controllers/postsController.js'; // Import from same file

const router = express.Router();

// GET endpoints (no auth needed)
router.get('/', PostsController.getAllPosts);

// POST, PUT, DELETE endpoints (require auth)
router.post('/', authenticate, upload.single('thumbnail'), PostsController.createPost);
router.put('/:id', authenticate, upload.single('thumbnail'), PostsController.updatePost);
router.delete('/:id', authenticate, PostsController.deletePost);

export default router;