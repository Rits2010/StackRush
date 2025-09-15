import { FocusSession, IFocusSession } from '../models/FocusSession';
import { PaginatedResult, FilterQuery } from '../types';
import { logger } from '../utils/logger';

export interface CreateFocusSessionDto {
  userId: string;
  challengeId: string;
  startTime: Date;
  endTime: Date;
  distractionsEncountered: number;
  focusScore: number;
  environment: 'zen' | 'standard' | 'interview';
}

export interface FocusSessionFilters extends FilterQuery {
  userId?: string;
  challengeId?: string;
  environment?: 'zen' | 'standard' | 'interview';
  minFocusScore?: number;
  maxFocusScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export class FocusSessionService {
  /**
   * Create a new focus session
   */
  static async createFocusSession(data: CreateFocusSessionDto): Promise<IFocusSession> {
    try {
      const focusSession = new FocusSession({
        user: data.userId,
        challenge: data.challengeId,
        startTime: data.startTime,
        endTime: data.endTime,
        distractionsEncountered: data.distractionsEncountered,
        focusScore: data.focusScore,
        environment: data.environment
      });

      await focusSession.save();

      logger.info('Focus session created', {
        focusSessionId: focusSession._id,
        userId: data.userId,
        challengeId: data.challengeId,
        focusScore: data.focusScore,
        environment: data.environment
      });

      return focusSession;
    } catch (error) {
      logger.error('Create focus session error:', error);
      throw error;
    }
  }

  /**
   * Get focus session by ID
   */
  static async getFocusSessionById(id: string): Promise<IFocusSession> {
    try {
      const focusSession = await FocusSession.findById(id)
        .populate('user', 'username profile.firstName profile.lastName')
        .populate('challenge', 'title slug difficulty');

      if (!focusSession) {
        throw new Error('Focus session not found');
      }

      return focusSession;
    } catch (error) {
      logger.error('Get focus session by ID error:', error);
      throw error;
    }
  }

  /**
   * Get user focus sessions with filters and pagination
   */
  static async getUserFocusSessions(
    userId: string,
    filters: FocusSessionFilters
  ): Promise<PaginatedResult<IFocusSession>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        challengeId,
        environment,
        minFocusScore,
        maxFocusScore,
        dateFrom,
        dateTo,
      } = filters;

      // Build query
      const query: any = { user: userId };

      if (challengeId) {
        query.challenge = challengeId;
      }

      if (environment) {
        query.environment = environment;
      }

      if (minFocusScore !== undefined || maxFocusScore !== undefined) {
        query.focusScore = {};
        if (minFocusScore !== undefined) query.focusScore.$gte = minFocusScore;
        if (maxFocusScore !== undefined) query.focusScore.$lte = maxFocusScore;
      }

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;

      // Execute query
      const [focusSessions, total] = await Promise.all([
        FocusSession.find(query)
          .populate('challenge', 'title slug difficulty')
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        FocusSession.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: focusSessions,
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
      logger.error('Get user focus sessions error:', error);
      throw error;
    }
  }

  /**
   * Get focus session statistics for a user
   */
  static async getUserFocusStats(userId: string): Promise<any> {
    try {
      const stats = await FocusSession.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            averageFocusScore: { $avg: '$focusScore' },
            bestFocusScore: { $max: '$focusScore' },
            totalDistractions: { $sum: '$distractionsEncountered' },
            environmentBreakdown: {
              $push: '$environment'
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalSessions: 0,
          averageFocusScore: 0,
          bestFocusScore: 0,
          totalDistractions: 0,
          environmentBreakdown: {}
        };
      }

      const result = stats[0];
      
      // Count environment usage
      const environmentBreakdown = result.environmentBreakdown.reduce((acc: any, env: string) => {
        acc[env] = (acc[env] || 0) + 1;
        return acc;
      }, {});

      return {
        totalSessions: result.totalSessions,
        averageFocusScore: Math.round((result.averageFocusScore || 0) * 100) / 100,
        bestFocusScore: result.bestFocusScore || 0,
        totalDistractions: result.totalDistractions || 0,
        environmentBreakdown
      };
    } catch (error) {
      logger.error('Get user focus stats error:', error);
      throw error;
    }
  }

  /**
   * Get recent focus sessions for a user
   */
  static async getRecentFocusSessions(userId: string, limit = 5): Promise<IFocusSession[]> {
    try {
      const focusSessions = await FocusSession.find({ user: userId })
        .populate('challenge', 'title slug difficulty')
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return focusSessions;
    } catch (error) {
      logger.error('Get recent focus sessions error:', error);
      throw error;
    }
  }

  /**
   * Delete focus session
   */
  static async deleteFocusSession(id: string, userId: string): Promise<void> {
    try {
      const focusSession = await FocusSession.findOne({ _id: id, user: userId });

      if (!focusSession) {
        throw new Error('Focus session not found or unauthorized');
      }

      await FocusSession.findByIdAndDelete(id);

      logger.info('Focus session deleted', {
        focusSessionId: id,
        userId,
      });
    } catch (error) {
      logger.error('Delete focus session error:', error);
      throw error;
    }
  }
}