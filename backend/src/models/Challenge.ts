import mongoose, { Schema, Document } from 'mongoose';
import { BaseDocument } from '../types';

export interface IChallenge extends BaseDocument {
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit?: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints: string[];
    solution?: string;
    solutionExplanation?: string;
  };
  code: {
    starterCode: {
      javascript?: string;
      typescript?: string;
      python?: string;
      java?: string;
      cpp?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules: {
      timeComplexity?: string;
      spaceComplexity?: string;
      forbiddenKeywords: string[];
      requiredKeywords: string[];
    };
  };
  scenario: {
    background?: string;
    role?: string;
    company?: string;
    urgency: 'low' | 'medium' | 'high';
    distractions: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime?: number;
    averageScore?: number;
    popularityScore: number;
  };
  author: mongoose.Types.ObjectId;
  isPublic: boolean;
  isActive: boolean;
}

const challengeSchema = new Schema<IChallenge>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['dsa', 'bug-fix', 'feature'],
      message: 'Type must be one of: dsa, bug-fix, feature'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be one of: Easy, Medium, Hard'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  timeLimit: {
    type: Number,
    min: [1, 'Time limit must be at least 1 minute'],
    max: [480, 'Time limit cannot exceed 480 minutes (8 hours)']
  },
  content: {
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true,
      minlength: [50, 'Problem statement must be at least 50 characters long']
    },
    constraints: {
      type: String,
      trim: true
    },
    examples: [{
      input: {
        type: String,
        required: [true, 'Example input is required'],
        trim: true
      },
      output: {
        type: String,
        required: [true, 'Example output is required'],
        trim: true
      },
      explanation: {
        type: String,
        trim: true
      }
    }],
    hints: [{
      type: String,
      trim: true,
      maxlength: [500, 'Hint cannot exceed 500 characters']
    }],
    solution: {
      type: String,
      required: false,
      trim: true
    },
    solutionExplanation: {
      type: String,
      required: false,
      trim: true,
      minlength: [50, 'Solution explanation must be at least 50 characters long']
    }
  },
  code: {
    starterCode: {
      javascript: {
        type: String,
        trim: true
      },
      typescript: {
        type: String,
        trim: true
      },
      python: {
        type: String,
        trim: true
      },
      java: {
        type: String,
        trim: true
      },
      cpp: {
        type: String,
        trim: true
      }
    },
    testCases: [{
      input: {
        type: String,
        required: [true, 'Test case input is required'],
        trim: true
      },
      expectedOutput: {
        type: String,
        required: [true, 'Test case expected output is required'],
        trim: true
      },
      isHidden: {
        type: Boolean,
        default: false
      },
      weight: {
        type: Number,
        default: 1,
        min: [0.1, 'Test case weight must be at least 0.1'],
        max: [10, 'Test case weight cannot exceed 10']
      }
    }],
    validationRules: {
      timeComplexity: {
        type: String,
        trim: true
      },
      spaceComplexity: {
        type: String,
        trim: true
      },
      forbiddenKeywords: [{
        type: String,
        trim: true
      }],
      requiredKeywords: [{
        type: String,
        trim: true
      }]
    }
  },
  scenario: {
    background: {
      type: String,
      trim: true,
      maxlength: [1000, 'Background cannot exceed 1000 characters']
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters']
    },
    urgency: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Urgency must be one of: low, medium, high'
      },
      default: 'medium'
    },
    distractions: [{
      type: {
        type: String,
        required: [true, 'Distraction type is required'],
        trim: true
      },
      frequency: {
        type: String,
        required: [true, 'Distraction frequency is required'],
        trim: true
      },
      content: {
        type: String,
        required: [true, 'Distraction content is required'],
        trim: true,
        maxlength: [200, 'Distraction content cannot exceed 200 characters']
      }
    }]
  },
  stats: {
    totalAttempts: {
      type: Number,
      default: 0,
      min: [0, 'Total attempts cannot be negative']
    },
    successfulAttempts: {
      type: Number,
      default: 0,
      min: [0, 'Successful attempts cannot be negative']
    },
    averageTime: {
      type: Number,
      min: [0, 'Average time cannot be negative']
    },
    averageScore: {
      type: Number,
      min: [0, 'Average score cannot be negative'],
      max: [100, 'Average score cannot exceed 100']
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: [0, 'Popularity score cannot be negative']
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Don't expose solution and hidden test cases to non-authors
      if (!doc.populated('author')) {
        // Use object destructuring to remove sensitive fields in a type-safe way
        if (ret.content) {
          const { solution, solutionExplanation, ...content } = ret.content;
          ret.content = content;
        }
        if (ret.code?.testCases) {
          ret.code.testCases = ret.code.testCases.filter((tc: any) => !tc.isHidden);
        }
      }
      return ret;
    }
  }
});

// Pre-save middleware to generate slug if not provided
challengeSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  next();
});

// Virtual for completion rate
challengeSchema.virtual('completionRate').get(function() {
  if (this.stats.totalAttempts === 0) return 0;
  return Math.round((this.stats.successfulAttempts / this.stats.totalAttempts) * 100 * 100) / 100;
});

// Static method to find public challenges
challengeSchema.statics.findPublic = function(filters = {}) {
  return this.find({
    isPublic: true,
    isActive: true,
    ...filters
  });
};

// Static method to search challenges
challengeSchema.statics.search = function(query: string, filters = {}) {
  return this.find({
    $text: { $search: query },
    isPublic: true,
    isActive: true,
    ...filters
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });
};

// Instance method to increment attempt stats
challengeSchema.methods.incrementAttempts = async function(successful = false) {
  this.stats.totalAttempts += 1;
  if (successful) {
    this.stats.successfulAttempts += 1;
  }
  return this.save();
};

// Instance method to update average time
challengeSchema.methods.updateAverageTime = async function(newTime: number) {
  const totalTime = (this.stats.averageTime || 0) * this.stats.successfulAttempts;
  this.stats.averageTime = (totalTime + newTime) / (this.stats.successfulAttempts + 1);
  return this.save();
};

// Instance method to update average score
challengeSchema.methods.updateAverageScore = async function(newScore: number) {
  const totalScore = (this.stats.averageScore || 0) * this.stats.successfulAttempts;
  this.stats.averageScore = (totalScore + newScore) / (this.stats.successfulAttempts + 1);
  return this.save();
};

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);