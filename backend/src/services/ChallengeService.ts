import { Challenge, IChallenge } from '../models/Challenge';
import { ChallengeFilters, PaginatedResult, ChallengeStats } from '../types';
import { logger } from '../utils/logger';

export interface CreateChallengeDto {
  title: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags?: string[];
  timeLimit?: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution: string;
    solutionExplanation: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
      python?: string;
      java?: string;
      cpp?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden?: boolean;
      weight?: number;
    }>;
    validationRules?: {
      timeComplexity?: string;
      spaceComplexity?: string;
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background?: string;
    role?: string;
    company?: string;
    urgency?: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  isPublic?: boolean;
}

export interface UpdateChallengeDto extends Partial<CreateChallengeDto> {
  slug?: string;
  isActive?: boolean;
}

export interface SessionData {
  challengeId: string;
  userId: string;
  startedAt: Date;
  timeLimit?: number;
  sessionToken: string;
}

export class ChallengeService {
  /**
   * Get challenges with filters and pagination
   */
  static async getChallenges(filters: ChallengeFilters): Promise<PaginatedResult<IChallenge>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search,
        type,
        difficulty,
        category,
        tags,
        timeLimit,
        author,
      } = filters;

      // Build query
      const query: any = {
        isPublic: true,
        isActive: true,
      };

      if (search) {
        // Use text search if search term provided
        query.$text = { $search: search };
      }

      if (type) {
        query.type = type;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }

      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (timeLimit) {
        query.timeLimit = { $lte: timeLimit };
      }

      if (author) {
        query.author = author;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;

      // Build sort object
      let sortObj: any = {};
      if (search) {
        sortObj = { score: { $meta: 'textScore' } };
      } else {
        sortObj[sort] = sortOrder;
      }

      // Execute query
      const [challenges, total] = await Promise.all([
        Challenge.find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .populate('author', 'username profile.firstName profile.lastName')
          .exec(),
        Challenge.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: challenges,
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
      logger.error('Get challenges error:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   */
  static async getChallengeById(id: string, userId?: string): Promise<IChallenge> {
    try {
      const challenge = await Challenge.findById(id)
        .populate('author', 'username profile.firstName profile.lastName')
        .exec();

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (!challenge.isPublic || !challenge.isActive) {
        // Only author and admins can see inactive/private challenges
        if (!userId || challenge.author._id.toString() !== userId) {
          throw new Error('Challenge not found');
        }
      }

      return challenge;
    } catch (error) {
      logger.error('Get challenge by ID error:', error);
      throw error;
    }
  }

  /**
   * Get challenge by slug
   */
  static async getChallengeBySlug(slug: string, userId?: string): Promise<IChallenge> {
    try {
      const challenge = await Challenge.findOne({ slug })
        .populate('author', 'username profile.firstName profile.lastName')
        .exec();

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (!challenge.isPublic || !challenge.isActive) {
        // Only author and admins can see inactive/private challenges
        if (!userId || challenge.author._id.toString() !== userId) {
          throw new Error('Challenge not found');
        }
      }

      return challenge;
    } catch (error) {
      logger.error('Get challenge by slug error:', error);
      throw error;
    }
  }

  /**
   * Create new challenge
   */
  static async createChallenge(authorId: string, data: CreateChallengeDto): Promise<IChallenge> {
    try {
      // Check if slug already exists
      if (data.title) {
        const slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        const existingChallenge = await Challenge.findOne({ slug });
        if (existingChallenge) {
          throw new Error('A challenge with this title already exists');
        }
      }

      const challenge = new Challenge({
        ...data,
        author: authorId,
        content: {
          ...data.content,
          hints: data.content.hints || [],
        },
        code: {
          starterCode: data.code.starterCode || {},
          testCases: data.code.testCases.map(tc => ({
            ...tc,
            isHidden: tc.isHidden || false,
            weight: tc.weight || 1,
          })),
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: [],
            ...data.code.validationRules,
          },
        },
        scenario: {
          urgency: 'medium',
          distractions: [],
          ...data.scenario,
        },
        tags: data.tags || [],
        isPublic: data.isPublic !== false, // Default to true
      });

      await challenge.save();

      logger.info('Challenge created successfully', {
        challengeId: challenge._id,
        title: challenge.title,
        author: authorId,
      });

      return challenge;
    } catch (error) {
      logger.error('Create challenge error:', error);
      throw error;
    }
  }

  /**
   * Update challenge
   */
  static async updateChallenge(
    id: string,
    authorId: string,
    updates: UpdateChallengeDto
  ): Promise<IChallenge> {
    try {
      const challenge = await Challenge.findById(id);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user is the author
      if (challenge.author.toString() !== authorId) {
        throw new Error('Not authorized to update this challenge');
      }

      // Check slug uniqueness if title is being updated
      if (updates.title && updates.title !== challenge.title) {
        const slug = updates.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        const existingChallenge = await Challenge.findOne({ 
          slug, 
          _id: { $ne: id } 
        });
        
        if (existingChallenge) {
          throw new Error('A challenge with this title already exists');
        }
      }

      // Update challenge
      Object.assign(challenge, updates);
      await challenge.save();

      logger.info('Challenge updated successfully', {
        challengeId: challenge._id,
        title: challenge.title,
        author: authorId,
        updatedFields: Object.keys(updates),
      });

      return challenge;
    } catch (error) {
      logger.error('Update challenge error:', error);
      throw error;
    }
  }

  /**
   * Delete challenge
   */
  static async deleteChallenge(id: string, authorId: string): Promise<void> {
    try {
      const challenge = await Challenge.findById(id);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user is the author
      if (challenge.author.toString() !== authorId) {
        throw new Error('Not authorized to delete this challenge');
      }

      // Soft delete by setting isActive to false
      challenge.isActive = false;
      await challenge.save();

      logger.info('Challenge deleted successfully', {
        challengeId: challenge._id,
        title: challenge.title,
        author: authorId,
      });
    } catch (error) {
      logger.error('Delete challenge error:', error);
      throw error;
    }
  }

  /**
   * Get challenge statistics
   */
  static async getChallengeStats(id: string): Promise<ChallengeStats> {
    try {
      const challenge = await Challenge.findById(id);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const completionRate = challenge.stats.totalAttempts > 0
        ? (challenge.stats.successfulAttempts / challenge.stats.totalAttempts) * 100
        : 0;

      // Calculate difficulty rating based on completion rate
      let difficultyRating = 5; // Default medium
      if (completionRate > 80) difficultyRating = 2; // Easy
      else if (completionRate > 60) difficultyRating = 3;
      else if (completionRate > 40) difficultyRating = 4;
      else if (completionRate > 20) difficultyRating = 5;
      else difficultyRating = 6; // Very hard

      const stats: ChallengeStats = {
        totalAttempts: challenge.stats.totalAttempts,
        successfulAttempts: challenge.stats.successfulAttempts,
        averageTime: challenge.stats.averageTime,
        averageScore: challenge.stats.averageScore,
        popularityScore: challenge.stats.popularityScore,
        completionRate: Math.round(completionRate * 100) / 100,
        difficultyRating,
      };

      return stats;
    } catch (error) {
      logger.error('Get challenge stats error:', error);
      throw error;
    }
  }

  /**
   * Start challenge session
   */
  static async startChallengeSession(userId: string, challengeId: string): Promise<SessionData> {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (!challenge.isPublic || !challenge.isActive) {
        throw new Error('Challenge not available');
      }

      // Generate session token
      const sessionToken = `session_${userId}_${challengeId}_${Date.now()}`;

      const sessionData: SessionData = {
        challengeId,
        userId,
        startedAt: new Date(),
        timeLimit: challenge.timeLimit,
        sessionToken,
      };

      // Store session data in memory for tracking
      // TODO: Implement session persistence if needed

      logger.info('Challenge session started', {
        userId,
        challengeId,
        sessionToken,
      });

      return sessionData;
    } catch (error) {
      logger.error('Start challenge session error:', error);
      throw error;
    }
  }

  /**
   * Get popular challenges
   */
  static async getPopularChallenges(limit: number = 10): Promise<IChallenge[]> {
    try {
      const challenges = await Challenge.find({
        isPublic: true,
        isActive: true,
      })
        .sort({ 'stats.popularityScore': -1 })
        .limit(limit)
        .populate('author', 'username profile.firstName profile.lastName')
        .exec();

      return challenges;
    } catch (error) {
      logger.error('Get popular challenges error:', error);
      throw error;
    }
  }

  /**
   * Get challenges by category
   */
  static async getChallengesByCategory(): Promise<Record<string, number>> {
    try {
      const result = await Challenge.aggregate([
        {
          $match: {
            isPublic: true,
            isActive: true,
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const categories: Record<string, number> = {};
      result.forEach(item => {
        categories[item._id] = item.count;
      });

      return categories;
    } catch (error) {
      logger.error('Get challenges by category error:', error);
      throw error;
    }
  }

  /**
   * Update challenge popularity score
   */
  static async updatePopularityScore(id: string, increment: number = 1): Promise<void> {
    try {
      await Challenge.findByIdAndUpdate(id, {
        $inc: { 'stats.popularityScore': increment },
      });
    } catch (error) {
      logger.error('Update popularity score error:', error);
      throw error;
    }
  }

  /**
   * Get challenge project structure
   */
  static async getChallengeProjectStructure(challengeId: string): Promise<any> {
    try {
      const challenge = await Challenge.findById(challengeId);
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Generate project structure based on challenge type and title
      const projectStructure = this.generateProjectStructure(challenge);
      
      return projectStructure;
    } catch (error) {
      logger.error('Get challenge project structure error:', error);
      throw error;
    }
  }

  /**
   * Generate project structure based on challenge
   */
  private static generateProjectStructure(challenge: IChallenge): any {
    const baseStructure = {
      files: [] as any[],
      testCases: challenge.code.testCases || []
    };

    // Generate structure based on challenge type and title
    if (challenge.type === 'feature') {
      if (challenge.title.toLowerCase().includes('gallery') || challenge.title.toLowerCase().includes('frontend')) {
        // Frontend React project structure
        baseStructure.files = [
          {
            path: 'package.json',
            content: JSON.stringify({
              "name": "challenge-project",
              "version": "1.0.0",
              "description": challenge.description,
              "main": "src/index.js",
              "scripts": {
                "start": "react-scripts start",
                "build": "react-scripts build",
                "test": "react-scripts test"
              },
              "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-scripts": "5.0.1"
              }
            }, null, 2),
            type: 'file'
          },
          {
            path: 'src/App.js',
            content: challenge.code.starterCode?.javascript || `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>${challenge.title}</h1>
      {/* Your implementation here */}
    </div>
  );
}

export default App;`,
            type: 'file'
          }
        ];
      } else {
        // Backend Node.js project structure
        baseStructure.files = [
          {
            path: 'package.json',
            content: JSON.stringify({
              "name": "challenge-api",
              "version": "1.0.0",
              "description": challenge.description,
              "main": "src/server.js",
              "scripts": {
                "start": "node src/server.js",
                "dev": "nodemon src/server.js",
                "test": "jest"
              },
              "dependencies": {
                "express": "^4.18.2",
                "mongoose": "^7.0.3"
              }
            }, null, 2),
            type: 'file'
          },
          {
            path: 'src/server.js',
            content: challenge.code.starterCode?.javascript || `const express = require('express');
const app = express();

app.use(express.json());

// Your implementation here

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
            type: 'file'
          }
        ];
      }
    } else {
      // DSA or bug-fix
      baseStructure.files = [
        {
          path: 'solution.js',
          content: challenge.code.starterCode?.javascript || `// ${challenge.title}
// Your implementation here`,
          type: 'file'
        },
        {
          path: 'test.js',
          content: `// Test cases for ${challenge.title}
const solution = require('./solution');

// Test cases are immutable
${challenge.code.testCases.map((testCase, index) => `
console.log('Test ${index + 1}:', solution(${testCase.input}) === ${testCase.expectedOutput});`).join('')}`,
          type: 'file',
          immutable: true
        }
      ];
    }

    return baseStructure;
  }
}