import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getAllPosts, 
  createPost, 
  getPostById, 
  toggleLike, 
  toggleBookmark 
} from '../controllers/CommunityController';

const router = Router();

// Public routes
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);

// Protected routes (require authentication)
router.post('/posts', authenticate, createPost);
router.post('/posts/:id/like', authenticate, toggleLike);
router.post('/posts/:id/bookmark', authenticate, toggleBookmark);

export { router as communityRoutes };