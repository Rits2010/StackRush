import { Router } from 'express';
import { FocusSessionController } from '../controllers/FocusSessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Focus session routes
router.post('/', FocusSessionController.createFocusSession);
router.get('/', FocusSessionController.getUserFocusSessions);
router.get('/stats', FocusSessionController.getUserFocusStats);
router.get('/recent', FocusSessionController.getRecentFocusSessions);
router.get('/:id', FocusSessionController.getFocusSessionById);
router.delete('/:id', FocusSessionController.deleteFocusSession);

export { router as focusSessionRoutes };