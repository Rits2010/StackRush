import { User, IUser } from '../models/User';
import { UserStats, UserPreferences, PaginatedResult, FilterQuery } from '../types';
import { logger } from '../utils/logger';

export interface UpdateProfileDto {
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface UserFilters extends FilterQuery {
  level?: number;
  minXp?: number;
  maxXp?: number;
  roles?: string[];
  isActive?: boolean;
  emailVerified?: boolean;
}

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<IUser> {
    try {
      // Log the ID we're searching for
      logger.debug('Searching for user with ID:', id);
      
      const user = await User.findById(id);
      
      // Log the result of the database query
      logger.debug('Database query result for user in UserService:', { 
        userId: id, 
        userFound: !!user
      });
      
      if (!user) {
        logger.warn('User not found with ID:', id);
        throw new Error('User not found');
      }

      logger.debug('User found:', { id: user._id, username: user.username });
      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<IUser> {
    try {
      const user = await User.findOne({ 
        username,
        isActive: true 
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by username error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(id: string, updates: UpdateProfileDto): Promise<IUser> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update profile fields
      if (updates.profile) {
        Object.keys(updates.profile).forEach(key => {
          if (updates.profile![key as keyof typeof updates.profile] !== undefined) {
            user.profile[key as keyof typeof user.profile] = updates.profile![key as keyof typeof updates.profile] as any;
          }
        });
      }

      await user.save();

      logger.info('User profile updated', {
        userId: user._id,
        updatedFields: Object.keys(updates.profile || {}),
      });

      return user;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(id: string): Promise<UserStats> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Calculate additional stats
      const completionRate = user.stats.totalChallenges > 0 
        ? (user.stats.completedChallenges / user.stats.totalChallenges) * 100 
        : 0;

      // TODO: Calculate average score from submissions
      const averageScore = 0; // This will be implemented when we have submissions

      const stats: UserStats = {
        level: user.stats.level,
        xp: user.stats.xp,
        totalChallenges: user.stats.totalChallenges,
        completedChallenges: user.stats.completedChallenges,
        streak: user.stats.streak,
        lastActiveDate: user.stats.lastActiveDate,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore,
      };

      return stats;
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update preferences
      if (preferences.theme) {
        user.preferences.theme = preferences.theme;
      }

      if (preferences.notifications) {
        Object.assign(user.preferences.notifications, preferences.notifications);
      }

      if (preferences.privacy) {
        Object.assign(user.preferences.privacy, preferences.privacy);
      }

      await user.save();

      logger.info('User preferences updated', {
        userId: user._id,
        updatedPreferences: Object.keys(preferences),
      });
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Get users with filters and pagination
   */
  static async getUsers(filters: UserFilters): Promise<PaginatedResult<IUser>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search,
        level,
        minXp,
        maxXp,
        roles,
        isActive,
        emailVerified,
      } = filters;

      // Build query
      const query: any = {};

      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
        ];
      }

      if (level !== undefined) {
        query['stats.level'] = level;
      }

      if (minXp !== undefined || maxXp !== undefined) {
        query['stats.xp'] = {};
        if (minXp !== undefined) query['stats.xp'].$gte = minXp;
        if (maxXp !== undefined) query['stats.xp'].$lte = maxXp;
      }

      if (roles && roles.length > 0) {
        query.roles = { $in: roles };
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (emailVerified !== undefined) {
        query.emailVerified = emailVerified;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;

      // Execute query
      const [users, total] = await Promise.all([
        User.find(query)
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        User.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Get users error:', error);
      throw error;
    }
  }

  /**
   * Update user XP and level
   */
  static async updateUserXP(id: string, xpGained: number): Promise<void> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const oldXp = user.stats.xp;
      const oldLevel = user.stats.level;
      
      user.stats.xp += xpGained;
      
      // Calculate new level (simple formula: level = floor(xp / 1000) + 1)
      const newLevel = Math.floor(user.stats.xp / 1000) + 1;
      user.stats.level = newLevel;

      await user.save();

      logger.info('User XP updated', {
        userId: user._id,
        xpGained,
        oldXp,
        newXp: user.stats.xp,
        oldLevel,
        newLevel,
        levelUp: newLevel > oldLevel,
      });

      // TODO: Trigger achievement check if level increased
      if (newLevel > oldLevel) {
        // await AchievementService.checkLevelAchievements(id, newLevel);
      }
    } catch (error) {
      logger.error('Update user XP error:', error);
      throw error;
    }
  }

  /**
   * Update user streak
   */
  static async updateUserStreak(id: string): Promise<void> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      const lastActive = new Date(user.stats.lastActiveDate);
      
      // Check if last active was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isConsecutiveDay = 
        lastActive.toDateString() === yesterday.toDateString();

      if (isConsecutiveDay) {
        user.stats.streak += 1;
      } else if (lastActive.toDateString() !== today.toDateString()) {
        // Reset streak if not consecutive and not today
        user.stats.streak = 1;
      }

      user.stats.lastActiveDate = today;
      await user.save();

      logger.info('User streak updated', {
        userId: user._id,
        streak: user.stats.streak,
        isConsecutiveDay,
      });
    } catch (error) {
      logger.error('Update user streak error:', error);
      throw error;
    }
  }

  /**
   * Increment user challenge stats
   */
  static async incrementChallengeStats(id: string, completed: boolean = false): Promise<void> {
    try {
      const updateQuery: any = {
        $inc: { 'stats.totalChallenges': 1 }
      };

      if (completed) {
        updateQuery.$inc['stats.completedChallenges'] = 1;
      }

      await User.findByIdAndUpdate(id, updateQuery);

      logger.info('User challenge stats updated', {
        userId: id,
        completed,
      });
    } catch (error) {
      logger.error('Increment challenge stats error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(id: string): Promise<void> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete by setting isActive to false
      user.isActive = false;
      await user.save();

      // TODO: Clean up user data (submissions, achievements, etc.)
      // This should be done in a background job

      logger.info('User account deleted', {
        userId: user._id,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    type: 'xp' | 'level' | 'streak' | 'completed' = 'xp',
    limit: number = 10
  ): Promise<IUser[]> {
    try {
      let sortField: string;
      
      switch (type) {
        case 'xp':
          sortField = 'stats.xp';
          break;
        case 'level':
          sortField = 'stats.level';
          break;
        case 'streak':
          sortField = 'stats.streak';
          break;
        case 'completed':
          sortField = 'stats.completedChallenges';
          break;
        default:
          sortField = 'stats.xp';
      }

      const users = await User.find({
        isActive: true,
        'preferences.privacy.showStats': true,
      })
        .sort({ [sortField]: -1 })
        .limit(limit)
        .select('username profile.firstName profile.lastName profile.avatar stats')
        .exec();

      return users;
    } catch (error) {
      logger.error('Get leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Get general platform statistics
   */
  static async getPlatformStats(): Promise<any> {
    try {
      // Get total active users
      const totalUsers = await User.countDocuments({ isActive: true });
      
      // Get users with completed challenges
      const usersWithCompletedChallenges = await User.countDocuments({ 
        isActive: true, 
        'stats.completedChallenges': { $gt: 0 } 
      });
      
      // Calculate success rate (users with completed challenges / total users)
      const successRate = totalUsers > 0 ? Math.round((usersWithCompletedChallenges / totalUsers) * 10000) / 100 : 0;
      
      // Get average focus rating from focus sessions
      // For now, we'll use a placeholder value since we don't have focus sessions implemented
      const avgFocusRating = 85; // Placeholder value
      
      return {
        totalUsers,
        successRate,
        avgFocusRating
      };
    } catch (error) {
      logger.error('Get platform stats error:', error);
      throw error;
    }
  }
}