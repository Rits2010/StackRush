import Joi from 'joi';

const criteriaSchema = Joi.object({
  type: Joi.string()
    .valid('challenge_count', 'streak', 'score', 'time', 'special')
    .required(),
  target: Joi.number().required(),
  conditions: Joi.object().default({})
});

const rewardsSchema = Joi.object({
  xp: Joi.number().default(0),
  badge: Joi.string(),
  title: Joi.string()
});

export const achievementValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    icon: Joi.string(),
    category: Joi.string()
      .valid('beginner', 'performance', 'consistency', 'social')
      .required(),
    criteria: criteriaSchema.required(),
    rewards: rewardsSchema.default({ xp: 0 }),
    rarity: Joi.string()
      .valid('common', 'rare', 'epic', 'legendary')
      .default('common'),
    isActive: Joi.boolean().default(true)
  }),
  update: Joi.object({
    body: Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      icon: Joi.string(),
      category: Joi.string().valid('beginner', 'performance', 'consistency', 'social'),
      criteria: criteriaSchema,
      rewards: rewardsSchema,
      rarity: Joi.string().valid('common', 'rare', 'epic', 'legendary'),
      isActive: Joi.boolean()
    }).min(1)
  }),
  get: Joi.object({
    params: Joi.object({
      id: Joi.string().required()
    })
  }),
  delete: Joi.object({
    params: Joi.object({
      id: Joi.string().required()
    })
  }),
  getAchievement: Joi.object({
    params: Joi.object({
      id: Joi.string().required()
    })
  })
};
