import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, MessageSquare, Share2, Bookmark, Download, Github, 
  ExternalLink, Copy, Eye, Play, Code, Terminal, User, Calendar,
  Star, GitBranch, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalSidebar from '../components/PortalSidebar';
import { FrontendPreview } from '../components/FrontendPreview';
import MonacoEditor from '../components/MonacoEditor';

interface CodeSubmission {
  id: string;
  title: string;
  description: string;
  code: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  language: 'javascript' | 'typescript' | 'python' | 'java' | 'html' | 'css' | 'react';
  tags: string[];
  author: string;
  authorAvatar: string;
  authorLevel: string;
  createdAt: string;
  likes: number;
  views: number;
  downloads: number;
  forks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  githubUrl?: string;
  liveDemo?: string;
  challengeId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<CodeSubmission | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'comments'>('code');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Mock post data - in a real app, this would be an API call
    const mockPost: CodeSubmission = {
      id: postId || '',
      title: 'Interactive React Dashboard with Real-time Updates',
      description: 'Complete React dashboard implementation with Chart.js integration, WebSocket updates, and responsive design.',
      code: '',
      htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>`,
      cssCode: `.dashboard {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4F46E5;
}`,
      jsCode: `function Dashboard() {
  const [stats, setStats] = React.useState({
    users: 1247,
    revenue: 45690,
    growth: 12.5,
    orders: 89
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        users: prev.users + Math.floor(Math.random() * 10),
        revenue: prev.revenue + Math.floor(Math.random() * 1000)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return React.createElement('div', { className: 'dashboard' },
    React.createElement('div', { className: 'dashboard-header' },
      React.createElement('h1', null, 'Analytics Dashboard'),
      React.createElement('p', null, 'Real-time insights and metrics')
    ),
    React.createElement('div', { className: 'stats-grid' },
      React.createElement('div', { className: 'stat-card' },
        React.createElement('h3', null, 'Total Users'),
        React.createElement('p', { className: 'stat-value' }, stats.users.toLocaleString())
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('h3', null, 'Revenue'),
        React.createElement('p', { className: 'stat-value' }, '$' + stats.revenue.toLocaleString())
      )
    )
  );
}

ReactDOM.render(React.createElement(Dashboard), document.getElementById('root'));`,
      language: 'react',
      tags: ['react', 'dashboard', 'charts'],
      author: 'Sarah Kim',
      authorAvatar: 'SK',
      authorLevel: 'Advanced',
      createdAt: '2024-01-20T09:15:00Z',
      likes: 45,
      views: 234,
      downloads: 28,
      forks: 7,
      isLiked: false,
      isBookmarked: false,
      githubUrl: 'https://github.com/sarahkim/react-dashboard',
      difficulty: 'Hard'
    };

    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        author: 'Alex Chen',
        authorAvatar: 'AC',
        content: 'Great work! The real-time updates are smooth. How did you handle the WebSocket connection?',
        createdAt: '2024-01-20T10:30:00Z',
        likes: 5,
        isLiked: false
      }
    ];

    setTimeout(() => {
      setPost(mockPost);
      setComments(mockComments);
      setIsLoading(false);
    }, 1000);
  }, [postId]);

  const handleLike = () => {
    if (!post) return;
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1
    });
  };

  const handleDownload = () => {
    if (!post) return;
    const codeContent = post.language === 'react' || post.htmlCode ? 
      `// HTML\n${post.htmlCode || ''}\n\n// CSS\n${post.cssCode || ''}\n\n// JavaScript\n${post.jsCode || ''}` :
      post.code;
    
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.title.replace(/\s+/g, '-').toLowerCase()}.${post.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunInWebContainer = async () => {
    if (!post) return;
    
    // Navigate to the code runner page with the post data
    navigate(`/portal/code-runner/${post.id}`, {
      state: {
        htmlCode: post.htmlCode || '<!DOCTYPE html>\n<html>\n<head>\n  <title>Code Runner</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
        cssCode: post.cssCode || '/* Add your styles here */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
        jsCode: post.jsCode || '// Add your JavaScript here\nconsole.log("Hello from Code Runner!");',
        title: post.title,
        language: post.language
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <PortalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <PortalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Post not found</h2>
            <Link to="/community">
              <ProfessionalButton variant="primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Community
              </ProfessionalButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/community')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{post.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600">
                      {post.authorLevel}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ProfessionalButton variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </ProfessionalButton>
                
                <ProfessionalButton
                  variant="primary"
                  onClick={handleRunInWebContainer}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Live
                </ProfessionalButton>
                
                {post.githubUrl && (
                  <a href={post.githubUrl} target="_blank" rel="noopener noreferrer">
                    <ProfessionalButton variant="outline">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </ProfessionalButton>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                post.isLiked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {(['code', 'preview', 'comments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              {post.htmlCode && (
                <ProfessionalCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">HTML</h3>
                  <MonacoEditor
                    value={post.htmlCode}
                    onChange={() => {}} // Read-only, no change handler needed
                    language="html"
                    height="200px"
                    readOnly={true}
                  />
                </ProfessionalCard>
              )}
              
              {post.cssCode && (
                <ProfessionalCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CSS</h3>
                  <MonacoEditor
                    value={post.cssCode}
                    onChange={() => {}} // Read-only, no change handler needed
                    language="css"
                    height="300px"
                    readOnly={true}
                  />
                </ProfessionalCard>
              )}
              
              {post.jsCode && (
                <ProfessionalCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">JavaScript</h3>
                  <MonacoEditor
                    value={post.jsCode}
                    onChange={() => {}} // Read-only, no change handler needed
                    language="javascript"
                    height="400px"
                    readOnly={true}
                  />
                </ProfessionalCard>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div>
              {post.htmlCode || post.cssCode || post.jsCode ? (
                <ProfessionalCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Static Preview</h3>
                    <ProfessionalButton
                      variant="primary"
                      onClick={handleRunInWebContainer}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Open in Code Runner
                    </ProfessionalButton>
                  </div>
                  <FrontendPreview
                    htmlCode={post.htmlCode || ''}
                    cssCode={post.cssCode || ''}
                    jsCode={post.jsCode || ''}
                  />
                </ProfessionalCard>
              ) : (
                <div className="text-center py-12">
                  <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Preview Available</h3>
                  <p className="text-gray-600 dark:text-gray-400">This code doesn't support live preview.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              <ProfessionalCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments ({comments.length})</h3>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {comment.authorAvatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ProfessionalCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;