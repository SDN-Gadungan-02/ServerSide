import express from 'express';
import VisimisiController from '../controllers/visimisiController.js';

const router = express.Router();

router.get('/', VisimisiController.getAllVisiMisi);
router.update('/:id', VisimisiController.updateVisiMisi);