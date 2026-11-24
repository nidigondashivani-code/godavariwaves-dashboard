import { Router } from 'express';
import authController from '../controllers/Auth/auth.controller';
import authenticate from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);

router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
