import React, { useState, useEffect } from 'react';
import { 
  Trophy, Crown, Medal, Star, TrendingUp, Users, Target, 
  Zap, Code, Bug, Briefcase, Award, ChevronDown, ChevronUp,
  Filter, Search, Calendar, BarChart3, User, Shield, Flame,
  Clock, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalSidebar from '../components/PortalSidebar';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User as UserType } from '../types/api';

interface LeaderboardEntry {
  _id: string;
  username: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  stats?: {
    level?: number;
    xp?: number;
    completedChallenges?: number;
    streak?: number;
  };
  rank?: number;
}

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'DSA' | 'Bug Fix' | 'Feature'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'xp' | 'challenges' | 'score' | 'streak'>('xp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data from API
  const loadLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Map frontend sort values to backend API values
      let apiSortType: 'xp' | 'streak' | 'level' | 'completed' = 'xp';
      if (sortBy === 'challenges') {
        apiSortType = 'completed';
      } else if (sortBy === 'xp' || sortBy === 'streak' || sortBy === 'score') {
        // For score, we'll use xp as the closest available option
        apiSortType = sortBy === 'xp' ? 'xp' : sortBy === 'streak' ? 'streak' : 'xp';
      }
      
      const data = await usersApi.getLeaderboard({
        type: apiSortType,
        limit: 100 // Get more users for better leaderboard
      });
      
      // Add rank to each user and format the data
      const formattedData = data.map((userEntry: UserType, index: number) => ({
        _id: userEntry._id,
        username: userEntry.username,
        profile: userEntry.profile,
        stats: userEntry.stats,
        rank: index + 1
      }));
      
      setLeaderboardData(formattedData);
    } catch (error: any) {
      console.error('Failed to load leaderboard:', error);
      setError('Failed to load leaderboard data. Please try again later.');
      // Keep empty array as fallback
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or sort changes
  useEffect(() => {
    loadLeaderboardData();
  }, [sortBy]);

  // Helper function to get user's full name or fallback to username
  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.profile?.firstName && entry.profile?.lastName) {
      return `${entry.profile.firstName} ${entry.profile.lastName}`;
    }
    return entry.username;
  };

  // Helper function to get user initials
  const getUserInitials = (entry: LeaderboardEntry) => {
    if (entry.profile?.firstName && entry.profile?.lastName) {
      return `${entry.profile.firstName.charAt(0)}${entry.profile.lastName.charAt(0)}`.toUpperCase();
    }
    return entry.username.charAt(0).toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400 fill-current" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400 fill-current" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600 fill-current" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) {
      return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    } else if (level >= 5) {
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    } else {
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  };

  const getLevelName = (level: number) => {
    if (level >= 10) return 'Senior Developer';
    if (level >= 5) return 'Mid-Level Developer';
    return 'Junior Developer';
  };

  const filteredData = leaderboardData
    .filter(entry => {
      if (searchQuery && !entry.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !getDisplayName(entry).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Note: Category filter would need to be implemented with additional user metadata
      // For now, we'll ignore category filter since it's not in the API response
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'xp':
          return ((a.stats?.xp || 0) - (b.stats?.xp || 0)) * multiplier;
        case 'challenges':
          return ((a.stats?.completedChallenges || 0) - (b.stats?.completedChallenges || 0)) * multiplier;
        case 'streak':
          return ((a.stats?.streak || 0) - (b.stats?.streak || 0)) * multiplier;
        default:
          return 0;
      }
    });

  // Update the user stats card to use real data
  const currentUserData = user ? leaderboardData.find(entry => entry._id === user._id) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <PortalSidebar />
      <div className="ml-72">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Leaderboard
                    </h1>
                    <div className="flex items-center space-x-2 mt-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live Rankings</span>
                    </div>
                  </div>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                  Compete with developers worldwide, showcase your skills, and climb the ranks in our global coding community
                </p>
              </div>
              
              {/* Enhanced User Stats Card - Using real data */}
              {currentUserData && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 min-w-[320px] relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                          {getUserInitials(currentUserData)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{getDisplayName(currentUserData)}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                            <Code className="h-3 w-3 mr-1" />
                            {getLevelName(currentUserData.stats?.level || 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 text-center border border-blue-200 dark:border-blue-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Trophy className="h-5 w-5 text-blue-500 mr-1" />
                          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">#{currentUserData.rank}</span>
                        </div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Global Rank</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 rounded-2xl p-4 text-center border border-emerald-200 dark:border-emerald-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Zap className="h-5 w-5 text-emerald-500 mr-1" />
                          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{(currentUserData.stats?.xp || 0).toLocaleString()}</span>
                        </div>
                        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total XP</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 text-center border border-purple-200 dark:border-purple-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Target className="h-5 w-5 text-purple-500 mr-1" />
                          <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{currentUserData.stats?.completedChallenges || 0}</span>
                        </div>
                        <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Challenges</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 rounded-2xl p-4 text-center border border-orange-200 dark:border-orange-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Flame className="h-5 w-5 text-orange-500 mr-1" />
                          <span className="text-3xl font-black text-orange-600 dark:text-orange-400">{currentUserData.stats?.streak || 0}</span>
                        </div>
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Day Streak</div>
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Level Progress</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: '72%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">2,800 XP to Mid-Level Developer</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters & Search</h3>
                <div className="flex-1"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {filteredData.length} results
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Search Developers
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search by username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Time Period
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="month">This Month</option>
                      <option value="week">This Week</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Category
                  </label>
                  <div className="relative group">
                    <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as any)}
                      className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      <option value="DSA">DSA</option>
                      <option value="Bug Fix">Bug Fix</option>
                      <option value="Feature">Feature</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Sort By
                  </label>
                  <div className="flex space-x-3">
                    <div className="relative flex-1 group">
                      <BarChart3 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 cursor-pointer"
                      >
                        <option value="xp">XP</option>
                        <option value="challenges">Challenges</option>
                        <option value="score">Score</option>
                        <option value="streak">Streak</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className="px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group"
                      title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
                    >
                      {sortOrder === 'desc' ? 
                        <ArrowDown className="h-5 w-5 group-hover:text-blue-500 transition-colors" /> : 
                        <ArrowUp className="h-5 w-5 group-hover:text-blue-500 transition-colors" />
                      }
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Active Filters Display */}
              {(searchQuery || timeFilter !== 'all' || categoryFilter !== 'all') && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Active filters:
                    </span>
                    {searchQuery && (
                      <span className="inline-flex items-center bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-xl text-sm font-medium border border-blue-200 dark:border-blue-700">
                        <Search className="h-3 w-3 mr-1" />
                        "{searchQuery}"
                      </span>
                    )}
                    {timeFilter !== 'all' && (
                      <span className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 text-emerald-800 dark:text-emerald-300 px-3 py-2 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeFilter === 'month' ? 'This Month' : 'This Week'}
                      </span>
                    )}
                    {categoryFilter !== 'all' && (
                      <span className="inline-flex items-center bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-300 px-3 py-2 rounded-xl text-sm font-medium border border-purple-200 dark:border-purple-700">
                        <Target className="h-3 w-3 mr-1" />
                        {categoryFilter}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setTimeFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Top 3 Podium */}
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white">Top Performers</h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                The elite developers leading the pack with exceptional skills and dedication
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {filteredData.slice(0, 3).map((entry, index) => {
                const podiumHeight = index === 0 ? 'h-40' : index === 1 ? 'h-32' : 'h-24';
                const podiumColor = index === 0 ? 'from-yellow-400 via-yellow-500 to-orange-500' : 
                                  index === 1 ? 'from-gray-400 via-gray-500 to-gray-600' : 
                                  'from-amber-500 via-amber-600 to-orange-500';
                const podiumGlow = index === 0 ? 'shadow-yellow-500/50' : 
                                 index === 1 ? 'shadow-gray-500/50' : 
                                 'shadow-amber-500/50';
                
                return (
                  <div 
                    key={entry._id}
                    className={`relative ${
                      index === 0 ? 'md:order-2 transform md:scale-110' : 
                      index === 1 ? 'md:order-1' : 'md:order-3'
                    }`}
                  >
                    {/* Enhanced Podium Base */}
                    <div className={`${podiumHeight} bg-gradient-to-t ${podiumColor} rounded-t-2xl mb-6 flex items-end justify-center pb-6 shadow-2xl ${podiumGlow} relative overflow-hidden`}>
                      {/* Podium Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      
                      <div className="relative text-white font-black text-2xl flex items-center space-x-2">
                        {getRankIcon(entry.rank || index + 1)}
                        <span>#{entry.rank || index + 1}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Winner Card */}
                    <ProfessionalCard className={`p-8 text-center relative overflow-hidden transform hover:scale-105 transition-all duration-500 ${
                      index === 0 ? 'ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-500/25' : 
                      index === 1 ? 'ring-2 ring-gray-400/50 shadow-xl shadow-gray-500/25' :
                      'ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/25'
                    } hover:shadow-3xl`}>
                      {/* Enhanced Background Effects */}
                      <div className={`absolute inset-0 opacity-10 ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        'bg-gradient-to-br from-amber-500 to-amber-700'
                      }`}></div>
                      
                      {/* Animated particles for winner */}
                      {index === 0 && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <div className="absolute top-8 right-6 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
                          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
                        </div>
                      )}
                      
                      {/* Crown/Medal for top position */}
                      {index === 0 && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-2xl ring-4 ring-yellow-200 animate-pulse">
                            <Crown className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="relative">
                        <div className="mb-6 pt-2">
                          <div className="flex justify-center">
                            {getRankIcon(entry.rank || index + 1)}
                          </div>
                        </div>
                        
                        <div className="relative mb-6">
                          <div className={`w-28 h-28 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl ring-4 transform hover:scale-110 transition-transform duration-300 ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 ring-yellow-200 shadow-yellow-500/50' :
                            index === 1 ? 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 ring-gray-200 shadow-gray-500/50' :
                            'bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 ring-amber-200 shadow-amber-500/50'
                          }`}>
                            {getUserInitials(entry)}
                          </div>
                          {/* Status indicator */}
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">
                          {getDisplayName(entry)}
                        </h3>
                        
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 mb-6 ${getLevelColor(entry.stats?.level || 1)}`}>
                          <Star className="h-4 w-4 mr-2" />
                          {getLevelName(entry.stats?.level || 1)}
                        </div>
                        
                        {/* Enhanced Performance Metrics */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 border-2 border-blue-200 dark:border-blue-700/50 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                              <Zap className="h-5 w-5 text-blue-500 mr-2" />
                              <div className="font-black text-blue-600 dark:text-blue-400 text-xl">
                                {(entry.stats?.xp || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-blue-700 dark:text-blue-300">Total XP</div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 rounded-2xl p-4 border-2 border-emerald-200 dark:border-emerald-700/50 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                              <TrendingUp className="h-5 w-5 text-emerald-500 mr-2" />
                              <div className="font-black text-emerald-600 dark:text-emerald-400 text-xl">
                                N/A
                              </div>
                            </div>
                            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Avg Score</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-700/50 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                              <Target className="h-5 w-5 text-purple-500 mr-2" />
                              <div className="font-black text-purple-600 dark:text-purple-400 text-xl">
                                {entry.stats?.completedChallenges || 0}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-purple-700 dark:text-purple-300">Challenges</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 rounded-2xl p-4 border-2 border-orange-200 dark:border-orange-700/50 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                              <Flame className="h-5 w-5 text-orange-500 mr-2" />
                              <div className="font-black text-orange-600 dark:text-orange-400 text-xl">
                                {entry.stats?.streak || 0}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-orange-700 dark:text-orange-300">Day Streak</div>
                          </div>
                        </div>
                        
                        {/* Enhanced Top Badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                          <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow">
                            <Award className="h-3 w-3 mr-1" />
                            Top Performer
                          </span>
                        </div>
                      </div>
                    </ProfessionalCard>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Full Leaderboard */}
            <ProfessionalCard className="overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 p-8 border-b-2 border-gray-200 dark:border-gray-600">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                        Complete Rankings
                      </h2>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {filteredData.length} developers competing • Updated in real-time
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {filteredData.length} results
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>Rank</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Developer</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Level</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>Experience</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>Challenges</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Avg Score</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Flame className="h-4 w-4" />
                          <span>Streak</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>Achievements</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-700">
                    {filteredData.map((entry, index) => {
                      const isCurrentUser = user && entry._id === user._id;
                      return (
                        <tr 
                          key={entry._id} 
                          className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 hover:shadow-lg ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-l-8 border-gradient-to-b border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' 
                              : index % 2 === 0 
                                ? 'bg-white dark:bg-gray-800' 
                                : 'bg-gray-50/50 dark:bg-gray-800/50'
                          }`}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center">
                              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg shadow-lg transition-transform group-hover:scale-110 ${
                                (entry.rank || index + 1) <= 3 ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-yellow-500/50' : 
                                'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-200'
                              }`}>
                                {(entry.rank || index + 1) <= 3 ? getRankIcon(entry.rank || index + 1) : `#${entry.rank || index + 1}`}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-5">
                              <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                                  {getUserInitials(entry)}
                                </div>
                                {isCurrentUser && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="font-black text-gray-900 dark:text-white text-xl">
                                    {getDisplayName(entry)}
                                  </div>
                                  {isCurrentUser && (
                                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white text-sm px-3 py-1 rounded-xl font-bold shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-blue-400 flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                                    <Code className="h-4 w-4" />
                                    <span className="text-sm font-bold">{getLevelName(entry.stats?.level || 1)}</span>
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Level {entry.stats?.level || 1}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center px-4 py-3 rounded-2xl text-sm font-black border-2 shadow-lg transition-all duration-300 group-hover:scale-105 ${getLevelColor(entry.stats?.level || 1)}`}>
                              <Star className="h-4 w-4 mr-2" />
                              {getLevelName(entry.stats?.level || 1)}
                            </span>
                          </td>
                          
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                                <Zap className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-black text-gray-900 dark:text-white text-xl">
                                  {(entry.stats?.xp || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total XP</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                                <Target className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-black text-gray-900 dark:text-white text-xl">
                                  {entry.stats?.completedChallenges || 0}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Completed</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-black text-green-600 dark:text-green-400 text-xl">
                                  N/A
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Average</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                                <Flame className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-black text-gray-900 dark:text-white text-xl">
                                  {entry.stats?.streak || 0}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Days</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-8 py-6">
                            <div className="flex space-x-2">
                              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                                <Award className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex -space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">1</div>
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">2</div>
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">3</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredData.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No developers found</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Try adjusting your filters or search terms to find more developers.
                  </p>
                  <div className="mt-6">
                    <ProfessionalButton
                      onClick={() => {
                        setSearchQuery('');
                        setTimeFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="px-6 py-3"
                    >
                      Clear all filters
                    </ProfessionalButton>
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading leaderboard data...</p>
                </div>
              )}
            </ProfessionalCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
