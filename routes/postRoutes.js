import express from 'express';
import { PostsController, upload } from '../controllers/postsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', PostsController.getAllPosts);
router.post('/', authenticate, upload.single('thumbnail'), PostsController.createPost);
router.put('/:id', authenticate, upload.single('thumbnail'), PostsController.updatePost);
router.delete('/:id', authenticate, PostsController.deletePost);

export default router;