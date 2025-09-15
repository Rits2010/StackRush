import { useState, useEffect } from 'react';
import { Code, Download, Star, Eye, GitFork, Search, RefreshCw } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { templatesApi } from '../services/api';
import type { Template } from '../types/api';

interface TemplateState {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  language: string;
  framework?: string;
  category: 'algorithm' | 'data-structure' | 'web-dev' | 'mobile' | 'backend' | 'devops';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  stars: number;
  downloads: number;
  forks: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  isStarred: boolean;
  codePreview: string;
  fileCount: number;
  size: string;
}

const PublicTemplatesPage = () => {
  const [templates, setTemplates] = useState<TemplateState[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateState[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load templates from API
      const result = await templatesApi.getAllTemplates({
        limit: 50
      });
      
      // Transform API templates to UI templates
      const transformedTemplates: TemplateState[] = result.data.map((template: Template) => {
        // Get first few lines of code as preview
        const codePreview = template.code.jsCode || template.code.htmlCode || template.code.cssCode || 'No code available';
        const previewLines = codePreview.split('\n').slice(0, 5).join('\n');
        
        return {
          id: template._id,
          title: template.title,
          description: template.description,
          author: template.author.username,
          authorAvatar: template.author.username.charAt(0).toUpperCase(),
          language: template.code.language,
          framework: template.code.framework,
          category: template.metadata.category,
          difficulty: template.metadata.difficulty,
          tags: template.metadata.tags || [],
          stars: template.stats.stars,
          downloads: template.stats.downloads,
          forks: template.stats.forks,
          views: 0, // Not in API yet
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          isStarred: false, // Would need user-specific data for this
          codePreview: previewLines,
          fileCount: 1, // Simplified for now
          size: 'Unknown' // Would need to calculate from actual code
        };
      });
      
      setTemplates(transformedTemplates);
      setFilteredTemplates(transformedTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        template.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(template => template.language === selectedLanguage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.stars - a.stars;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, selectedLanguage, sortBy]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'algorithm', name: 'Algorithms' },
    { id: 'data-structure', name: 'Data Structures' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'backend', name: 'Backend' },
    { id: 'devops', name: 'DevOps' }
  ];

  const languages = [
    { id: 'all', name: 'All Languages' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'angular', name: 'Angular' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'algorithm': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'data-structure': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'web-dev': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'mobile': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'backend': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'devops': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleStar = (templateId: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { 
            ...template, 
            isStarred: !template.isStarred, 
            stars: template.isStarred ? template.stars - 1 : template.stars + 1 
          }
        : template
    ));
  };

  if (isLoading && templates.length === 0) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Code className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading templates...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Code className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Templates</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadTemplates}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Public Templates</h1>
              <p className="text-gray-600 dark:text-gray-400">Discover and use community-contributed code templates</p>
            </div>
            
            <ProfessionalButton variant="primary">
              <Code className="h-4 w-4 mr-2" />
              Submit Template
            </ProfessionalButton>
          </div>

          {/* Filters */}
          <ProfessionalCard className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {languages.map(language => (
                  <option key={language.id} value={language.id}>{language.name}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="popular">Most Popular</option>
                <option value="downloads">Most Downloaded</option>
                <option value="recent">Recently Updated</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                {filteredTemplates.length} templates found
              </div>
            </div>
          </ProfessionalCard>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <ProfessionalCard key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {template.authorAvatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.author}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.language}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStar(template.id)}
                    className={`transition-colors ${
                      template.isStarred 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`h-5 w-5 ${template.isStarred ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {template.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Tags and Category */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                  {template.framework && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {template.framework}
                    </span>
                  )}
                </div>

                {/* Code Preview */}
                <div className="bg-gray-900 text-gray-300 p-3 rounded-lg mb-4 text-xs font-mono overflow-hidden">
                  <pre className="whitespace-pre-wrap">{template.codePreview}</pre>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{template.stars}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{template.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="h-4 w-4" />
                      <span>{template.forks}</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    {template.fileCount} files • {template.size}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <ProfessionalButton variant="primary" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Use Template
                  </ProfessionalButton>
                  <ProfessionalButton variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </ProfessionalButton>
                  <ProfessionalButton variant="outline" size="sm">
                    <GitFork className="h-4 w-4" />
                  </ProfessionalButton>
                </div>

                {/* Updated Date */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </ProfessionalCard>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <ProfessionalCard className="p-12 text-center">
              <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Be the first to contribute a template!'
                }
              </p>
              <ProfessionalButton variant="primary">
                <Code className="h-4 w-4 mr-2" />
                Submit Your Template
              </ProfessionalButton>
            </ProfessionalCard>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default PublicTemplatesPage;