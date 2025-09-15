import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User profile routes
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/preferences', UserController.getProfile); // Same as profile for now
router.put('/preferences', UserController.updatePreferences);

// Dashboard route
router.get('/dashboard', UserController.getDashboardData);

// Platform statistics route
router.get('/stats', UserController.getPlatformStats);

// User management routes
router.get('/', UserController.getUsers); // Admin only
router.get('/:id', UserController.getUserById);
router.get('/username/:username', UserController.getUserByUsername);
router.get('/:id/stats', UserController.getUserStats);
router.delete('/account', UserController.deleteAccount);

// Leaderboard
router.get('/leaderboard', UserController.getLeaderboard);

export { router as userRoutes };