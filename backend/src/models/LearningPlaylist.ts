import mongoose, { Document, Schema } from 'mongoose';

// Define TemplateDifficulty type directly instead of importing from frontend
type TemplateDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface IPlaylistMetadata {
  category: string;
  difficulty: TemplateDifficulty;
  duration: number; // in minutes
  lessonCount: number;
}

export interface IPlaylistStats {
  enrollments: number;
  completions: number;
  rating: number;
}

export interface ILearningPlaylist extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  metadata: IPlaylistMetadata;
  stats: IPlaylistStats;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistMetadataSchema = new Schema({
  category: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true 
  },
  duration: { type: Number, required: true }, // in minutes
  lessonCount: { type: Number, required: true }
});

const PlaylistStatsSchema = new Schema({
  enrollments: { type: Number, default: 0 },
  completions: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
});

const LearningPlaylistSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: PlaylistMetadataSchema, required: true },
  stats: { type: PlaylistStatsSchema, required: true }
}, {
  timestamps: true
});

export default mongoose.model<ILearningPlaylist>('LearningPlaylist', LearningPlaylistSchema);