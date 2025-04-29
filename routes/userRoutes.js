import express from 'express';
import UserController from '../controllers/userController.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', UserController.getAllUsers);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;