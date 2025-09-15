import Joi from 'joi';

export const submissionSchemas = {
  createSubmission: Joi.object({
    body: Joi.object({
      challengeId: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Challenge ID must be a valid MongoDB ObjectId',
          'any.required': 'Challenge ID is required'
        }),
      code: Joi.string()
        .required()
        .min(1)
        .max(50000)
        .messages({
          'string.min': 'Code cannot be empty',
          'string.max': 'Code cannot exceed 50,000 characters',
          'any.required': 'Code is required'
        }),
      language: Joi.string()
        .required()
        .valid('javascript', 'typescript', 'python', 'java', 'cpp')
        .messages({
          'any.only': 'Language must be one of: javascript, typescript, python, java, cpp',
          'any.required': 'Language is required'
        }),
      simulation: Joi.object({
        mode: Joi.string()
          .valid('standard', 'interview', 'zen')
          .default('standard'),
        distractionLevel: Joi.string()
          .valid('low', 'medium', 'high')
          .default('medium')
      }).optional(),
      metadata: Joi.object({
        userAgent: Joi.string().optional(),
        ipAddress: Joi.string().optional()
      }).optional()
    }).required()
  }),

  processResults: Joi.object({
    params: Joi.object({
      id: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Submission ID must be a valid MongoDB ObjectId'
        })
    }).required(),
    body: Joi.object({
      status: Joi.string()
        .required()
        .valid('completed', 'failed', 'timeout')
        .messages({
          'any.only': 'Status must be one of: completed, failed, timeout',
          'any.required': 'Status is required'
        }),
      score: Joi.number()
        .min(0)
        .max(100)
        .optional(),
      totalTests: Joi.number()
        .integer()
        .min(0)
        .optional(),
      passedTests: Joi.number()
        .integer()
        .min(0)
        .optional(),
      executionTime: Joi.number()
        .min(0)
        .optional(),
      memoryUsage: Joi.number()
        .min(0)
        .optional(),
      output: Joi.string()
        .max(10000)
        .optional(),
      error: Joi.string()
        .max(5000)
        .optional(),
      testResults: Joi.array().items(
        Joi.object({
          testCase: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
          passed: Joi.boolean().required(),
          actualOutput: Joi.string().max(1000).optional(),
          executionTime: Joi.number().min(0).optional(),
          error: Joi.string().max(1000).optional()
        })
      ).optional(),
      browserEnvironment: Joi.string()
        .max(200)
        .optional()
    }).required()
  }),

  getById: Joi.object({
    params: Joi.object({
      id: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Submission ID must be a valid MongoDB ObjectId'
        })
    }).required()
  }),

  getUserSubmissions: Joi.object({
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),
      sort: Joi.string()
        .valid('createdAt', 'updatedAt', 'execution.score')
        .default('createdAt'),
      order: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
      challengeId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      language: Joi.string()
        .valid('javascript', 'typescript', 'python', 'java', 'cpp')
        .optional(),
      status: Joi.string()
        .valid('pending', 'completed', 'failed', 'timeout')
        .optional(),
      minScore: Joi.number()
        .min(0)
        .max(100)
        .optional(),
      maxScore: Joi.number()
        .min(0)
        .max(100)
        .optional(),
      dateFrom: Joi.date().optional(),
      dateTo: Joi.date().optional()
    }).optional()
  }),

  getChallengeSubmissions: Joi.object({
    params: Joi.object({
      challengeId: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Challenge ID must be a valid MongoDB ObjectId'
        })
    }).required(),
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),
      sort: Joi.string()
        .valid('createdAt', 'updatedAt', 'execution.score')
        .default('createdAt'),
      order: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
      language: Joi.string()
        .valid('javascript', 'typescript', 'python', 'java', 'cpp')
        .optional(),
      status: Joi.string()
        .valid('pending', 'completed', 'failed', 'timeout')
        .optional(),
      minScore: Joi.number()
        .min(0)
        .max(100)
        .optional(),
      maxScore: Joi.number()
        .min(0)
        .max(100)
        .optional()
    }).optional()
  }),

  getRecent: Joi.object({
    query: Joi.object({
      limit: Joi.number()
        .integer()
        .min(1)
        .max(20)
        .default(5)
    }).optional()
  }),

  deleteSubmission: Joi.object({
    params: Joi.object({
      id: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Submission ID must be a valid MongoDB ObjectId'
        })
    }).required()
  })
};