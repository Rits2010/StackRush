import Joi from 'joi';

export const notificationSchemas = {
  getUserNotifications: Joi.object({
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(20),
      sort: Joi.string()
        .valid('createdAt', 'updatedAt', 'priority')
        .default('createdAt'),
      order: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
      type: Joi.string()
        .valid('achievement', 'challenge', 'social', 'system')
        .optional(),
      priority: Joi.string()
        .valid('low', 'medium', 'high')
        .optional(),
      isRead: Joi.boolean().optional(),
      dateFrom: Joi.date().optional(),
      dateTo: Joi.date().optional()
    }).optional()
  }),

  getByType: Joi.object({
    params: Joi.object({
      type: Joi.string()
        .required()
        .valid('achievement', 'challenge', 'social', 'system')
        .messages({
          'any.only': 'Type must be one of: achievement, challenge, social, system',
          'any.required': 'Type is required'
        })
    }).required(),
    query: Joi.object({
      limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
    }).optional()
  }),

  markAsRead: Joi.object({
    params: Joi.object({
      id: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Notification ID must be a valid MongoDB ObjectId',
          'any.required': 'Notification ID is required'
        })
    }).required()
  }),

  deleteNotification: Joi.object({
    params: Joi.object({
      id: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Notification ID must be a valid MongoDB ObjectId',
          'any.required': 'Notification ID is required'
        })
    }).required()
  }),

  createNotification: Joi.object({
    body: Joi.object({
      recipient: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Recipient ID must be a valid MongoDB ObjectId',
          'any.required': 'Recipient is required'
        }),
      type: Joi.string()
        .required()
        .valid('achievement', 'challenge', 'social', 'system')
        .messages({
          'any.only': 'Type must be one of: achievement, challenge, social, system',
          'any.required': 'Type is required'
        }),
      title: Joi.string()
        .required()
        .min(1)
        .max(200)
        .trim()
        .messages({
          'string.min': 'Title cannot be empty',
          'string.max': 'Title cannot exceed 200 characters',
          'any.required': 'Title is required'
        }),
      message: Joi.string()
        .required()
        .min(1)
        .max(1000)
        .trim()
        .messages({
          'string.min': 'Message cannot be empty',
          'string.max': 'Message cannot exceed 1000 characters',
          'any.required': 'Message is required'
        }),
      data: Joi.object().optional(),
      priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium'),
      channels: Joi.array()
        .items(Joi.string().valid('email', 'push'))
        .min(1)
        .default(['email']),
      expiresAt: Joi.date()
        .greater('now')
        .optional()
        .messages({
          'date.greater': 'Expiration date must be in the future'
        })
    }).required()
  }),

  createBulkNotifications: Joi.object({
    body: Joi.object({
      notifications: Joi.array()
        .items(
          Joi.object({
            recipient: Joi.string()
              .required()
              .pattern(/^[0-9a-fA-F]{24}$/)
              .messages({
                'string.pattern.base': 'Recipient ID must be a valid MongoDB ObjectId'
              }),
            type: Joi.string()
              .required()
              .valid('achievement', 'challenge', 'social', 'system'),
            title: Joi.string()
              .required()
              .min(1)
              .max(200)
              .trim(),
            message: Joi.string()
              .required()
              .min(1)
              .max(1000)
              .trim(),
            data: Joi.object().optional(),
            priority: Joi.string()
              .valid('low', 'medium', 'high')
              .default('medium'),
            channels: Joi.array()
              .items(Joi.string().valid('email', 'push'))
              .min(1)
              .default(['email']),
            expiresAt: Joi.date()
              .greater('now')
              .optional()
          })
        )
        .min(1)
        .max(100)
        .required()
        .messages({
          'array.min': 'At least one notification is required',
          'array.max': 'Cannot create more than 100 notifications at once',
          'any.required': 'Notifications array is required'
        })
    }).required()
  })
};