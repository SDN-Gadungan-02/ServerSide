import express from 'express';
import PostsController from '../controllers/postsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { postUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', PostsController.getAllPosts);
router.post('/', authenticate, postUpload.single('thumbnail'), PostsController.createPost);
router.put('/:id', authenticate, postUpload.single('thumbnail'), PostsController.updatePost);
router.delete('/:id', authenticate, PostsController.deletePost);

export default router;