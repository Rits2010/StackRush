import { Submission, ISubmission } from '../models/Submission';
import { Challenge } from '../models/Challenge';
import { User } from '../models/User';
import { UserService } from './UserService';
import { AchievementService } from './AchievementService';
import { PaginatedResult, FilterQuery } from '../types';
import { logger } from '../utils/logger';

export interface CreateSubmissionDto {
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  simulation?: {
    mode?: 'standard' | 'interview' | 'zen';
    distractionLevel?: 'low' | 'medium' | 'high';
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface ExecutionResults {
  status: 'completed' | 'failed' | 'timeout';
  score?: number;
  totalTests?: number;
  passedTests?: number;
  executionTime?: number;
  memoryUsage?: number;
  output?: string;
  error?: string;
  testResults?: Array<{
    testCase: string;
    passed: boolean;
    actualOutput?: string;
    executionTime?: number;
    error?: string;
  }>;
  browserEnvironment?: string;
}

export interface SubmissionFilters extends FilterQuery {
  userId?: string;
  challengeId?: string;
  language?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export class SubmissionService {
  /**
   * Create a new submission
   */
  static async createSubmission(data: CreateSubmissionDto): Promise<ISubmission> {
    try {
      // Verify user exists
      const user = await User.findById(data.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify challenge exists
      const challenge = await Challenge.findById(data.challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Create submission
      const submission = new Submission({
        user: data.userId,
        challenge: data.challengeId,
        code: data.code,
        language: data.language,
        simulation: {
          mode: data.simulation?.mode || 'standard',
          distractionLevel: data.simulation?.distractionLevel || 'medium',
        },
        metadata: {
          ipAddress: data.metadata?.ipAddress,
          userAgent: data.metadata?.userAgent,
          startedAt: new Date(),
          isCompleted: false,
        },
        execution: {
          status: 'pending',
          executedInBrowser: true,
          testResults: [],
        },
      });

      await submission.save();

      // Update user challenge stats
      await UserService.incrementChallengeStats(data.userId, false);

      // Update challenge stats
      await this.updateChallengeStats(challenge._id.toString(), false);

      logger.info('Submission created', {
        submissionId: submission._id,
        userId: data.userId,
        challengeId: data.challengeId,
        language: data.language,
      });

      return submission;
    } catch (error) {
      logger.error('Create submission error:', error);
      throw error;
    }
  }

  /**
   * Process execution results from frontend
   */
  static async processExecutionResults(
    submissionId: string,
    results: ExecutionResults
  ): Promise<ISubmission> {
    try {
      const submission = await Submission.findById(submissionId)
        .populate('challenge')
        .populate('user');

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Calculate score based on test results
      const score = await this.calculateScore(submission, results);

      // Update submission with results
      submission.execution = {
        ...submission.execution,
        status: results.status,
        score,
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        executionTime: results.executionTime,
        memoryUsage: results.memoryUsage,
        output: results.output,
        error: results.error,
        testResults: results.testResults?.map(tr => ({
          testCase: tr.testCase as any,
          passed: tr.passed,
          actualOutput: tr.actualOutput,
          executionTime: tr.executionTime,
          error: tr.error,
        })) || [],
        browserEnvironment: results.browserEnvironment,
      };

      submission.metadata.submittedAt = new Date();
      submission.metadata.isCompleted = true;

      await submission.save();

      // Check if submission was successful
      const isSuccessful = results.status === 'completed' && score >= 70; // 70% threshold

      if (isSuccessful) {
        // Update user stats
        await UserService.incrementChallengeStats(submission.user._id.toString(), true);
        await UserService.updateUserXP(submission.user._id.toString(), this.calculateXPReward(score));
        await UserService.updateUserStreak(submission.user._id.toString());

        // Update challenge stats
        await this.updateChallengeStats(submission.challenge._id.toString(), true, score, results.executionTime);

        // Check for achievements
        await AchievementService.checkSubmissionAchievements(
          submission.user._id.toString(),
          submission
        );
      }

      // Real-time notifications disabled

      logger.info('Submission processed', {
        submissionId: submission._id,
        userId: submission.user._id,
        challengeId: submission.challenge._id,
        score,
        status: results.status,
        successful: isSuccessful,
      });

      return submission;
    } catch (error) {
      logger.error('Process execution results error:', error);
      throw error;
    }
  }

  /**
   * Get submission by ID
   */
  static async getSubmissionById(id: string): Promise<ISubmission> {
    try {
      const submission = await Submission.findById(id)
        .populate('user', 'username profile.firstName profile.lastName')
        .populate('challenge', 'title slug difficulty type');

      if (!submission) {
        throw new Error('Submission not found');
      }

      return submission;
    } catch (error) {
      logger.error('Get submission by ID error:', error);
      throw error;
    }
  }

  /**
   * Get user submissions with filters and pagination
   */
  static async getUserSubmissions(
    userId: string,
    filters: SubmissionFilters
  ): Promise<PaginatedResult<ISubmission>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        challengeId,
        language,
        status,
        minScore,
        maxScore,
        dateFrom,
        dateTo,
      } = filters;

      // Build query
      const query: any = { user: userId };

      if (challengeId) {
        query.challenge = challengeId;
      }

      if (language) {
        query.language = language;
      }

      if (status) {
        query['execution.status'] = status;
      }

      if (minScore !== undefined || maxScore !== undefined) {
        query['execution.score'] = {};
        if (minScore !== undefined) query['execution.score'].$gte = minScore;
        if (maxScore !== undefined) query['execution.score'].$lte = maxScore;
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
      const [submissions, total] = await Promise.all([
        Submission.find(query)
          .populate('challenge', 'title slug difficulty type')
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        Submission.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: submissions,
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
      logger.error('Get user submissions error:', error);
      throw error;
    }
  }

  /**
   * Get challenge submissions (for admins/challenge authors)
   */
  static async getChallengeSubmissions(
    challengeId: string,
    filters: SubmissionFilters
  ): Promise<PaginatedResult<ISubmission>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        language,
        status,
        minScore,
        maxScore,
      } = filters;

      // Build query
      const query: any = { challenge: challengeId };

      if (language) {
        query.language = language;
      }

      if (status) {
        query['execution.status'] = status;
      }

      if (minScore !== undefined || maxScore !== undefined) {
        query['execution.score'] = {};
        if (minScore !== undefined) query['execution.score'].$gte = minScore;
        if (maxScore !== undefined) query['execution.score'].$lte = maxScore;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;

      // Execute query
      const [submissions, total] = await Promise.all([
        Submission.find(query)
          .populate('user', 'username profile.firstName profile.lastName')
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        Submission.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: submissions,
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
      logger.error('Get challenge submissions error:', error);
      throw error;
    }
  }

  /**
   * Calculate score based on test results
   */
  static async calculateScore(
    submission: ISubmission,
    results: ExecutionResults
  ): Promise<number> {
    try {
      if (results.status !== 'completed' || !results.totalTests || results.totalTests === 0) {
        return 0;
      }

      const passedTests = results.passedTests || 0;
      const baseScore = (passedTests / results.totalTests) * 100;

      // Apply time bonus/penalty (optional)
      let timeMultiplier = 1;
      if (results.executionTime && submission.challenge) {
        const challenge = submission.challenge as any;
        if (challenge.timeLimit) {
          const timeUsedRatio = results.executionTime / (challenge.timeLimit * 60 * 1000);
          if (timeUsedRatio < 0.5) {
            timeMultiplier = 1.1; // 10% bonus for fast completion
          } else if (timeUsedRatio > 0.9) {
            timeMultiplier = 0.9; // 10% penalty for slow completion
          }
        }
      }

      const finalScore = Math.min(100, Math.round(baseScore * timeMultiplier));
      return finalScore;
    } catch (error) {
      logger.error('Calculate score error:', error);
      return 0;
    }
  }

  /**
   * Calculate XP reward based on score
   */
  private static calculateXPReward(score: number): number {
    if (score >= 90) return 100;
    if (score >= 80) return 75;
    if (score >= 70) return 50;
    if (score >= 60) return 25;
    return 10;
  }

  /**
   * Get submission statistics for a user
   */
  static async getUserSubmissionStats(userId: string): Promise<any> {
    try {
      const stats = await Submission.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            completedSubmissions: {
              $sum: { $cond: [{ $eq: ['$execution.status', 'completed'] }, 1, 0] }
            },
            averageScore: { $avg: '$execution.score' },
            bestScore: { $max: '$execution.score' },
            totalExecutionTime: { $sum: '$execution.executionTime' },
            languageBreakdown: {
              $push: '$language'
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalSubmissions: 0,
          completedSubmissions: 0,
          completionRate: 0,
          averageScore: 0,
          bestScore: 0,
          totalExecutionTime: 0,
          languageBreakdown: {}
        };
      }

      const result = stats[0];
      const completionRate = result.totalSubmissions > 0 
        ? (result.completedSubmissions / result.totalSubmissions) * 100 
        : 0;

      // Count language usage
      const languageBreakdown = result.languageBreakdown.reduce((acc: any, lang: string) => {
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {});

      return {
        totalSubmissions: result.totalSubmissions,
        completedSubmissions: result.completedSubmissions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: Math.round((result.averageScore || 0) * 100) / 100,
        bestScore: result.bestScore || 0,
        totalExecutionTime: result.totalExecutionTime || 0,
        languageBreakdown
      };
    } catch (error) {
      logger.error('Get user submission stats error:', error);
      throw error;
    }
  }

  /**
   * Get recent submissions for a user
   */
  static async getRecentSubmissions(userId: string, limit = 5): Promise<ISubmission[]> {
    try {
      const submissions = await Submission.find({ user: userId })
        .populate('challenge', 'title slug difficulty type')
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return submissions;
    } catch (error) {
      logger.error('Get recent submissions error:', error);
      throw error;
    }
  }

  /**
   * Delete submission (soft delete by marking as inactive)
   */
  static async deleteSubmission(id: string, userId: string): Promise<void> {
    try {
      const submission = await Submission.findOne({ _id: id, user: userId });

      if (!submission) {
        throw new Error('Submission not found or unauthorized');
      }

      // For now, we'll actually delete the submission
      // In production, you might want to soft delete
      await Submission.findByIdAndDelete(id);

      logger.info('Submission deleted', {
        submissionId: id,
        userId,
      });
    } catch (error) {
      logger.error('Delete submission error:', error);
      throw error;
    }
  }

  /**
   * Update challenge statistics
   */
  private static async updateChallengeStats(
    challengeId: string,
    isSuccessful: boolean,
    score?: number,
    executionTime?: number
  ): Promise<void> {
    try {
      const updateQuery: any = {
        $inc: {
          'stats.totalAttempts': 1
        }
      };

      if (isSuccessful) {
        updateQuery.$inc['stats.successfulAttempts'] = 1;
        
        if (score !== undefined) {
          // For average score calculation, we'd need to implement a proper aggregation
          // For now, just log it
          logger.info('Challenge completed with score', { challengeId, score });
        }
        
        if (executionTime !== undefined) {
          logger.info('Challenge completed with execution time', { challengeId, executionTime });
        }
      }

      await Challenge.findByIdAndUpdate(challengeId, updateQuery);
    } catch (error) {
      logger.error('Update challenge stats error:', error);
      // Don't throw - this shouldn't break submission processing
    }
  }
}