import express from 'express';
import PostsController from '../controllers/postsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { postUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', PostsController.getAllPosts);
router.get('/:id', PostsController.getPostsById);
router.post('/', authenticate, postUpload.single('thumbnail_postingan'), PostsController.createPost);
router.put('/:id', authenticate, postUpload.single('thumbnail_postingan'), PostsController.updatePost);
router.delete('/:id', authenticate, PostsController.deletePost);

export default router;