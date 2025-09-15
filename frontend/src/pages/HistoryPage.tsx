import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Search, Calendar, Code, Bug, Briefcase } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { submissionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Submission, Challenge } from '../types/api';

interface HistoryEntry {
  id: string;
  challengeId: string;
  title: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'completed' | 'failed' | 'timeout';
  score: number;
  timeSpent: number; // in minutes
  completedAt: string;
  mode: 'standard' | 'interview' | 'zen';
  distractionLevel: 'low' | 'medium' | 'high';
}

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user?._id) {
          throw new Error('User not authenticated');
        }
        
        // Load submissions from API
        const result = await submissionsApi.getUserSubmissions({
          page,
          limit: 20,
          sort: 'createdAt',
          order: 'desc'
        });
        
        // Transform submissions to history entries
        const historyEntries: HistoryEntry[] = result.data.map((submission: Submission) => {
          // Extract challenge information
          const challenge = submission.challenge as Challenge;
          
          // Calculate time spent in minutes
          const timeSpentMs = submission.execution.executionTime || 0;
          const timeSpentMinutes = Math.round(timeSpentMs / 60000);
          
          return {
            id: submission._id,
            challengeId: typeof submission.challenge === 'string' ? submission.challenge : submission.challenge._id,
            title: typeof submission.challenge === 'string' ? 'Unknown Challenge' : submission.challenge.title,
            type: challenge?.type || 'dsa',
            difficulty: challenge?.difficulty || 'Medium',
            status: submission.execution.status,
            score: submission.execution.score || 0,
            timeSpent: timeSpentMinutes,
            completedAt: submission.createdAt,
            mode: submission.simulation?.mode || 'standard',
            distractionLevel: submission.simulation?.distractionLevel || 'medium'
          };
        });
        
        // For pagination, we would append to existing data
        // For now, we'll just set the data
        setHistory(historyEntries);
        setFilteredHistory(historyEntries);
        setHasMore(result.pagination.hasNext);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError('Failed to load challenge history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [page, user]);

  useEffect(() => {
    let filtered = history;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'score':
          return b.score - a.score;
        case 'time':
          return a.timeSpent - b.timeSpent;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, statusFilter, typeFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dsa':
        return <Code className="h-4 w-4" />;
      case 'bug-fix':
        return <Bug className="h-4 w-4" />;
      case 'feature':
        return <Briefcase className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Hard':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const loadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading && history.length === 0) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
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
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading History</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Challenge History</h1>
            <p className="text-gray-600 dark:text-gray-400">Review your past challenges and track your progress</p>
          </div>

          {/* Filters and Search */}
          <ProfessionalCard className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="timeout">Timeout</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="dsa">DSA</option>
                <option value="bug-fix">Bug Fix</option>
                <option value="feature">Feature</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="time">Sort by Time</option>
                <option value="title">Sort by Title</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                {filteredHistory.length} of {history.length} challenges
              </div>
            </div>
          </ProfessionalCard>

          {/* History List */}
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <ProfessionalCard key={entry.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(entry.status)}
                    </div>

                    {/* Challenge Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {entry.title}
                        </h3>
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          {getTypeIcon(entry.type)}
                          <span className="text-sm capitalize">{entry.type.replace('-', ' ')}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(entry.difficulty)}`}>
                          {entry.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(entry.completedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(entry.timeSpent)}</span>
                        </div>
                        <div>
                          <span className="capitalize">{entry.mode} mode</span>
                        </div>
                        <div>
                          <span className="capitalize">{entry.distractionLevel} distractions</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score and Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                        {entry.score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Score
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <ProfessionalButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to challenge detail
                          window.location.href = `/portal/challenge/${entry.challengeId}`;
                        }}
                      >
                        View
                      </ProfessionalButton>
                      
                      {entry.status === 'completed' && (
                        <ProfessionalButton
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            // Navigate to retry challenge
                            window.location.href = `/portal/simulation/${entry.challengeId}?mode=${entry.mode}&type=${entry.type}`;
                          }}
                        >
                          Retry
                        </ProfessionalButton>
                      )}
                    </div>
                  </div>
                </div>
              </ProfessionalCard>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <ProfessionalButton
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </ProfessionalButton>
            </div>
          )}

          {/* Empty State */}
          {filteredHistory.length === 0 && (
            <ProfessionalCard className="p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No challenges found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start solving challenges to build your history!'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <ProfessionalButton
                  variant="primary"
                  onClick={() => window.location.href = '/portal/challenges'}
                >
                  Browse Challenges
                </ProfessionalButton>
              )}
            </ProfessionalCard>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default HistoryPage;