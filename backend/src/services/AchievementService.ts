import { Achievement, UserAchievement, IAchievement, IUserAchievement } from '../models/Achievement';
import { User } from '../models/User';
import { Submission } from '../models/Submission';
import { UserService } from './UserService';
import { NotificationService } from './NotificationService';
import { logger } from '../utils/logger';

export interface CreateAchievementDto {
  name: string;
  description: string;
  icon: string;
  category: 'beginner' | 'performance' | 'consistency' | 'social';
  criteria: {
    type: 'challenge_count' | 'streak' | 'score' | 'time' | 'special';
    target: number;
    conditions?: any;
  };
  rewards: {
    xp: number;
    badge: string;
    title: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class AchievementService {
  /**
   * Create a new achievement
   */
  static async createAchievement(data: CreateAchievementDto): Promise<IAchievement> {
    try {
      const achievement = new Achievement(data);
      await achievement.save();

      logger.info('Achievement created', {
        achievementId: achievement._id,
        name: achievement.name,
        category: achievement.category,
      });

      return achievement;
    } catch (error) {
      logger.error('Create achievement error:', error);
      throw error;
    }
  }

  /**
   * Get all achievements
   */
  static async getAchievements(filters: any = {}): Promise<IAchievement[]> {
    try {
      const query = { isActive: true, ...filters };
      const achievements = await Achievement.find(query).sort({ createdAt: -1 });
      return achievements;
    } catch (error) {
      logger.error('Get achievements error:', error);
      throw error;
    }
  }

  /**
   * Get achievement by ID
   */
  static async getAchievementById(id: string): Promise<IAchievement> {
    try {
      const achievement = await Achievement.findById(id);
      if (!achievement) {
        throw new Error('Achievement not found');
      }
      return achievement;
    } catch (error) {
      logger.error('Get achievement by ID error:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId: string): Promise<IUserAchievement[]> {
    try {
      const userAchievements = await UserAchievement.find({ user: userId })
        .populate('achievement')
        .sort({ unlockedAt: -1 });

      return userAchievements;
    } catch (error) {
      logger.error('Get user achievements error:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific achievement
   */
  static async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      const userAchievement = await UserAchievement.findOne({
        user: userId,
        achievement: achievementId,
      });
      return !!userAchievement;
    } catch (error) {
      logger.error('Check achievement error:', error);
      return false;
    }
  }

  /**
   * Unlock achievement for user
   */
  static async unlockAchievement(
    userId: string,
    achievementId: string,
    metadata?: any
  ): Promise<IUserAchievement | null> {
    try {
      // Check if user already has this achievement
      const hasAchievement = await this.hasAchievement(userId, achievementId);
      if (hasAchievement) {
        return null;
      }

      // Get achievement details
      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Create user achievement record
      const userAchievement = new UserAchievement({
        user: userId,
        achievement: achievementId,
        unlockedAt: new Date(),
        metadata,
      });

      await userAchievement.save();

      // Award XP to user
      await UserService.updateUserXP(userId, achievement.rewards.xp);

      // Real-time notifications disabled

      // Create notification
      await NotificationService.createNotification({
        recipient: userId,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `You've unlocked the "${achievement.name}" achievement!`,
        data: {
          achievementId: achievement._id,
          achievementName: achievement.name,
          xpReward: achievement.rewards.xp,
        },
        priority: 'high',
        channels: ['email'],
      });

      logger.info('Achievement unlocked', {
        userId,
        achievementId,
        achievementName: achievement.name,
        xpReward: achievement.rewards.xp,
      });

      return userAchievement;
    } catch (error) {
      logger.error('Unlock achievement error:', error);
      throw error;
    }
  }

  /**
   * Check submission-related achievements
   */
  static async checkSubmissionAchievements(userId: string, submission: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Get user's submission stats
      const submissionStats = await this.getUserSubmissionStats(userId);

      // Check various achievement criteria
      await Promise.all([
        this.checkFirstSubmissionAchievement(userId, submissionStats),
        this.checkSubmissionCountAchievements(userId, submissionStats),
        this.checkPerfectScoreAchievements(userId, submission),
        this.checkStreakAchievements(userId, user.stats.streak),
        this.checkLanguageAchievements(userId, submission.language),
        this.checkSpeedAchievements(userId, submission),
      ]);
    } catch (error) {
      logger.error('Check submission achievements error:', error);
    }
  }

  /**
   * Check level-based achievements
   */
  static async checkLevelAchievements(userId: string, newLevel: number): Promise<void> {
    try {
      const levelAchievements = await Achievement.find({
        category: 'beginner',
        'criteria.type': 'special',
        'criteria.conditions.levelRequired': { $lte: newLevel },
        isActive: true,
      });

      for (const achievement of levelAchievements) {
        const hasAchievement = await this.hasAchievement(userId, achievement._id.toString());
        if (!hasAchievement) {
          await this.unlockAchievement(userId, achievement._id.toString(), {
            levelAchieved: newLevel,
          });
        }
      }
    } catch (error) {
      logger.error('Check level achievements error:', error);
    }
  }

  /**
   * Check first submission achievement
   */
  private static async checkFirstSubmissionAchievement(
    userId: string,
    stats: any
  ): Promise<void> {
    if (stats.totalSubmissions === 1) {
      const achievement = await Achievement.findOne({
        name: 'First Steps',
        isActive: true,
      });

      if (achievement) {
        await this.unlockAchievement(userId, achievement._id.toString());
      }
    }
  }

  /**
   * Check submission count achievements
   */
  private static async checkSubmissionCountAchievements(
    userId: string,
    stats: any
  ): Promise<void> {
    const milestones = [10, 50, 100, 500, 1000];
    
    for (const milestone of milestones) {
      if (stats.completedSubmissions >= milestone) {
        const achievement = await Achievement.findOne({
          'criteria.type': 'challenge_count',
          'criteria.target': milestone,
          isActive: true,
        });

        if (achievement) {
          const hasAchievement = await this.hasAchievement(userId, achievement._id.toString());
          if (!hasAchievement) {
            await this.unlockAchievement(userId, achievement._id.toString(), {
              completedChallenges: stats.completedSubmissions,
            });
          }
        }
      }
    }
  }

  /**
   * Check perfect score achievements
   */
  private static async checkPerfectScoreAchievements(
    userId: string,
    submission: any
  ): Promise<void> {
    if (submission.execution?.score === 100) {
      const achievement = await Achievement.findOne({
        name: 'Perfect Score',
        isActive: true,
      });

      if (achievement) {
        const hasAchievement = await this.hasAchievement(userId, achievement._id.toString());
        if (!hasAchievement) {
          await this.unlockAchievement(userId, achievement._id.toString(), {
            challengeId: submission.challenge,
            score: submission.execution.score,
          });
        }
      }
    }
  }

  /**
   * Check streak achievements
   */
  private static async checkStreakAchievements(userId: string, streak: number): Promise<void> {
    const streakMilestones = [7, 30, 100];
    
    for (const milestone of streakMilestones) {
      if (streak >= milestone) {
        const achievement = await Achievement.findOne({
          'criteria.type': 'streak',
          'criteria.target': milestone,
          isActive: true,
        });

        if (achievement) {
          const hasAchievement = await this.hasAchievement(userId, achievement._id.toString());
          if (!hasAchievement) {
            await this.unlockAchievement(userId, achievement._id.toString(), {
              streakAchieved: streak,
            });
          }
        }
      }
    }
  }

  /**
   * Check language-specific achievements
   */
  private static async checkLanguageAchievements(
    userId: string,
    language: string
  ): Promise<void> {
    const languageSubmissions = await Submission.countDocuments({
      user: userId,
      language,
      'execution.status': 'completed',
    });

    if (languageSubmissions >= 10) {
      const achievement = await Achievement.findOne({
        name: `${language.charAt(0).toUpperCase() + language.slice(1)} Master`,
        isActive: true,
      });

      if (achievement) {
        const hasAchievement = await this.hasAchievement(userId, achievement._id.toString());
        if (!hasAchievement) {
          await this.unlockAchievement(userId, achievement._id.toString(), {
            language,
            submissionCount: languageSubmissions,
          });
        }
      }
    }
  }

  /**
   * Check speed achievements
   */
  private static async checkSpeedAchievements(userId: string, submission: any): Promise<void> {
    if (submission.execution?.executionTime && submission.execution.executionTime < 1000) {
      const achievement = await Achievement.findOne({
        name: 'Speed Demon',
        isActive: true,
      });

      if (achievement) {
        const hasAchievement = await this.hasAchievement(userId, achievement._id.toString());
        if (!hasAchievement) {
          await this.unlockAchievement(userId, achievement._id.toString(), {
            executionTime: submission.execution.executionTime,
            challengeId: submission.challenge,
          });
        }
      }
    }
  }

  /**
   * Get user submission stats for achievement checking
   */
  private static async getUserSubmissionStats(userId: string): Promise<any> {
    const stats = await Submission.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          completedSubmissions: {
            $sum: { $cond: [{ $eq: ['$execution.status', 'completed'] }, 1, 0] }
          },
          perfectScores: {
            $sum: { $cond: [{ $eq: ['$execution.score', 100] }, 1, 0] }
          },
          averageScore: { $avg: '$execution.score' },
        }
      }
    ]);

    return stats[0] || {
      totalSubmissions: 0,
      completedSubmissions: 0,
      perfectScores: 0,
      averageScore: 0,
    };
  }

  /**
   * Get achievement leaderboard
   */
  static async getAchievementLeaderboard(limit = 10): Promise<any[]> {
    try {
      const leaderboard = await UserAchievement.aggregate([
        {
          $group: {
            _id: '$user',
            achievementCount: { $sum: 1 },
            totalXP: { $sum: '$achievement.rewards.xp' },
            latestAchievement: { $max: '$unlockedAt' },
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            username: '$user.username',
            profile: '$user.profile',
            achievementCount: 1,
            totalXP: 1,
            latestAchievement: 1,
          }
        },
        { $sort: { achievementCount: -1, totalXP: -1 } },
        { $limit: limit },
      ]);

      return leaderboard;
    } catch (error) {
      logger.error('Get achievement leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Initialize default achievements
   */
  static async initializeDefaultAchievements(): Promise<void> {
    try {
      const defaultAchievements = [
        {
          name: 'First Steps',
          description: 'Complete your first coding challenge',
          icon: '🎯',
          category: 'beginner',
          criteria: { type: 'special', target: 1, conditions: { firstSubmission: true } },
          rewards: { xp: 50, badge: 'first-steps', title: 'Newcomer' },
          rarity: 'common',
        },
        {
          name: 'Perfect Score',
          description: 'Achieve a perfect score on any challenge',
          icon: '💯',
          category: 'performance',
          criteria: { type: 'score', target: 100, conditions: {} },
          rewards: { xp: 100, badge: 'perfect-score', title: 'Perfectionist' },
          rarity: 'rare',
        },
        {
          name: 'Challenge Conqueror',
          description: 'Complete 10 coding challenges',
          icon: '🏆',
          category: 'consistency',
          criteria: { type: 'challenge_count', target: 10, conditions: {} },
          rewards: { xp: 200, badge: 'conqueror', title: 'Conqueror' },
          rarity: 'rare',
        },
        {
          name: 'Week Warrior',
          description: 'Maintain a 7-day coding streak',
          icon: '🔥',
          category: 'consistency',
          criteria: { type: 'streak', target: 7, conditions: {} },
          rewards: { xp: 150, badge: 'week-warrior', title: 'Consistent Coder' },
          rarity: 'rare',
        },
        {
          name: 'Speed Demon',
          description: 'Complete a challenge in under 1 second',
          icon: '⚡',
          category: 'performance',
          criteria: { type: 'time', target: 1000, conditions: { executionTime: true } },
          rewards: { xp: 75, badge: 'speed-demon', title: 'Speed Demon' },
          rarity: 'epic',
        },
      ];

      for (const achievementData of defaultAchievements) {
        const existing = await Achievement.findOne({ name: achievementData.name });
        if (!existing) {
          await this.createAchievement(achievementData as CreateAchievementDto);
        }
      }

      logger.info('Default achievements initialized');
    } catch (error) {
      logger.error('Initialize default achievements error:', error);
    }
  }
}