import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { submissionSchemas } from '../validation/submissionSchemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/submissions
 * @desc    Create a new submission
 * @access  Private
 */
router.post(
  '/',
  validate(submissionSchemas.createSubmission),
  SubmissionController.createSubmission
);

/**
 * @route   POST /api/submissions/:id/results
 * @desc    Process execution results for a submission
 * @access  Private
 */
router.post(
  '/:id/results',
  validate(submissionSchemas.processResults),
  SubmissionController.processExecutionResults
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateParams(submissionSchemas.getById),
  SubmissionController.getSubmissionById
);

/**
 * @route   GET /api/submissions
 * @desc    Get user submissions with filters
 * @access  Private
 */
router.get(
  '/',
  validateQuery(submissionSchemas.getUserSubmissions),
  SubmissionController.getUserSubmissions
);

/**
 * @route   GET /api/submissions/stats/user
 * @desc    Get user submission statistics
 * @access  Private
 */
router.get(
  '/stats/user',
  SubmissionController.getUserSubmissionStats
);

/**
 * @route   GET /api/submissions/recent
 * @desc    Get recent submissions
 * @access  Private
 */
router.get(
  '/recent',
  validateQuery(submissionSchemas.getRecent),
  SubmissionController.getRecentSubmissions
);

/**
 * @route   GET /api/submissions/challenge/:challengeId
 * @desc    Get challenge submissions (admin/author only)
 * @access  Private (Admin/Author)
 */
router.get(
  '/challenge/:challengeId',
  authorize(['admin', 'moderator']),
  validateQuery(submissionSchemas.getChallengeSubmissions),
  SubmissionController.getChallengeSubmissions
);

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Delete submission
 * @access  Private
 */
router.delete(
  '/:id',
  validateParams(submissionSchemas.deleteSubmission),
  SubmissionController.deleteSubmission
);

export { router as submissionRoutes };