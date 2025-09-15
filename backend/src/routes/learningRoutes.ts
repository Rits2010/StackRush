import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAllPlaylists, enrollInPlaylist } from '../controllers/LearningController';

const router = Router();

// Public routes
router.get('/playlists', getAllPlaylists);

// Protected routes (require authentication)
router.post('/playlists/:id/enroll', authenticate, enrollInPlaylist);

export { router as learningRoutes };