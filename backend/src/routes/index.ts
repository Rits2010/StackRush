import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { challengeRoutes } from './challengeRoutes';
import { submissionRoutes } from './submissionRoutes';
import { notificationRoutes } from './notificationRoutes';
import { focusSessionRoutes } from './focusSessionRoutes';
import { learningRoutes } from './learningRoutes';
import { templateRoutes } from './templateRoutes';
import { communityRoutes } from './communityRoutes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/submissions', submissionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/focus-sessions', focusSessionRoutes);
router.use('/learning', learningRoutes);
router.use('/templates', templateRoutes);
router.use('/community', communityRoutes);

// Health check for API routes
router.get('/', (req, res) => {
  res.json({
    message: 'StackRush API Server',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      challenges: '/api/challenges',
      submissions: '/api/submissions',
      notifications: '/api/notifications',
      focusSessions: '/api/focus-sessions',
      learning: '/api/learning',
      templates: '/api/templates',
      community: '/api/community',
    },
  });
});

export { router as apiRoutes };