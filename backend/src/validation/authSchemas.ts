import Joi from 'joi';
import { commonSchemas } from '../middleware/validation';

export const authSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    username: commonSchemas.username,
    password: commonSchemas.password,
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
  }),

  login: Joi.object({
    identifier: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'Email or username is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
      }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'string.empty': 'Refresh token is required',
      }),
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email,
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'string.empty': 'Reset token is required',
      }),
    password: commonSchemas.password,
  }),

  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'string.empty': 'Verification token is required',
      }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Current password is required',
      }),
    newPassword: commonSchemas.password,
  }),
};