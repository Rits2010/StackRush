import { Router } from 'express';
import { ChallengeController } from '../controllers/ChallengeController';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { challengeSchemas } from '../validation/challengeSchemas';

const router = Router();

/**
 * @route   GET /api/challenges
 * @desc    Get challenges with filters
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  validateQuery(challengeSchemas.getChallengesQuery),
  ChallengeController.getChallenges
);

/**
 * @route   GET /api/challenges/popular
 * @desc    Get popular challenges
 * @access  Public
 */
router.get(
  '/popular',
  optionalAuth,
  validateQuery(challengeSchemas.popularChallengesQuery),
  ChallengeController.getPopularChallenges
);

/**
 * @route   GET /api/challenges/categories
 * @desc    Get challenges grouped by category
 * @access  Public
 */
router.get(
  '/categories',
  optionalAuth,
  ChallengeController.getChallengesByCategory
);

/**
 * @route   POST /api/challenges
 * @desc    Create new challenge
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'moderator']),
  validate(challengeSchemas.createChallenge),
  ChallengeController.createChallenge
);

/**
 * @route   GET /api/challenges/:id
 * @desc    Get challenge by ID
 * @access  Public (with privacy checks)
 */
router.get(
  '/:id',
  optionalAuth,
  validateParams(challengeSchemas.challengeIdParam),
  ChallengeController.getChallengeById
);

/**
 * @route   PUT /api/challenges/:id
 * @desc    Update challenge
 * @access  Private (Author/Admin)
 */
router.put(
  '/:id',
  authenticate,
  validateParams(challengeSchemas.challengeIdParam),
  validate(challengeSchemas.updateChallenge),
  ChallengeController.updateChallenge
);

/**
 * @route   DELETE /api/challenges/:id
 * @desc    Delete challenge (soft delete)
 * @access  Private (Author/Admin)
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(challengeSchemas.challengeIdParam),
  ChallengeController.deleteChallenge
);

/**
 * @route   GET /api/challenges/:id/stats
 * @desc    Get challenge statistics
 * @access  Public
 */
router.get(
  '/:id/stats',
  optionalAuth,
  validateParams(challengeSchemas.challengeIdParam),
  ChallengeController.getChallengeStats
);

/**
 * @route   POST /api/challenges/:id/start
 * @desc    Start challenge session
 * @access  Private
 */
router.post(
  '/:id/start',
  authenticate,
  validateParams(challengeSchemas.challengeIdParam),
  ChallengeController.startChallengeSession
);

/**
 * @route   GET /api/challenges/slug/:slug
 * @desc    Get challenge by slug
 * @access  Public (with privacy checks)
 */
router.get(
  '/slug/:slug',
  optionalAuth,
  validateParams(challengeSchemas.challengeSlugParam),
  ChallengeController.getChallengeBySlug
);

export { router as challengeRoutes };