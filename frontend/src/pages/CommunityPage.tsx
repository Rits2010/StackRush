import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, MessageSquare, Heart, Share2, Bookmark, TrendingUp, Award, Calendar, Search,
  Code, Download, Github, GitBranch, Copy, Eye, Play, Star, ExternalLink, FileCode,
  Terminal, Settings, Filter, Plus, Upload
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { FrontendPreview } from '../components/FrontendPreview';
import { communityApi } from '../services/api';
import type { CommunityPost as ApiCommunityPost } from '../types/api';

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

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  authorLevel: string;
  createdAt: string;
  category: 'discussion' | 'help' | 'showcase' | 'tips' | 'news' | 'code-share';
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  challengeType?: 'dsa' | 'bug-fix' | 'feature';
  codeSubmission?: CodeSubmission;
}

interface CommunityStats {
  totalMembers: number;
  activeToday: number;
  totalPosts: number;
  totalSolutions: number;
}

const CommunityPage = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState<string | null>(null);
  const [showShareCodeModal, setShowShareCodeModal] = useState(false);
  const [newCodeSubmission, setNewCodeSubmission] = useState<Partial<CodeSubmission>>({
    title: '',
    description: '',
    code: '',
    htmlCode: '',
    cssCode: '',
    jsCode: '',
    language: 'javascript',
    tags: []
  });

  useEffect(() => {
    const loadCommunityPosts = async () => {
      try {
        setIsLoading(true);
        const result = await communityApi.getAllPosts({
          limit: 20
        });
        
        // Transform API posts to component posts
        const transformedPosts: CommunityPost[] = result.data.map((post: any) => ({
          id: post._id,
          title: post.title,
          content: post.content,
          author: post.author?.username || 'Unknown User',
          authorAvatar: post.author?.username?.substring(0, 2).toUpperCase() || 'UU',
          authorLevel: 'Beginner', // Default level
          createdAt: post.createdAt,
          category: post.category,
          tags: post.tags || [],
          likes: post.interactions?.likes || 0,
          comments: post.interactions?.comments || 0,
          isLiked: false, // Default
          isBookmarked: false, // Default
          difficulty: post.metadata?.difficulty || 'Medium',
          challengeType: post.metadata?.challengeType || 'dsa'
        }));
        
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Failed to load community posts:', error);
        // Fallback to mock data
        const mockPosts: CommunityPost[] = [
          {
            id: 'post-001',
            title: 'Efficient Two Sum Algorithm with HashMap Implementation',
            content: 'Here\'s my optimized Two Sum solution that reduces time complexity from O(n²) to O(n) using HashMap. Includes comprehensive test cases and detailed explanation.',
            author: 'Alex Chen',
            authorAvatar: 'AC',
            authorLevel: 'Expert',
            createdAt: '2024-01-20T10:30:00Z',
            category: 'code-share',
            tags: ['algorithms', 'optimization', 'hashmap', 'javascript'],
            likes: 24,
            comments: 8,
            isLiked: false,
            isBookmarked: true,
            difficulty: 'Easy',
            challengeType: 'dsa'
          }
        ];
        setPosts(mockPosts);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCommunityPosts();
  }, []);

  const categories = [
    { id: 'all', name: 'All Posts', icon: MessageSquare },
    { id: 'discussion', name: 'Discussions', icon: Users },
    { id: 'help', name: 'Help & Support', icon: MessageSquare },
    { id: 'showcase', name: 'Showcase', icon: Award },
    { id: 'code-share', name: 'Code Sharing', icon: Code },
    { id: 'tips', name: 'Tips & Tricks', icon: TrendingUp },
    { id: 'news', name: 'News', icon: Calendar }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discussion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'help': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'showcase': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'code-share': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'tips': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'news': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Expert': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'Admin': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleDownloadCode = (codeSubmission: CodeSubmission) => {
    const codeContent = codeSubmission.code || 
      `// HTML
${codeSubmission.htmlCode || ''}

// CSS
${codeSubmission.cssCode || ''}

// JavaScript
${codeSubmission.jsCode || ''}`;
    
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${codeSubmission.title.replace(/\s+/g, '-').toLowerCase()}.${codeSubmission.language === 'react' ? 'jsx' : codeSubmission.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleForkCode = (codeSubmission: CodeSubmission) => {
    // Simulate forking - in real app, this would create a copy for the user
    alert(`Forked ${codeSubmission.title}! Check your profile for the copy.`);
  };

  const handleShareCode = () => {
    if (!newCodeSubmission.title || !newCodeSubmission.description) {
      alert('Please fill in all required fields');
      return;
    }

    const codePost: CommunityPost = {
      id: `post-${Date.now()}`,
      title: newCodeSubmission.title!,
      content: newCodeSubmission.description!,
      author: 'You',
      authorAvatar: 'YU',
      authorLevel: 'Intermediate',
      createdAt: new Date().toISOString(),
      category: 'code-share',
      tags: newCodeSubmission.tags || [],
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
      codeSubmission: {
        id: `code-${Date.now()}`,
        title: newCodeSubmission.title!,
        description: newCodeSubmission.description!,
        code: newCodeSubmission.code!,
        htmlCode: newCodeSubmission.htmlCode,
        cssCode: newCodeSubmission.cssCode,
        jsCode: newCodeSubmission.jsCode,
        language: newCodeSubmission.language!,
        tags: newCodeSubmission.tags || [],
        author: 'You',
        authorAvatar: 'YU',
        authorLevel: 'Intermediate',
        createdAt: new Date().toISOString(),
        likes: 0,
        views: 0,
        downloads: 0,
        forks: 0,
        isLiked: false,
        isBookmarked: false
      }
    };

    setPosts(prev => [codePost, ...prev]);
    setNewCodeSubmission({
      title: '',
      description: '',
      code: '',
      htmlCode: '',
      cssCode: '',
      jsCode: '',
      language: 'javascript',
      tags: []
    });
    setShowShareCodeModal(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'discussed':
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading community...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect, learn, and share with fellow developers</p>
          </div>

          {/* Community Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <ProfessionalCard className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
              </ProfessionalCard>

              <ProfessionalCard className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeToday || '0'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Today</div>
              </ProfessionalCard>

              <ProfessionalCard className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
              </ProfessionalCard>

              <ProfessionalCard className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSolutions?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Solutions Shared</div>
              </ProfessionalCard>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfessionalCard className="p-6 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </ProfessionalCard>

              <ProfessionalCard className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <ProfessionalButton variant="primary" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    New Post
                  </ProfessionalButton>
                  <ProfessionalButton variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Find Mentors
                  </ProfessionalButton>
                  <ProfessionalButton variant="outline" className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    Study Groups
                  </ProfessionalButton>
                </div>
              </ProfessionalCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <ProfessionalCard className="p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search posts, tags, or users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="discussed">Most Discussed</option>
                  </select>
                </div>
              </ProfessionalCard>

              {/* Posts */}
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <ProfessionalCard key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      {/* Author Avatar */}
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {post.authorAvatar}
                      </div>
                      
                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <Link to={`/portal/community/post/${post.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {post.title}
                            </h3>
                          </Link>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-3 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            by <strong>{post.author}</strong>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getLevelColor(post.authorLevel)}`}>
                            {post.authorLevel}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {post.content}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-1 text-sm transition-colors ${
                                post.isLiked 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                            
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.comments}</span>
                            </button>
                            
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors">
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className={`text-sm transition-colors ${
                              post.isBookmarked 
                                ? 'text-yellow-500 hover:text-yellow-600' 
                                : 'text-gray-500 hover:text-yellow-500'
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </ProfessionalCard>
                ))}
              </div>

              {/* Empty State */}
              {filteredPosts.length === 0 && (
                <ProfessionalCard className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || activeCategory !== 'all' 
                      ? 'Try adjusting your search or filters.'
                      : 'Be the first to start a discussion!'
                    }
                  </p>
                  <ProfessionalButton variant="primary">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create New Post
                  </ProfessionalButton>
                </ProfessionalCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default CommunityPage;