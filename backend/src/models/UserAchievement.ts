import { Schema, model, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  user: Schema.Types.ObjectId;
  achievement: Schema.Types.ObjectId;
  unlockedAt: Date;
  progress: number;
}

const userAchievementSchema = new Schema<IUserAchievement>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  achievement: { 
    type: Schema.Types.ObjectId, 
    ref: 'Achievement', 
    required: true,
    index: true 
  },
  unlockedAt: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  progress: { 
    type: Number, 
    default: 100,
    min: 0,
    max: 100 
  }
}, { timestamps: true });

// Compound index to ensure one achievement per user
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export default model<IUserAchievement>('UserAchievement', userAchievementSchema);
