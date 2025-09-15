import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAllTemplates, createTemplate } from '../controllers/TemplateController';

const router = Router();

// Public routes
router.get('/', getAllTemplates);

// Protected routes (require authentication)
router.post('/', authenticate, authorize(['admin']), createTemplate);

export { router as templateRoutes };