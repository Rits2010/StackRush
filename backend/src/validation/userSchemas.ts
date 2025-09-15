import Joi from 'joi';
import { commonSchemas } from '../middleware/validation';

export const userSchemas = {
  updateProfile: Joi.object({
    profile: Joi.object({
      firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional()
        .messages({
          'string.min': 'First name cannot be empty',
          'string.max': 'First name cannot exceed 50 characters',
        }),
      lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional()
        .messages({
          'string.min': 'Last name cannot be empty',
          'string.max': 'Last name cannot exceed 50 characters',
        }),
      avatar: Joi.string()
        .uri()
        .optional()
        .messages({
          'string.uri': 'Avatar must be a valid URL',
        }),
      bio: Joi.string()
        .trim()
        .max(500)
        .optional()
        .messages({
          'string.max': 'Bio cannot exceed 500 characters',
        }),
      location: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Location cannot exceed 100 characters',
        }),
      website: Joi.string()
        .uri()
        .optional()
        .messages({
          'string.uri': 'Website must be a valid URL',
        }),
      github: Joi.string()
        .trim()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .max(39)
        .optional()
        .messages({
          'string.pattern.base': 'GitHub username can only contain letters, numbers, underscores, and hyphens',
          'string.max': 'GitHub username cannot exceed 39 characters',
        }),
      linkedin: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
          'string.max': 'LinkedIn profile cannot exceed 100 characters',
        }),
    }).optional(),
  }),

  updatePreferences: Joi.object({
    theme: Joi.string()
      .valid('light', 'dark')
      .optional()
      .messages({
        'any.only': 'Theme must be either "light" or "dark"',
      }),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      achievements: Joi.boolean().optional(),
      challenges: Joi.boolean().optional(),
    }).optional(),
    privacy: Joi.object({
      profilePublic: Joi.boolean().optional(),
      showStats: Joi.boolean().optional(),
      showActivity: Joi.boolean().optional(),
    }).optional(),
  }),

  getUsersQuery: Joi.object({
    ...commonSchemas.pagination.describe().keys,
    search: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Search term cannot be empty',
        'string.max': 'Search term cannot exceed 100 characters',
      }),
    level: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.min': 'Level must be at least 1',
      }),
    minXp: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Minimum XP cannot be negative',
      }),
    maxXp: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Maximum XP cannot be negative',
      }),
    roles: Joi.array()
      .items(Joi.string().valid('user', 'admin', 'moderator'))
      .optional()
      .messages({
        'array.includes': 'Roles must be one of: user, admin, moderator',
      }),
    isActive: Joi.boolean().optional(),
    emailVerified: Joi.boolean().optional(),
  }).custom((value, helpers) => {
    // Validate that minXp is not greater than maxXp
    if (value.minXp !== undefined && value.maxXp !== undefined && value.minXp > value.maxXp) {
      return helpers.error('custom.minMaxXp');
    }
    return value;
  }).messages({
    'custom.minMaxXp': 'Minimum XP cannot be greater than maximum XP',
  }),

  leaderboardQuery: Joi.object({
    type: Joi.string()
      .valid('xp', 'level', 'streak', 'completed')
      .default('xp')
      .optional()
      .messages({
        'any.only': 'Leaderboard type must be one of: xp, level, streak, completed',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional()
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),
  }),

  userIdParam: Joi.object({
    id: commonSchemas.objectId.required(),
  }),

  usernameParam: Joi.object({
    username: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens',
        'string.empty': 'Username is required',
      }),
  }),
};