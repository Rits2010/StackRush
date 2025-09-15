import { Response } from 'express';
import { Achievement, UserAchievement } from '../models/Achievement';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

export default class AchievementController {
  /**
   * Get all achievements
   */
  static async getAllAchievements(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const achievements = await Achievement.find({ isActive: true });
      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      logger.error('Get all achievements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch achievements'
      });
    }
  }

  /**
   * Get achievement by ID
   */
  static async getAchievement(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const achievement = await Achievement.findById(req.params.id);
      
      if (!achievement) {
        return res.status(404).json({
          success: false,
          error: 'Achievement not found'
        });
      }

      res.json({
        success: true,
        data: achievement
      });
    } catch (error) {
      logger.error('Get achievement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch achievement'
      });
    }
  }

  /**
   * Get user's achievements
   */
  static async getUserAchievements(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const user = req.user;
      const userAchievements = await UserAchievement.find({ user: user._id })
        .populate('achievement')
        .sort({ unlockedAt: -1 });

      return res.json({
        success: true,
        data: userAchievements
      });
    } catch (error) {
      logger.error('Get user achievements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user achievements'
      });
    }
  }

  /**
   * Check for new achievements
   */
  static async checkForNewAchievements(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const newAchievements: any[] = []; // This would be populated by your achievement service
      
      // In a real app, you would check user's progress against achievement criteria
      // and award new achievements as needed
      
      return res.json({
        success: true,
        data: {
          newAchievements,
          totalAchievements: 0, // Total count of user's achievements
          unlockedCount: 0,     // Count of unlocked achievements
          lockedCount: 0        // Count of locked achievements
        }
      });
    } catch (error) {
      logger.error('Check for new achievements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check for new achievements'
      });
    }
  }

  /**
   * Create a new achievement (Admin only)
   */
  static async createAchievement(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const achievement = new Achievement(req.body);
      await achievement.save();
      
      res.status(201).json({
        success: true,
        data: achievement
      });
    } catch (error) {
      logger.error('Create achievement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create achievement'
      });
    }
  }

  /**
   * Update an achievement (Admin only)
   */
  static async updateAchievement(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const achievement = await Achievement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!achievement) {
        return res.status(404).json({
          success: false,
          error: 'Achievement not found'
        });
      }

      res.json({
        success: true,
        data: achievement
      });
    } catch (error) {
      logger.error('Update achievement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update achievement'
      });
    }
  }

  /**
   * Delete an achievement (Admin only)
   */
  static async deleteAchievement(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const achievement = await Achievement.findByIdAndDelete(req.params.id);
      
      if (!achievement) {
        return res.status(404).json({
          success: false,
          error: 'Achievement not found'
        });
      }

      // Also remove any user achievements associated with this achievement
      await UserAchievement.deleteMany({ achievement: achievement._id });

      res.json({
        success: true,
        data: {}
      });
    } catch (error) {
      logger.error('Delete achievement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete achievement'
      });
    }
  }
}
