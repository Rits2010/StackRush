import Joi from 'joi';
import { commonSchemas } from '../middleware/validation';

export const challengeSchemas = {
  createChallenge: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 200 characters',
        'string.empty': 'Title is required',
      }),
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 1000 characters',
        'string.empty': 'Description is required',
      }),
    type: Joi.string()
      .valid('dsa', 'bug-fix', 'feature')
      .required()
      .messages({
        'any.only': 'Type must be one of: dsa, bug-fix, feature',
        'string.empty': 'Type is required',
      }),
    difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .required()
      .messages({
        'any.only': 'Difficulty must be one of: Easy, Medium, Hard',
        'string.empty': 'Difficulty is required',
      }),
    category: Joi.string()
      .trim()
      .max(50)
      .required()
      .messages({
        'string.max': 'Category cannot exceed 50 characters',
        'string.empty': 'Category is required',
      }),
    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .max(30)
          .messages({
            'string.max': 'Tag cannot exceed 30 characters',
          })
      )
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 tags',
      }),
    timeLimit: Joi.number()
      .integer()
      .min(1)
      .max(480)
      .optional()
      .messages({
        'number.min': 'Time limit must be at least 1 minute',
        'number.max': 'Time limit cannot exceed 480 minutes (8 hours)',
      }),
    content: Joi.object({
      problemStatement: Joi.string()
        .trim()
        .min(50)
        .required()
        .messages({
          'string.min': 'Problem statement must be at least 50 characters long',
          'string.empty': 'Problem statement is required',
        }),
      constraints: Joi.string()
        .trim()
        .optional(),
      examples: Joi.array()
        .items(
          Joi.object({
            input: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': 'Example input is required',
              }),
            output: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': 'Example output is required',
              }),
            explanation: Joi.string()
              .trim()
              .optional(),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': 'At least one example is required',
        }),
      hints: Joi.array()
        .items(
          Joi.string()
            .trim()
            .max(500)
            .messages({
              'string.max': 'Hint cannot exceed 500 characters',
            })
        )
        .optional(),
      solution: Joi.string()
        .trim()
        .required()
        .messages({
          'string.empty': 'Solution is required',
        }),
      solutionExplanation: Joi.string()
        .trim()
        .min(50)
        .required()
        .messages({
          'string.min': 'Solution explanation must be at least 50 characters long',
          'string.empty': 'Solution explanation is required',
        }),
    }).required(),
    code: Joi.object({
      starterCode: Joi.object({
        javascript: Joi.string().trim().optional(),
        typescript: Joi.string().trim().optional(),
        python: Joi.string().trim().optional(),
        java: Joi.string().trim().optional(),
        cpp: Joi.string().trim().optional(),
      }).optional(),
      testCases: Joi.array()
        .items(
          Joi.object({
            input: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': 'Test case input is required',
              }),
            expectedOutput: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': 'Test case expected output is required',
              }),
            isHidden: Joi.boolean().default(false),
            weight: Joi.number()
              .min(0.1)
              .max(10)
              .default(1)
              .messages({
                'number.min': 'Test case weight must be at least 0.1',
                'number.max': 'Test case weight cannot exceed 10',
              }),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': 'At least one test case is required',
        }),
      validationRules: Joi.object({
        timeComplexity: Joi.string().trim().optional(),
        spaceComplexity: Joi.string().trim().optional(),
        forbiddenKeywords: Joi.array()
          .items(Joi.string().trim())
          .optional(),
        requiredKeywords: Joi.array()
          .items(Joi.string().trim())
          .optional(),
      }).optional(),
    }).required(),
    scenario: Joi.object({
      background: Joi.string()
        .trim()
        .max(1000)
        .optional()
        .messages({
          'string.max': 'Background cannot exceed 1000 characters',
        }),
      role: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Role cannot exceed 100 characters',
        }),
      company: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Company cannot exceed 100 characters',
        }),
      urgency: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium')
        .optional()
        .messages({
          'any.only': 'Urgency must be one of: low, medium, high',
        }),
      distractions: Joi.array()
        .items(
          Joi.object({
            type: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': 'Distraction type is required',
              }),
            frequency: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': 'Distraction frequency is required',
              }),
            content: Joi.string()
              .trim()
              .max(200)
              .required()
              .messages({
                'string.max': 'Distraction content cannot exceed 200 characters',
                'string.empty': 'Distraction content is required',
              }),
          })
        )
        .optional(),
    }).optional(),
    isPublic: Joi.boolean().default(true),
  }),

  updateChallenge: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 200 characters',
      }),
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .optional()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 1000 characters',
      }),
    type: Joi.string()
      .valid('dsa', 'bug-fix', 'feature')
      .optional()
      .messages({
        'any.only': 'Type must be one of: dsa, bug-fix, feature',
      }),
    difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .optional()
      .messages({
        'any.only': 'Difficulty must be one of: Easy, Medium, Hard',
      }),
    category: Joi.string()
      .trim()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Category cannot exceed 50 characters',
      }),
    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .max(30)
          .messages({
            'string.max': 'Tag cannot exceed 30 characters',
          })
      )
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 tags',
      }),
    timeLimit: Joi.number()
      .integer()
      .min(1)
      .max(480)
      .optional()
      .messages({
        'number.min': 'Time limit must be at least 1 minute',
        'number.max': 'Time limit cannot exceed 480 minutes (8 hours)',
      }),
    isPublic: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    // Allow partial updates to nested objects
    content: Joi.object().unknown(true).optional(),
    code: Joi.object().unknown(true).optional(),
    scenario: Joi.object().unknown(true).optional(),
  }),

  getChallengesQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Search term cannot be empty',
        'string.max': 'Search term cannot exceed 100 characters',
      }),
    type: Joi.string()
      .valid('dsa', 'bug-fix', 'feature')
      .optional()
      .messages({
        'any.only': 'Type must be one of: dsa, bug-fix, feature',
      }),
    difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .optional()
      .messages({
        'any.only': 'Difficulty must be one of: Easy, Medium, Hard',
      }),
    category: Joi.string()
      .trim()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Category cannot exceed 50 characters',
      }),
    tags: Joi.array()
      .items(Joi.string().trim())
      .optional(),
    timeLimit: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.min': 'Time limit must be at least 1 minute',
      }),
    author: commonSchemas.objectId.optional(),
  }),

  challengeIdParam: Joi.object({
    id: commonSchemas.objectId.required(),
  }),

  challengeSlugParam: Joi.object({
    slug: Joi.string()
      .trim()
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        'string.empty': 'Slug is required',
      }),
  }),

  popularChallengesQuery: Joi.object({
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .optional()
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 50',
      }),
  }),
};