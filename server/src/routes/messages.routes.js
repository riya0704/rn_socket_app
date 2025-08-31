import { Router } from 'express';
import { getMessages } from '../controllers/messages.controller.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.get('/:id/messages', auth, getMessages);
export default router;
