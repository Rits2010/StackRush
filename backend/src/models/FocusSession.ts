import mongoose, { Schema, Document } from 'mongoose';
import { BaseDocument } from '../types';

export interface IFocusSession extends BaseDocument {
  user: mongoose.Types.ObjectId;
  challenge: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  distractionsEncountered: number;
  focusScore: number; // 0-100
  environment: 'zen' | 'standard' | 'interview';
}

const focusSessionSchema = new Schema<IFocusSession>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  distractionsEncountered: {
    type: Number,
    min: [0, 'Distractions encountered cannot be negative'],
    default: 0
  },
  focusScore: {
    type: Number,
    min: [0, 'Focus score cannot be negative'],
    max: [100, 'Focus score cannot exceed 100'],
    required: [true, 'Focus score is required']
  },
  environment: {
    type: String,
    enum: {
      values: ['zen', 'standard', 'interview'],
      message: 'Environment must be one of: zen, standard, interview'
    },
    required: [true, 'Environment is required']
  }
}, {
  timestamps: true
});

// Index for efficient queries
focusSessionSchema.index({ user: 1, createdAt: -1 });
focusSessionSchema.index({ challenge: 1, createdAt: -1 });
focusSessionSchema.index({ user: 1, challenge: 1 });

export const FocusSession = mongoose.model<IFocusSession>('FocusSession', focusSessionSchema);