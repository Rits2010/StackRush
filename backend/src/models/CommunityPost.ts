import mongoose, { Document, Schema } from 'mongoose';

// Define PostCategory type directly instead of importing from frontend
type PostCategory = 'discussion' | 'help' | 'showcase' | 'tips' | 'news' | 'code-share';

export interface ICodeSubmission {
  hasCode: boolean;
  title: string;
  description: string;
  code: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  language: string;
  githubUrl?: string;
  liveDemo?: string;
  challengeId?: mongoose.Types.ObjectId;
}

export interface IPostInteractions {
  likes: number;
  views: number;
  comments: number;
  likedBy: mongoose.Types.ObjectId[];
  bookmarkedBy: mongoose.Types.ObjectId[];
}

export interface IPostMetadata {
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  challengeType?: 'dsa' | 'bug-fix' | 'feature';
  isPinned: boolean;
  isFeatured: boolean;
}

export interface ICommunityPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  category: PostCategory;
  tags: string[];
  codeSubmission?: ICodeSubmission;
  interactions: IPostInteractions;
  metadata?: IPostMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSubmissionSchema = new Schema({
  hasCode: { type: Boolean, default: false },
  title: String,
  description: String,
  code: String,
  htmlCode: String,
  cssCode: String,
  jsCode: String,
  language: String,
  githubUrl: String,
  liveDemo: String,
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' }
});

const PostInteractionsSchema = new Schema({
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const PostMetadataSchema = new Schema({
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  challengeType: { type: String, enum: ['dsa', 'bug-fix', 'feature'] },
  isPinned: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false }
});

const CommunityPostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['discussion', 'help', 'showcase', 'tips', 'news', 'code-share'], 
    required: true 
  },
  tags: [String],
  codeSubmission: CodeSubmissionSchema,
  interactions: { type: PostInteractionsSchema, default: () => ({}) },
  metadata: PostMetadataSchema,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);