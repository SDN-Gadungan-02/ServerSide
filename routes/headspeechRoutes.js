import express from 'express';
import HeadSpeechController from '../controllers/headspeechController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', HeadSpeechController.getHeadSpeech);
router.put('/', authenticate, HeadSpeechController.updateHeadSpeech);

export default router;