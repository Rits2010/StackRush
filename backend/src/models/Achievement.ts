import mongoose, { Schema } from 'mongoose';
import { BaseDocument } from '../types';

export interface IAchievement extends BaseDocument {
  name: string;
  description: string;
  icon: string;
  category: 'beginner' | 'performance' | 'consistency' | 'social';
  criteria: {
    type: 'challenge_count' | 'streak' | 'score' | 'time' | 'special';
    target: number;
    conditions: any;
  };
  rewards: {
    xp: number;
    badge: string;
    title: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
}

export interface IUserAchievement extends BaseDocument {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  unlockedAt: Date;
  progress?: number;
  metadata?: any;
}

const achievementSchema = new Schema<IAchievement>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['beginner', 'performance', 'consistency', 'social'],
      message: 'Category must be one of: beginner, performance, consistency, social'
    }
  },
  criteria: {
    type: {
      type: String,
      required: [true, 'Criteria type is required'],
      enum: {
        values: ['challenge_count', 'streak', 'score', 'time', 'special'],
        message: 'Criteria type must be one of: challenge_count, streak, score, time, special'
      }
    },
    target: {
      type: Number,
      required: [true, 'Target is required'],
      min: [1, 'Target must be at least 1']
    },
    conditions: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  rewards: {
    xp: {
      type: Number,
      required: [true, 'XP reward is required'],
      min: [0, 'XP reward cannot be negative']
    },
    badge: {
      type: String,
      required: [true, 'Badge is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [50, 'Title cannot exceed 50 characters']
    }
  },
  rarity: {
    type: String,
    required: [true, 'Rarity is required'],
    enum: {
      values: ['common', 'rare', 'epic', 'legendary'],
      message: 'Rarity must be one of: common, rare, epic, legendary'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const userAchievementSchema = new Schema<IUserAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  achievement: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: [true, 'Achievement is required']
  },
  unlockedAt: {
    type: Date,
    required: [true, 'Unlocked at is required'],
    default: Date.now
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100']
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

// Index for efficient queries
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ rarity: 1, isActive: 1 });
userAchievementSchema.index({ user: 1, unlockedAt: -1 });

// Static method to check if user has achievement
userAchievementSchema.statics.hasAchievement = async function(userId: string, achievementId: string) {
  const userAchievement = await this.findOne({
    user: userId,
    achievement: achievementId
  });
  return !!userAchievement;
};

// Static method to get user achievements
userAchievementSchema.statics.getUserAchievements = function(userId: string) {
  return this.find({ user: userId })
    .populate('achievement')
    .sort({ unlockedAt: -1 });
};

// Static method to get achievement leaderboard
userAchievementSchema.statics.getLeaderboard = function(achievementId: string, limit = 10) {
  return this.find({ achievement: achievementId })
    .populate('user', 'username profile.firstName profile.lastName profile.avatar')
    .sort({ unlockedAt: 1 })
    .limit(limit);
};

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);