import { Response } from 'express';
import { UserService } from '../services/UserService';
import { SubmissionService } from '../services/SubmissionService';
import { FocusSessionService } from '../services/FocusSessionService';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export class UserController {
  /**
   * Get current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await UserService.getUserById(userId);

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updates = req.body;

      const user = await UserService.updateProfile(userId, updates);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update profile error:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_PROFILE_ERROR',
            message: 'Failed to update profile',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      // Check privacy settings
      if (!user.preferences.privacy.profilePublic && req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'PROFILE_PRIVATE',
            message: 'This profile is private',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const user = await UserService.getUserByUsername(username);

      // Check privacy settings
      if (!user.preferences.privacy.profilePublic && req.user?.id !== user._id.toString()) {
        res.status(403).json({
          success: false,
          error: {
            code: 'PROFILE_PRIVATE',
            message: 'This profile is private',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user by username error:', error);
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      // Check privacy settings
      if (!user.preferences.privacy.showStats && req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'STATS_PRIVATE',
            message: 'User statistics are private',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const stats = await UserService.getUserStats(id);

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const preferences = req.body;

      await UserService.updatePreferences(userId, preferences);

      const response: ApiResponse = {
        success: true,
        message: 'Preferences updated successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update preferences error:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_PREFERENCES_ERROR',
            message: 'Failed to update preferences',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Get users list (admin only)
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = req.query as any;
      const result = await UserService.getUsers(filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USERS_ERROR',
          message: 'Failed to retrieve users',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await UserService.deleteAccount(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Account deleted successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Delete account error:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_ACCOUNT_ERROR',
            message: 'Failed to delete account',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type = 'xp', limit = 10 } = req.query as any;
      const users = await UserService.getLeaderboard(type, parseInt(limit));

      const response: ApiResponse = {
        success: true,
        data: users,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get leaderboard error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LEADERBOARD_ERROR',
          message: 'Failed to retrieve leaderboard',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Get user dashboard data including focus sessions
   */
  static async getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Log the user ID for debugging
      logger.debug('Dashboard request for user ID:', userId);
      
      // Get user profile
      const user = await UserService.getUserById(userId);
      
      // Get user stats
      const userStats = await UserService.getUserStats(userId);
      
      // Get user submission stats
      const submissionStats = await SubmissionService.getUserSubmissionStats(userId);
      
      // Get focus session stats
      const focusStats = await FocusSessionService.getUserFocusStats(userId);
      
      // Get recent focus sessions
      const recentFocusSessions = await FocusSessionService.getRecentFocusSessions(userId, 5);
      
      // Get recent submissions
      const recentSubmissions = await SubmissionService.getRecentSubmissions(userId, 5);
      
      const dashboardData = {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          roles: user.roles,
          preferences: user.preferences,
          stats: user.stats,
          createdAt: user.createdAt,
        },
        statistics: {
          user: userStats,
          submissions: submissionStats,
          focus: focusStats,
        },
        recentActivity: {
          focusSessions: recentFocusSessions,
          submissions: recentSubmissions,
        }
      };

      const response: ApiResponse = {
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get dashboard data error:', error);
      
      // Check if it's a user not found error
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'DASHBOARD_ERROR',
            message: 'Failed to retrieve dashboard data',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      }
    }
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await UserService.getPlatformStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get platform stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PLATFORM_STATS_ERROR',
          message: 'Failed to retrieve platform statistics',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }
}