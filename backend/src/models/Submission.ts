import mongoose, { Schema, Document } from 'mongoose';
import { BaseDocument } from '../types';

export interface ISubmission extends BaseDocument {
  user: mongoose.Types.ObjectId;
  challenge: mongoose.Types.ObjectId;
  code: string;
  language: string;
  execution: {
    status: 'pending' | 'completed' | 'failed' | 'timeout';
    score?: number;
    totalTests?: number;
    passedTests?: number;
    executionTime?: number;
    memoryUsage?: number;
    output?: string;
    error?: string;
    testResults: Array<{
      testCase: mongoose.Types.ObjectId;
      passed: boolean;
      actualOutput?: string;
      executionTime?: number;
      error?: string;
    }>;
    executedInBrowser: boolean;
    browserEnvironment?: string;
  };
  simulation: {
    mode: 'standard' | 'interview' | 'zen';
    distractionLevel: 'low' | 'medium' | 'high';
    timeSpent?: number;
    distractionsEncountered?: number;
    focusScore?: number;
    stressLevel?: number;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    startedAt: Date;
    submittedAt?: Date;
    isCompleted: boolean;
  };
}

const submissionSchema = new Schema<ISubmission>({
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
  code: {
    type: String,
    required: [true, 'Code is required'],
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: {
      values: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      message: 'Language must be one of: javascript, typescript, python, java, cpp'
    }
  },
  execution: {
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'timeout'],
        message: 'Status must be one of: pending, completed, failed, timeout'
      },
      default: 'pending'
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    totalTests: {
      type: Number,
      min: [0, 'Total tests cannot be negative']
    },
    passedTests: {
      type: Number,
      min: [0, 'Passed tests cannot be negative']
    },
    executionTime: {
      type: Number,
      min: [0, 'Execution time cannot be negative']
    },
    memoryUsage: {
      type: Number,
      min: [0, 'Memory usage cannot be negative']
    },
    output: {
      type: String,
      trim: true
    },
    error: {
      type: String,
      trim: true
    },
    testResults: [{
      testCase: {
        type: Schema.Types.ObjectId,
        required: true
      },
      passed: {
        type: Boolean,
        required: true
      },
      actualOutput: {
        type: String,
        trim: true
      },
      executionTime: {
        type: Number,
        min: [0, 'Execution time cannot be negative']
      },
      error: {
        type: String,
        trim: true
      }
    }],
    executedInBrowser: {
      type: Boolean,
      default: true
    },
    browserEnvironment: {
      type: String,
      trim: true
    }
  },
  simulation: {
    mode: {
      type: String,
      enum: {
        values: ['standard', 'interview', 'zen'],
        message: 'Mode must be one of: standard, interview, zen'
      },
      default: 'standard'
    },
    distractionLevel: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Distraction level must be one of: low, medium, high'
      },
      default: 'medium'
    },
    timeSpent: {
      type: Number,
      min: [0, 'Time spent cannot be negative']
    },
    distractionsEncountered: {
      type: Number,
      min: [0, 'Distractions encountered cannot be negative']
    },
    focusScore: {
      type: Number,
      min: [0, 'Focus score cannot be negative'],
      max: [100, 'Focus score cannot exceed 100']
    },
    stressLevel: {
      type: Number,
      min: [0, 'Stress level cannot be negative'],
      max: [100, 'Stress level cannot exceed 100']
    }
  },
  metadata: {
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    startedAt: {
      type: Date,
      required: [true, 'Started at is required'],
      default: Date.now
    },
    submittedAt: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive metadata for non-authors
      if (!doc.populated('user')) {
        const { ipAddress, userAgent, ...metadata } = ret.metadata || {};
        ret.metadata = metadata;
      }
      return ret;
    }
  }
});

// Index for efficient queries
submissionSchema.index({ user: 1, challenge: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ challenge: 1, 'execution.status': 1 });

// Virtual for success rate
submissionSchema.virtual('successRate').get(function() {
  if (!this.execution.totalTests || this.execution.totalTests === 0) return 0;
  return Math.round((this.execution.passedTests! / this.execution.totalTests) * 100 * 100) / 100;
});

// Instance method to mark as completed
submissionSchema.methods.markCompleted = async function(results: any) {
  this.execution.status = 'completed';
  this.execution = { ...this.execution, ...results };
  this.metadata.submittedAt = new Date();
  this.metadata.isCompleted = true;
  return this.save();
};

// Static method to get user submissions
submissionSchema.statics.findByUser = function(userId: string, filters = {}) {
  return this.find({
    user: userId,
    ...filters
  }).populate('challenge', 'title slug difficulty type');
};

// Static method to get challenge submissions
submissionSchema.statics.findByChallenge = function(challengeId: string, filters = {}) {
  return this.find({
    challenge: challengeId,
    ...filters
  }).populate('user', 'username profile.firstName profile.lastName');
};

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);