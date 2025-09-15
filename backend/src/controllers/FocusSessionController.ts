import { Response } from 'express';
import { FocusSessionService } from '../services/FocusSessionService';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export class FocusSessionController {
  /**
   * Create a new focus session
   */
  static async createFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionData = req.body;

      const focusSession = await FocusSessionService.createFocusSession({
        userId,
        ...sessionData
      });

      const response: ApiResponse = {
        success: true,
        data: focusSession,
        message: 'Focus session created successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create focus session error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_FOCUS_SESSION_ERROR',
          message: 'Failed to create focus session',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get user focus sessions
   */
  static async getUserFocusSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const filters = req.query as any;

      const result = await FocusSessionService.getUserFocusSessions(userId, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user focus sessions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_FOCUS_SESSIONS_ERROR',
          message: 'Failed to retrieve focus sessions',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get focus session by ID
   */
  static async getFocusSessionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const focusSession = await FocusSessionService.getFocusSessionById(id);

      // Check if user owns this session
      if (focusSession.user.toString() !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You do not have permission to access this focus session',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: focusSession,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get focus session by ID error:', error);
      
      if (error instanceof Error && error.message === 'Focus session not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'FOCUS_SESSION_NOT_FOUND',
            message: 'Focus session not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'GET_FOCUS_SESSION_ERROR',
            message: 'Failed to retrieve focus session',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Get user focus statistics
   */
  static async getUserFocusStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await FocusSessionService.getUserFocusStats(userId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user focus stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_FOCUS_STATS_ERROR',
          message: 'Failed to retrieve focus statistics',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get recent focus sessions
   */
  static async getRecentFocusSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { limit = 5 } = req.query as any;

      const focusSessions = await FocusSessionService.getRecentFocusSessions(userId, parseInt(limit));

      const response: ApiResponse = {
        success: true,
        data: focusSessions,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get recent focus sessions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_RECENT_FOCUS_SESSIONS_ERROR',
          message: 'Failed to retrieve recent focus sessions',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Delete focus session
   */
  static async deleteFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await FocusSessionService.deleteFocusSession(id, userId);

      const response: ApiResponse = {
        success: true,
        message: 'Focus session deleted successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Delete focus session error:', error);
      
      if (error instanceof Error && error.message === 'Focus session not found or unauthorized') {
        res.status(404).json({
          success: false,
          error: {
            code: 'FOCUS_SESSION_NOT_FOUND',
            message: 'Focus session not found or unauthorized',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FOCUS_SESSION_ERROR',
            message: 'Failed to delete focus session',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }
}