import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Zap, Trophy, Star, Code, Users, Target, ArrowRight, AlertCircle } from 'lucide-react';
import { ProfessionalInput } from '../components/ui/ProfessionalInput';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { ChallengeCardSkeleton, StatCardSkeleton } from '../components/ui/SkeletonLoader';
import { challengesApi, usersApi } from '../services/api';
import { getErrorMessage } from '../services/errorHandler';
import type { Challenge, PaginationData } from '../types/api';

const ChallengesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Challenge data from API
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChallenges, setTotalChallenges] = useState(0);
  
  // Platform statistics
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    successRate: 0,
    avgFocusRating: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Load platform statistics
  const loadPlatformStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await usersApi.getPlatformStats();
      setPlatformStats({
        totalUsers: stats.totalUsers || 0,
        successRate: stats.successRate || 0,
        avgFocusRating: stats.avgFocusRating || 0
      });
    } catch (error: any) {
      console.error('Failed to load platform stats:', error);
      // Fallback to default values
      setPlatformStats({
        totalUsers: 12500,
        successRate: 89,
        avgFocusRating: 4.6
      });
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Load challenges from API
  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 12,
      };
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      
      if (selectedDifficulty !== 'all') {
        params.difficulty = selectedDifficulty;
      }
      
      if (sortBy === 'xp') {
        params.sort = 'xp';
        params.order = 'desc';
      } else if (sortBy === 'difficulty') {
        params.sort = 'difficulty';
        params.order = 'desc';
      } else {
        params.sort = 'createdAt';
        params.order = 'desc';
      }
      
      const response: PaginationData<Challenge> = await challengesApi.getChallenges(params);
      
      setChallenges(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setTotalChallenges(response.pagination.total);
      
    } catch (error: any) {
      console.error('Failed to load challenges:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load challenges when filters change
  useEffect(() => {
    loadChallenges();
  }, [currentPage, debouncedSearchTerm, selectedType, selectedDifficulty, sortBy]);
  
  // Load platform statistics on component mount
  useEffect(() => {
    loadPlatformStats();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dsa': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'bug-fix': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'feature': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const filteredChallenges = challenges; // Filtering is now done on the server side

  return (
    <PortalLayout>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-primary">
            Coding Challenges
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose your chaos level and start coding under pressure. Each challenge simulates 
            authentic development scenarios with real-world distractions and team dynamics.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}        

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <ProfessionalCard className="p-6 text-center">
                <Code className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalChallenges}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Challenges</div>
              </ProfessionalCard>
              
              <ProfessionalCard className="p-6 text-center">
                <Users className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{platformStats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Developers</div>
              </ProfessionalCard>
              
              <ProfessionalCard className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{platformStats.successRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </ProfessionalCard>
              
              <ProfessionalCard className="p-6 text-center">
                <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{platformStats.avgFocusRating}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Focus Rating</div>
              </ProfessionalCard>
            </>
          )}
        </div>
        {/* Search and Filters */}
        <ProfessionalCard className="p-6 mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <ProfessionalInput
                label="Search Challenges"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 lg:flex-nowrap">
              <div className="min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Challenge Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="dsa">DSA</option>
                  <option value="bug-fix">Bug Fix</option>
                  <option value="feature">Feature</option>
                </select>
              </div>

              <div className="min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1); // Reset to first page when sort changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="popularity">Newest</option>
                  <option value="xp">XP Reward</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedType !== 'all' || selectedDifficulty !== 'all' || sortBy !== 'popularity') && (
                <div className="flex items-end">
                  <ProfessionalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                      setSelectedDifficulty('all');
                      setSortBy('popularity');
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </ProfessionalButton>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedType !== 'all' || selectedDifficulty !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-400">Active filters:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg border border-purple-500/30">
                    Type: {selectedType}
                  </span>
                )}
                {selectedDifficulty !== 'all' && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                    Difficulty: {selectedDifficulty}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  ({filteredChallenges.length} {filteredChallenges.length === 1 ? 'challenge' : 'challenges'} found)
                </span>
              </div>
            </div>
          )}
        </ProfessionalCard>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
            </>
          ) : (
            filteredChallenges.map((challenge) => (
            <ProfessionalCard
              key={challenge._id}
              className="group cursor-pointer overflow-hidden relative"
              hover={true}
              glow={true}
              onClick={() => navigate(`/portal/challenge/${challenge._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/portal/challenge/${challenge._id}`);
                }
              }}
            >
              {/* Card Header with Gradient Background */}
              <div className={`p-6 pb-4 bg-gradient-to-br ${
                challenge.type === 'dsa' ? 'from-blue-500/10 to-blue-600/5' :
                challenge.type === 'bug-fix' ? 'from-green-500/10 to-green-600/5' :
                'from-purple-500/10 to-purple-600/5'
              } border-b border-gray-700/30`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getTypeColor(challenge.type)}`}>
                        {challenge.type === 'dsa' ? 'DSA' : 
                         challenge.type === 'bug-fix' ? 'Bug Fix' : 
                         challenge.type === 'feature' ? 'Feature' : challenge.type}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                      {challenge.title}
                    </h3>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center text-yellow-400 mb-1">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      <span className="text-sm font-bold">{(challenge.stats?.difficultyRating || 4.5).toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {challenge.stats?.totalAttempts || 0} attempts
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-4">
                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                  {challenge.description}
                </p>

                {/* Category and Tags */}
                <div className="mb-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Category:</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded border">
                    {challenge.category}
                  </div>
                </div>

                {/* Author and Scenario */}
                {challenge.scenario && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Scenario:</div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded border">
                      {challenge.scenario.background}
                    </div>
                  </div>
                )}
              {/* Challenge Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">{challenge.timeLimit} min</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Zap className="h-4 w-4 mr-2 text-orange-400" />
                    <span className="font-medium text-orange-400">
                      {challenge.scenario?.urgency || 'Medium'} Priority
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">{challenge.author.username}</span>
                  </div>
                  <div className="text-blue-400 font-bold text-sm">
                    +{Math.floor((challenge.stats?.averageScore || 50) * 2)} XP
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <Target className="h-4 w-4 mr-2" />
                    <span className="font-medium">Success Rate</span>
                  </div>
                  <div className="text-purple-400 font-bold text-sm">
                    {challenge.stats?.completionRate ? `${(challenge.stats.completionRate * 100).toFixed(1)}%` : 'New'}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {challenge.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50 text-xs rounded-lg font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {challenge.tags.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50 text-xs rounded-lg font-medium">
                    +{challenge.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <ProfessionalButton
                variant="primary"
                className="w-full"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate(`/portal/challenge/${challenge._id}`)}
              >
                View Details
              </ProfessionalButton>
            </div>
            </ProfessionalCard>
          )))}
        </div>

        {/* No Results */}
        {!isLoading && filteredChallenges.length === 0 && (
          <ProfessionalCard className="p-12 text-center">
            <div className="text-gray-700 dark:text-gray-300 text-xl font-bold mb-3">No challenges found</div>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
          </ProfessionalCard>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <ProfessionalButton
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </ProfessionalButton>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <ProfessionalButton
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </ProfessionalButton>
                );
              })}
            </div>
            
            <ProfessionalButton
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </ProfessionalButton>
          </div>
        )}
    </PortalLayout>
  );
};

export default ChallengesPage;