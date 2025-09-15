import { Request, Response } from 'express';
import { SubmissionService } from '../services/SubmissionService';
import { logger } from '../utils/logger';

export class SubmissionController {
  /**
   * Create a new submission
   */
  static async createSubmission(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const { challengeId, code, language, simulation, metadata } = req.body;

      const submission = await SubmissionService.createSubmission({
        userId,
        challengeId,
        code,
        language,
        simulation,
        metadata: {
          ...metadata,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Submission created successfully',
      });
    } catch (error) {
      logger.error('Create submission error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'SUBMISSION_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create submission',
        },
      });
    }
  }

  /**
   * Process execution results
   */
  static async processExecutionResults(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const results = req.body;

      const submission = await SubmissionService.processExecutionResults(id, results);

      res.json({
        success: true,
        data: submission,
        message: 'Execution results processed successfully',
      });
    } catch (error) {
      logger.error('Process execution results error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'EXECUTION_RESULTS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process execution results',
        },
      });
    }
  }

  /**
   * Get submission by ID
   */
  static async getSubmissionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const submission = await SubmissionService.getSubmissionById(id);

      res.json({
        success: true,
        data: submission,
      });
    } catch (error) {
      logger.error('Get submission by ID error:', error);
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: error instanceof Error ? error.message : 'Submission not found',
        },
      });
    }
  }

  /**
   * Get user submissions
   */
  static async getUserSubmissions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const filters = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await SubmissionService.getUserSubmissions(userId, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Get user submissions error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_SUBMISSIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get submissions',
        },
      });
    }
  }

  /**
   * Get challenge submissions (admin/author only)
   */
  static async getChallengeSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId } = req.params;
      const filters = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await SubmissionService.getChallengeSubmissions(challengeId, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Get challenge submissions error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_CHALLENGE_SUBMISSIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get challenge submissions',
        },
      });
    }
  }

  /**
   * Get user submission statistics
   */
  static async getUserSubmissionStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const stats = await SubmissionService.getUserSubmissionStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Get user submission stats error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_SUBMISSION_STATS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get submission statistics',
        },
      });
    }
  }

  /**
   * Get recent submissions
   */
  static async getRecentSubmissions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const submissions = await SubmissionService.getRecentSubmissions(userId, limit);

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      logger.error('Get recent submissions error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_RECENT_SUBMISSIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get recent submissions',
        },
      });
    }
  }

  /**
   * Delete submission
   */
  static async deleteSubmission(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;

      await SubmissionService.deleteSubmission(id, userId);

      res.json({
        success: true,
        message: 'Submission deleted successfully',
      });
    } catch (error) {
      logger.error('Delete submission error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_SUBMISSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete submission',
        },
      });
    }
  }
}