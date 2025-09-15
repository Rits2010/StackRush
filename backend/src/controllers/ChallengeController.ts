import { Response } from 'express';
import { ChallengeService } from '../services/ChallengeService';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export class ChallengeController {
  /**
   * Get challenges with filters
   */
  static async getChallenges(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = req.query as any;
      const result = await ChallengeService.getChallenges(filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get challenges error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CHALLENGES_ERROR',
          message: 'Failed to retrieve challenges',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get challenge by ID
   */
  static async getChallengeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const challenge = await ChallengeService.getChallengeById(id, userId);

      const response: ApiResponse = {
        success: true,
        data: challenge,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get challenge by ID error:', error);
      
      if (error instanceof Error && error.message === 'Challenge not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHALLENGE_NOT_FOUND',
            message: 'Challenge not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'GET_CHALLENGE_ERROR',
            message: 'Failed to retrieve challenge',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Get challenge by slug
   */
  static async getChallengeBySlug(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const userId = req.user?.id;
      
      const challenge = await ChallengeService.getChallengeBySlug(slug, userId);

      const response: ApiResponse = {
        success: true,
        data: challenge,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get challenge by slug error:', error);
      
      if (error instanceof Error && error.message === 'Challenge not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHALLENGE_NOT_FOUND',
            message: 'Challenge not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'GET_CHALLENGE_ERROR',
            message: 'Failed to retrieve challenge',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Create new challenge
   */
  static async createChallenge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authorId = req.user!.id;
      const challengeData = req.body;

      const challenge = await ChallengeService.createChallenge(authorId, challengeData);

      const response: ApiResponse = {
        success: true,
        data: challenge,
        message: 'Challenge created successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create challenge error:', error);
      
      let statusCode = 500;
      let code = 'CREATE_CHALLENGE_ERROR';
      let message = 'Failed to create challenge';

      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          statusCode = 409;
          code = 'CHALLENGE_EXISTS';
          message = 'A challenge with this title already exists';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Update challenge
   */
  static async updateChallenge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authorId = req.user!.id;
      const updates = req.body;

      const challenge = await ChallengeService.updateChallenge(id, authorId, updates);

      const response: ApiResponse = {
        success: true,
        data: challenge,
        message: 'Challenge updated successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update challenge error:', error);
      
      let statusCode = 500;
      let code = 'UPDATE_CHALLENGE_ERROR';
      let message = 'Failed to update challenge';

      if (error instanceof Error) {
        if (error.message === 'Challenge not found') {
          statusCode = 404;
          code = 'CHALLENGE_NOT_FOUND';
          message = 'Challenge not found';
        } else if (error.message === 'Not authorized to update this challenge') {
          statusCode = 403;
          code = 'NOT_AUTHORIZED';
          message = 'Not authorized to update this challenge';
        } else if (error.message.includes('already exists')) {
          statusCode = 409;
          code = 'CHALLENGE_EXISTS';
          message = 'A challenge with this title already exists';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Delete challenge
   */
  static async deleteChallenge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authorId = req.user!.id;

      await ChallengeService.deleteChallenge(id, authorId);

      const response: ApiResponse = {
        success: true,
        message: 'Challenge deleted successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Delete challenge error:', error);
      
      let statusCode = 500;
      let code = 'DELETE_CHALLENGE_ERROR';
      let message = 'Failed to delete challenge';

      if (error instanceof Error) {
        if (error.message === 'Challenge not found') {
          statusCode = 404;
          code = 'CHALLENGE_NOT_FOUND';
          message = 'Challenge not found';
        } else if (error.message === 'Not authorized to delete this challenge') {
          statusCode = 403;
          code = 'NOT_AUTHORIZED';
          message = 'Not authorized to delete this challenge';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get challenge statistics
   */
  static async getChallengeStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await ChallengeService.getChallengeStats(id);

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get challenge stats error:', error);
      
      if (error instanceof Error && error.message === 'Challenge not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHALLENGE_NOT_FOUND',
            message: 'Challenge not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'GET_STATS_ERROR',
            message: 'Failed to retrieve challenge statistics',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Start challenge session
   */
  static async startChallengeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const sessionData = await ChallengeService.startChallengeSession(userId, id);

      const response: ApiResponse = {
        success: true,
        data: sessionData,
        message: 'Challenge session started',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Start challenge session error:', error);
      
      let statusCode = 500;
      let code = 'START_SESSION_ERROR';
      let message = 'Failed to start challenge session';

      if (error instanceof Error) {
        if (error.message === 'Challenge not found') {
          statusCode = 404;
          code = 'CHALLENGE_NOT_FOUND';
          message = 'Challenge not found';
        } else if (error.message === 'Challenge not available') {
          statusCode = 403;
          code = 'CHALLENGE_NOT_AVAILABLE';
          message = 'Challenge not available';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get popular challenges
   */
  static async getPopularChallenges(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query as any;
      const challenges = await ChallengeService.getPopularChallenges(parseInt(limit));

      const response: ApiResponse = {
        success: true,
        data: challenges,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get popular challenges error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_POPULAR_ERROR',
          message: 'Failed to retrieve popular challenges',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get challenges by category
   */
  static async getChallengesByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categories = await ChallengeService.getChallengesByCategory();

      const response: ApiResponse = {
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get challenges by category error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CATEGORIES_ERROR',
          message: 'Failed to retrieve challenge categories',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get challenge project structure
   */
  static async getChallengeProjectStructure(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const projectStructure = await ChallengeService.getChallengeProjectStructure(id);

      const response: ApiResponse = {
        success: true,
        data: projectStructure,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get challenge project structure error:', error);
      
      if (error instanceof Error && error.message === 'Challenge not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHALLENGE_NOT_FOUND',
            message: 'Challenge not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'GET_PROJECT_STRUCTURE_ERROR',
            message: 'Failed to retrieve challenge project structure',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }
}