import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/roleCheck';
import { validate } from '../middleware/validation';
import { achievementValidation } from '../validation/achievementSchemas';
import AchievementController from '../controllers/AchievementController';

const router = Router();

// Public routes
router.get('/', AchievementController.getAllAchievements);
router.get('/:id', AchievementController.getAchievement);

// Protected routes (require authentication)
router.use(authenticate);

// User achievement endpoints
router.get('/user/me', AchievementController.getUserAchievements);
router.post('/check', AchievementController.checkForNewAchievements);

// Admin only routes
router.use(adminOnly);
router.post('/', validate(achievementValidation.create), AchievementController.createAchievement);
router.put('/:id', validate(achievementValidation.update), AchievementController.updateAchievement);
router.delete('/:id', AchievementController.deleteAchievement);

export default router;
