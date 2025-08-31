import { Router } from 'express';
import { listUsers } from '../controllers/users.controller.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.get('/', auth, listUsers);
export default router;
