import mongoose, { Document, Schema } from 'mongoose';

// Define types directly instead of importing from frontend
export type TemplateCategory = 'algorithm' | 'data-structure' | 'web-dev' | 'mobile' | 'backend' | 'devops';
export type TemplateFramework = 'React' | 'Next.js' | 'Node.js' | 'Vue' | 'Angular' | 'Express' | 'Vanilla';
export type TemplateDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type TemplateLanguage = 'javascript' | 'typescript' | 'html' | 'css' | 'react' | 'vue' | 'angular';

export interface ITemplateCode {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  language: TemplateLanguage;
  framework: TemplateFramework;
}

export interface ITemplateMetadata {
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
}

export interface ITemplateStats {
  stars: number;
  downloads: number;
  forks: number;
}

export interface ITemplate extends Document {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  code: ITemplateCode;
  metadata: ITemplateMetadata;
  stats: ITemplateStats;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateCodeSchema = new Schema({
  htmlCode: { type: String },
  cssCode: { type: String },
  jsCode: { type: String },
  language: { 
    type: String, 
    enum: ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular'],
    required: true 
  },
  framework: { 
    type: String, 
    enum: ['React', 'Next.js', 'Node.js', 'Vue', 'Angular', 'Express', 'Vanilla'],
    required: true 
  }
});

const TemplateMetadataSchema = new Schema({
  category: { 
    type: String, 
    enum: ['algorithm', 'data-structure', 'web-dev', 'mobile', 'backend', 'devops'],
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true 
  },
  tags: [{ type: String }]
});

const TemplateStatsSchema = new Schema({
  stars: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  forks: { type: Number, default: 0 }
});

const TemplateSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: TemplateCodeSchema, required: true },
  metadata: { type: TemplateMetadataSchema, required: true },
  stats: { type: TemplateStatsSchema, required: true }
}, {
  timestamps: true
});

export default mongoose.model<ITemplate>('Template', TemplateSchema);