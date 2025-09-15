import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Code, Bug, Zap, Clock, TrendingUp, Star, Calendar, ArrowRight, Target, Users, Award, BarChart3, Activity, Flame, Crown, AlertCircle, RefreshCw } from 'lucide-react';
import { ProfessionalCard, StatCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../context/AuthContext';
import { usersApi, submissionsApi, achievementsApi, challengesApi } from '../services/api';
import { getErrorMessage } from '../services/errorHandler';
import type { User, Submission, UserAchievement, Challenge } from '../types/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [userStats, setUserStats] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [popularChallenges, setPopularChallenges] = useState<Challenge[]>([]);
  
  // Load all dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?._id) {
        throw new Error('User not authenticated');
      }
      
      // Load data in parallel
      const [
        statsResult,
        submissionsResult,
        achievementsResult,
        leaderboardResult,
        challengesResult
      ] = await Promise.allSettled([
        usersApi.getUserStats(user._id),
        submissionsApi.getUserSubmissions({ limit: 5, status: 'completed' }),
        achievementsApi.getUserAchievements(),
        usersApi.getLeaderboard({ type: 'xp', limit: 5 }),
        challengesApi.getPopularChallenges(5)
      ]);
      
      // Handle results
      if (statsResult.status === 'fulfilled') {
        setUserStats(statsResult.value);
      } else {
        console.error('Failed to load user stats:', statsResult.reason);
      }
      
      if (submissionsResult.status === 'fulfilled') {
        setRecentSubmissions(submissionsResult.value.data || []);
      } else {
        console.error('Failed to load submissions:', submissionsResult.reason);
      }
      
      if (achievementsResult.status === 'fulfilled') {
        setUserAchievements(achievementsResult.value);
      } else {
        console.error('Failed to load achievements:', achievementsResult.reason);
      }
      
      if (leaderboardResult.status === 'fulfilled') {
        setLeaderboardData(leaderboardResult.value);
      } else {
        console.error('Failed to load leaderboard:', leaderboardResult.reason);
      }
      
      if (challengesResult.status === 'fulfilled') {
        setPopularChallenges(challengesResult.value);
      } else {
        console.error('Failed to load popular challenges:', challengesResult.reason);
      }
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
      
      // Set up auto-refresh every 5 minutes
      const interval = setInterval(() => {
        loadDashboardData();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Utility functions
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dsa': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'bug-fix': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'feature': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PortalLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-bold">
              <span className="text-white">Welcome back, </span>
              <span className="text-gradient-primary">{user?.profile?.firstName || user?.username || 'Developer'}</span>
            </h1>
            <ProfessionalButton
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadDashboardData}
              disabled={isLoading}
              className={isLoading ? 'animate-spin' : ''}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </ProfessionalButton>
          </div>
          <p className="text-xl text-gray-300 leading-relaxed">
            Ready to face some coding chaos today? Your focus is at an all-time high! 
            Let's see what challenges await you.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            icon={Trophy}
            label="Total XP"
            value={userStats?.xp?.toLocaleString() || '0'}
            change={`Level ${userStats?.level || 1}`}
            changeType="positive"
            color="yellow"
          />
          <StatCard
            icon={Code}
            label="Challenges Completed"
            value={userStats?.completedChallenges?.toString() || '0'}
            change={`${((userStats?.completionRate || 0) * 100).toFixed(1)}% success rate`}
            changeType="positive"
            color="blue"
          />
          <StatCard
            icon={Activity}
            label="Current Streak"
            value={userStats?.streak?.toString() || '0'}
            change="days active"
            changeType="positive"
            color="red"
          />
          <StatCard
            icon={Zap}
            label="Average Score"
            value={`${(userStats?.averageScore || 0).toFixed(1)}%`}
            change="across all challenges"
            changeType="positive"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <ProfessionalCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <Code className="h-6 w-6 mr-3 text-blue-400" />
                  Recent Submissions
                </h2>
                <ProfessionalButton 
                  variant="outline" 
                  size="sm" 
                  icon={ArrowRight} 
                  iconPosition="right"
                  onClick={() => navigate('/portal/history')}
                >
                  View All
                </ProfessionalButton>
              </div>
              
              <div className="space-y-6">
                {recentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No submissions yet. Start coding!</p>
                    <ProfessionalButton 
                      variant="primary" 
                      className="mt-4"
                      onClick={() => navigate('/portal/challenges')}
                    >
                      Browse Challenges
                    </ProfessionalButton>
                  </div>
                ) : (
                  recentSubmissions.slice(0, 3).map((submission, index) => {
                    const challenge = typeof submission.challenge === 'object' ? submission.challenge : null;
                    return (
                      <ProfessionalCard
                        key={index}
                        className="p-6 hover:border-blue-500/30"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-2 text-lg">
                              {challenge?.title || 'Challenge'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(submission.createdAt).toLocaleDateString()}
                              </span>
                              {challenge && (
                                <>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getTypeColor(challenge.type)}`}>
                                    {challenge.type.toUpperCase()}
                                  </span>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                                    {challenge.difficulty}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-white mb-1">
                              {submission.execution.score || 0}%
                            </div>
                            <div className="text-sm text-blue-400 font-medium">
                              {submission.language}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-4">
                            {submission.execution.executionTime && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(submission.execution.executionTime)}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              {submission.execution.passedTests || 0}/{submission.execution.totalTests || 0} tests
                            </span>
                          </div>
                          <div className={`font-medium ${getStatusColor(submission.execution.status)}`}>
                            {submission.execution.status}
                          </div>
                        </div>
                      </ProfessionalCard>
                    );
                  })
                )}
              </div>
            </ProfessionalCard>
          </div>

          {/* Achievements */}
          <div>
            <ProfessionalCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <Trophy className="h-6 w-6 mr-3 text-yellow-400" />
                  Achievements
                </h2>
                <ProfessionalButton 
                  variant="outline" 
                  size="sm" 
                  icon={ArrowRight} 
                  iconPosition="right"
                  onClick={() => navigate('/portal/achievements')}
                >
                  View All
                </ProfessionalButton>
              </div>
              
              <div className="space-y-6">
                {userAchievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No achievements yet. Keep coding!</p>
                  </div>
                ) : (
                  userAchievements.slice(0, 3).map((userAchievement, index) => {
                    const achievement = userAchievement.achievement;
                    return (
                      <ProfessionalCard
                        key={index}
                        className="p-6 transition-all duration-200 hover:border-blue-500/50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-yellow-500/20">
                            <Trophy className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold mb-2 text-lg text-white">
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                achievement.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }`}>
                                {achievement.rarity}
                              </span>
                              {userAchievement.unlockedAt && (
                                <span className="text-xs text-gray-400">
                                  Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        </div>
                      </ProfessionalCard>
                    );
                  })
                )}
              </div>
            </ProfessionalCard>
          </div>
        </div>

        {/* Leaderboard and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Leaderboard Position */}
          <ProfessionalCard className="p-8">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Crown className="h-6 w-6 mr-3 text-yellow-400" />
              Top Performers
            </h2>
            
            <div className="space-y-4">
              {leaderboardData.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              ) : (
                leaderboardData.map((leaderUser, index) => {
                  const isCurrentUser = leaderUser._id === user?._id;
                  const rank = index + 1;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                        isCurrentUser 
                          ? 'bg-blue-500/20 border border-blue-500/30' 
                          : 'bg-gray-800/30 hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          rank === 1 ? 'bg-yellow-500 text-black' :
                          rank === 2 ? 'bg-gray-400 text-black' :
                          rank === 3 ? 'bg-orange-500 text-black' :
                          isCurrentUser ? 'bg-blue-500 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {rank}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {(leaderUser.username || '').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-bold ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                            {isCurrentUser ? `${leaderUser.username} (You)` : leaderUser.username}
                          </div>
                          <div className="text-sm text-gray-400">
                            {(leaderUser.stats?.xp || 0).toLocaleString()} XP
                          </div>
                        </div>
                      </div>
                      {rank <= 3 && (
                        <div className="text-2xl">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <ProfessionalButton 
                variant="outline" 
                className="w-full" 
                icon={Trophy}
                onClick={() => navigate('/portal/leaderboard')}
              >
                View Full Leaderboard
              </ProfessionalButton>
            </div>
          </ProfessionalCard>

          {/* Popular Challenges */}
          <ProfessionalCard className="p-8">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-green-400" />
              Popular Challenges
            </h2>
            
            <div className="space-y-4">
              {popularChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Loading popular challenges...</p>
                </div>
              ) : (
                popularChallenges.map((challenge, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-xl transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/portal/challenge/${challenge._id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {challenge.title}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${getTypeColor(challenge.type)}`}>
                            {challenge.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <ProfessionalButton 
                variant="outline" 
                className="w-full" 
                icon={Code}
                onClick={() => navigate('/portal/challenges')}
              >
                Browse All Challenges
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfessionalCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-400" />
              Your Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Level</span>
                <span className="text-white font-bold">{userStats?.level || 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total XP</span>
                <span className="text-green-400 font-bold">{userStats?.xp?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completion Rate</span>
                <span className="text-yellow-400 font-bold">{((userStats?.completionRate || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </ProfessionalCard>

          <ProfessionalCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-400" />
              Coding Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Challenges Done</span>
                <span className="text-white font-bold">{userStats?.completedChallenges || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Score</span>
                <span className="text-red-400 font-bold">{(userStats?.averageScore || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Active</span>
                <span className="text-blue-400 font-bold">
                  {userStats?.lastActiveDate ? 
                    new Date(userStats.lastActiveDate).toLocaleDateString() : 
                    'Today'
                  }
                </span>
              </div>
            </div>
          </ProfessionalCard>

          <ProfessionalCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-400" />
              Current Streak
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">{userStats?.streak || 0}</div>
              <div className="text-gray-400 mb-4">Days Active</div>
              <div className="text-sm text-gray-500">
                {(userStats?.streak || 0) > 0 ? "Keep going! You're on fire 🔥" : "Start your coding streak!"}
              </div>
            </div>
          </ProfessionalCard>
        </div>
      </div>
    </PortalLayout>
  );
};

export default DashboardPage;