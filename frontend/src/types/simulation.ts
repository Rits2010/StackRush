export interface Distraction {
  id: number;
  type: string;
  icon?: React.ComponentType<{ className?: string }> | string;
  message: string;
  color: string;
  sound: string;
  isModal: boolean;
  content: string;
  actions?: string[];
  timestamp?: string;
}

export interface TeamMessage {
  id: number;
  sender: string;
  message: string;
  time: string;
  type: 'info' | 'urgent' | 'success' | 'error';
}

export interface Bug {
  id: number;
  title: string;
  description: string;
  severity: string;
  reporter: string;
}

export interface TestCase {
  input?: string;
  expected?: string;
  description?: string;
  status?: 'passed' | 'failed' | 'pending';
}

export interface Deployment {
  id: number;
  status: 'success' | 'failed' | 'idle' | 'building';
  time: string;
  commit: string;
  author: string;
}

export interface SystemHealth {
  api: number;
  database: number;
  build: number;
}

export interface NewsItem {
  id: number;
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  time: string;
}

export interface JiraComment {
  id: number;
  author: string;
  content: string;
  time: string;
}
