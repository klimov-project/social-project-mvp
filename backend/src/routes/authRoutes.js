
import express from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();

router.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok' });
});

router.get('/auth/me', authMiddleware, authController.me);
router.post('/auth/sign-up', authController.signUp);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authMiddleware, authController.logout);

export default router;