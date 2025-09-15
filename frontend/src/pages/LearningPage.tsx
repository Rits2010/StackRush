import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Play, Star, Clock, Users, ChevronRight, 
  Search, Code, Zap, Target, Award, Download, 
  CheckCircle2, Crown, Layers, Database, Globe, Server, AlertCircle, RefreshCw
} from 'lucide-react';
import PortalLayout from '../components/PortalLayout';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { learningApi, templatesApi } from '../services/api';
import type { LearningPlaylist, Template } from '../types/api';



const LearningPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'playlists' | 'templates' | 'scratch'>('playlists');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<LearningPlaylist[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Load learning content from API
  const loadLearningContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (activeTab === 'playlists') {
        try {
          const playlistsData = await learningApi.getAllPlaylists({ limit: 20 });
          setPlaylists(playlistsData.data?.data || []);
        } catch (error: any) {
          console.warn('Learning API not available yet, using fallback data');
          // Fallback to mock data while API is not implemented
          setPlaylists([
            {
              _id: '1',
              title: 'React Fundamentals Bootcamp',
              description: 'Master React from scratch with hands-on projects and real-world examples.',
              metadata: {
                category: 'programming',
                difficulty: 'Beginner',
                duration: 480, // 8 hours
                lessonCount: 24
              },
              instructor: {
                _id: 'instructor1',
                username: 'sarah_chen'
              },
              stats: {
                enrollments: 1247,
                completions: 623,
                rating: 4.8
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: '2',
              title: 'Full-Stack JavaScript Developer',
              description: 'Complete journey from frontend to backend using modern JavaScript.',
              metadata: {
                category: 'programming',
                difficulty: 'Intermediate',
                duration: 720, // 12 hours
                lessonCount: 48
              },
              instructor: {
                _id: 'instructor2',
                username: 'mike_johnson'
              },
              stats: {
                enrollments: 856,
                completions: 428,
                rating: 4.9
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
        }
      } else if (activeTab === 'templates') {
        try {
          const templatesData = await templatesApi.getAllTemplates({ limit: 20 });
          setTemplates(templatesData.data?.data || []);
        } catch (error: any) {
          console.warn('Templates API not available yet, using fallback data');
          // Fallback to mock data while API is not implemented
          setTemplates([
            {
              _id: '1',
              title: 'Modern React Dashboard',
              description: 'Clean admin dashboard with React, Tailwind CSS, and Chart.js',
              author: {
                _id: 'author1',
                username: 'ui_masters'
              },
              metadata: {
                category: 'web-dev',
                difficulty: 'Intermediate',
                tags: ['Dashboard', 'Charts', 'Responsive']
              },
              stats: {
                stars: 342,
                downloads: 1547,
                forks: 89
              },
              code: {
                htmlCode: '<div class="dashboard">React Dashboard Template</div>',
                cssCode: '.dashboard { padding: 20px; }',
                jsCode: 'function Dashboard() { return <div>Dashboard</div>; }',
                language: 'react',
                framework: 'React'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: '2',
              title: 'Next.js E-commerce Starter',
              description: 'Complete e-commerce solution with payments and admin panel',
              author: {
                _id: 'author2',
                username: 'commerce_dev'
              },
              metadata: {
                category: 'web-dev',
                difficulty: 'Advanced',
                tags: ['E-commerce', 'Stripe', 'Authentication']
              },
              stats: {
                stars: 256,
                downloads: 892,
                forks: 45
              },
              code: {
                htmlCode: '<div class="ecommerce">Next.js E-commerce Template</div>',
                cssCode: '.ecommerce { padding: 20px; }',
                jsCode: 'function Ecommerce() { return <div>E-commerce</div>; }',
                language: 'typescript',
                framework: 'Next.js'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (error: any) {
      console.error('Failed to load learning content:', error);
      setError('Failed to load learning content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLearningContent();
  }, [activeTab]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'React': return <Code className="h-4 w-4 text-blue-500" />;
      case 'Next.js': return <Layers className="h-4 w-4 text-black dark:text-white" />;
      case 'Node.js': return <Server className="h-4 w-4 text-green-500" />;
      case 'Vue': return <Zap className="h-4 w-4 text-green-600" />;
      case 'Angular': return <Target className="h-4 w-4 text-red-500" />;
      case 'Express': return <Database className="h-4 w-4 text-gray-600" />;
      case 'Vanilla': return <Globe className="h-4 w-4 text-orange-500" />;
      default: return <Code className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleStartPlaylist = (playlistId: string) => {
    navigate(`/portal/learning/playlist/${playlistId}`);
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/portal/code-runner/template/${templateId}`);
  };

  const handleStartFromScratch = (framework: string) => {
    navigate(`/portal/code-runner/new?framework=${framework}`);
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading learning content...</p>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Learning Hub</h1>
                <p className="text-gray-600 dark:text-gray-400">Master new skills with curated playlists and ready-to-use templates</p>
              </div>
              {activeTab !== 'scratch' && (
                <ProfessionalButton
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={loadLearningContent}
                  disabled={isLoading}
                  className={isLoading ? 'animate-spin' : ''}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </ProfessionalButton>
              )}
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            {[
              { id: 'playlists', label: 'Learning Playlists', icon: BookOpen },
              { id: 'templates', label: 'Templates', icon: Code },
              { id: 'scratch', label: 'Start from Scratch', icon: Zap }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          {activeTab !== 'scratch' && (
            <ProfessionalCard className="p-6 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </ProfessionalCard>
          )}

          {/* Content */}
          {activeTab === 'playlists' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoading ? (
                // Loading skeleton
                [...Array(4)].map((_, i) => (
                  <ProfessionalCard key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                    </div>
                  </ProfessionalCard>
                ))
              ) : playlists.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No learning playlists available yet.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back soon for new content!</p>
                </div>
              ) : (
                playlists.map(playlist => (
                  <ProfessionalCard key={playlist._id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{playlist.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{playlist.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.floor(playlist.metadata.duration / 60)}h {playlist.metadata.duration % 60}m</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{playlist.metadata.lessonCount} lessons</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{playlist.stats.enrollments}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(playlist.metadata.difficulty)}`}>
                            {playlist.metadata.difficulty}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{playlist.stats.rating}</span>
                          </div>
                        </div>

                        {/* Show completion rate */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                            <span className="font-medium">{Math.round((playlist.stats.completions / playlist.stats.enrollments) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.round((playlist.stats.completions / playlist.stats.enrollments) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Category tag */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                            {playlist.metadata.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">by {playlist.instructor.username}</span>
                      <ProfessionalButton
                        variant="primary"
                        onClick={() => handleStartPlaylist(playlist._id)}
                        className="flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Learning</span>
                      </ProfessionalButton>
                    </div>
                  </ProfessionalCard>
                ))
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                [...Array(6)].map((_, i) => (
                  <ProfessionalCard key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                    </div>
                  </ProfessionalCard>
                ))
              ) : templates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No templates available yet.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back soon for new templates!</p>
                </div>
              ) : (
                templates.map(template => (
                  <ProfessionalCard key={template._id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Code className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{template.metadata.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(template.metadata.difficulty)}`}>
                        {template.metadata.difficulty}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{template.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.metadata.tags?.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Modern Architecture</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Production Ready</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Best Practices</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{template.stats.downloads}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{template.stats.stars}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{template.stats.forks}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">by {template.author.username}</span>
                      <ProfessionalButton
                        variant="primary"
                        onClick={() => handleUseTemplate(template._id)}
                        className="flex items-center space-x-2"
                      >
                        <Code className="h-4 w-4" />
                        <span>Use Template</span>
                      </ProfessionalButton>
                    </div>
                  </ProfessionalCard>
                ))
              )}
            </div>
          )}

          {activeTab === 'scratch' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  framework: 'React',
                  icon: <Code className="h-12 w-12 text-blue-500" />,
                  description: 'Build interactive user interfaces with React components and hooks',
                  features: ['Component-based', 'Virtual DOM', 'Hooks', 'State Management']
                },
                {
                  framework: 'Next.js',
                  icon: <Layers className="h-12 w-12 text-black dark:text-white" />,
                  description: 'Full-stack React framework with SSR, SSG, and API routes',
                  features: ['Server Rendering', 'Static Generation', 'API Routes', 'File Routing']
                },
                {
                  framework: 'Node.js',
                  icon: <Server className="h-12 w-12 text-green-500" />,
                  description: 'Server-side JavaScript runtime for building scalable applications',
                  features: ['REST APIs', 'Express.js', 'Database Integration', 'Authentication']
                },
                {
                  framework: 'Vue',
                  icon: <Zap className="h-12 w-12 text-green-600" />,
                  description: 'Progressive framework for building user interfaces',
                  features: ['Reactive Data', 'Single File Components', 'Vue Router', 'Vuex']
                },
                {
                  framework: 'Vanilla JS',
                  icon: <Globe className="h-12 w-12 text-orange-500" />,
                  description: 'Pure JavaScript without any frameworks or libraries',
                  features: ['DOM Manipulation', 'ES6+', 'Web APIs', 'Modern JavaScript']
                }
              ].map(item => (
                <ProfessionalCard key={item.framework} className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.framework}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm text-center">{item.description}</p>
                    
                    <div className="space-y-2 w-full">
                      {item.features.map(feature => (
                        <div key={feature} className="flex items-center space-x-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <ProfessionalButton
                      variant="primary"
                      onClick={() => handleStartFromScratch(item.framework)}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Start Project</span>
                    </ProfessionalButton>
                  </div>
                </ProfessionalCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default LearningPage;