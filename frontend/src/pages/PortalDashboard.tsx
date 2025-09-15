import { Trophy, Code, Bug, Zap, Clock, TrendingUp, Calendar, ArrowRight, Target, BarChart3, Activity, Flame, Crown } from 'lucide-react';
import { ProfessionalCard, StatCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { useAuth } from '../context/AuthContext';
import PortalLayout from '../components/PortalLayout';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import type { DashboardData, RecentActivity } from '../types/api';

const PortalDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await usersApi.getDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  interface QuickAction {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    action: () => void;
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Start New Challenge',
      description: 'Begin a fresh coding challenge',
      icon: Code,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/portal/challenges')
    },
    {
      title: 'Continue Learning',
      description: 'Resume your last challenge or start where you left off',
      icon: Code,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/portal/challenge/current')
    },
    {
      title: 'View Progress',
      description: 'Check your detailed stats and achievements',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/portal/profile')
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <PortalLayout>
        <div className="space-y-12">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-4">
                  <span className="text-gray-900 dark:text-white">Loading dashboard...</span>
                </h1>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <ProfessionalCard key={i} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </ProfessionalCard>
            ))}
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PortalLayout>
        <div className="space-y-12">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-4">
                  <span className="text-red-600 dark:text-red-400">Error loading dashboard</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Use dashboard data or fallback to auth user data
  const userData = dashboardData || {
    profile: user?.profile || {},
    stats: user?.stats || {},
    recentActivity: [],
    streak: 0,
    rank: 0,
    focusRating: 0,
    focusAnalysis: {
      averageFocus: 0,
      bestStreak: 0,
      distractionResistance: 'Fair'
    },
    codingStats: {
      linesOfCode: 0,
      bugsFixed: 0,
      codeQuality: 'F'
    },
    weeklyStats: {
      xpGained: 0,
      challengesCompleted: 0,
      rankChange: 0
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-12">
        {/* Welcome Header */}
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-4">
                  <span className="text-gray-900 dark:text-white">Welcome back, </span>
                  <span className="text-purple-600 dark:text-purple-400">{userData.profile?.firstName || user?.username || 'Developer'}</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ready to face some coding chaos today? Your focus is at an all-time high! 
                  Let's see what challenges await you.
                </p>
              </div>
              <div className="hidden md:block">
                <ProfessionalCard className="p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {userData.profile?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-gray-900 dark:text-white font-bold">Level {userData.stats?.level || user?.stats?.level || 1}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">{(userData.stats?.xp || user?.stats?.xp || 0).toLocaleString()} XP</div>
                </ProfessionalCard>
              </div>
            </div>
          </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <ProfessionalCard
              key={index}
              className="p-6 cursor-pointer group hover:scale-105 transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              onClick={action.action}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
              </div>
            </ProfessionalCard>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            icon={Trophy}
            label="Total XP"
            value={(userData.stats?.xp || user?.stats?.xp || 0).toLocaleString()}
            change={`+${userData.weeklyStats?.xpGained || 0} this week`}
            changeType="positive"
            color="purple"
          />
          <StatCard
            icon={Code}
            label="Challenges Completed"
            value={(userData.stats?.completedChallenges || user?.stats?.completedChallenges || 0).toString()}
            change={`+${userData.weeklyStats?.challengesCompleted || 0} this week`}
            changeType="positive"
            color="green"
          />
          <StatCard
            icon={Bug}
            label="Bugs Fixed"
            value={(userData.codingStats?.bugsFixed || 0).toString()}
            change={`+${userData.weeklyStats?.challengesCompleted || 0} this week`}
            changeType="positive"
            color="orange"
          />
          <StatCard
            icon={Zap}
            label="Focus Rating"
            value={`${userData.focusRating || 0}%`}
            change={`+${userData.weeklyStats?.rankChange || 0}% this week`}
            changeType="positive"
            color="cyan"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ProfessionalCard className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-purple-600 dark:text-purple-400" />
                  Recent Activity
                </h2>
                <ProfessionalButton 
                  variant="outline" 
                  size="sm" 
                  icon={ArrowRight} 
                  iconPosition="right"
                  onClick={() => navigate('/portal/profile')}
                >
                  View All
                </ProfessionalButton>
              </div>
              
              <div className="space-y-6">
                {userData.recentActivity && userData.recentActivity.length > 0 ? (
                  userData.recentActivity.map((activity: RecentActivity, index: number) => (
                    <ProfessionalCard
                      key={index}
                      className="p-6 hover:border-purple-500/30 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                            {activity.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {activity.completedAt}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                              activity.type === 'dsa' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                              activity.type === 'bug-fix' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                            }`}>
                              {activity.type === 'dsa' ? 'DSA' : activity.type === 'bug-fix' ? 'Bug Fix' : 'Feature'}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                              activity.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              activity.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {activity.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {activity.score}%
                          </div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            +{activity.xp} XP
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {activity.timeSpent}
                          </span>
                          <span className="flex items-center">
                            <Zap className="h-4 w-4 mr-1 text-orange-400" />
                            {activity.distractionLevel.charAt(0).toUpperCase() + activity.distractionLevel.slice(1)} Chaos
                          </span>
                        </div>
                        <div className="text-green-400 font-medium">
                          Completed
                        </div>
                      </div>
                    </ProfessionalCard>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No recent activity yet. Complete some challenges to see your progress here!
                  </div>
                )}
              </div>
            </ProfessionalCard>
          </div>

          {/* Quick Stats */}
          <div className="space-y-8">
            {/* Current Streak */}
            <ProfessionalCard className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Flame className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{userData.streak || 0} Day Streak</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Keep the momentum going!</p>
              <div className="text-sm text-orange-300">
                🔥 You're on fire! Don't break the chain.
              </div>
            </ProfessionalCard>

            {/* Leaderboard Position */}
            <ProfessionalCard className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                Your Rank
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">#{userData.rank || 0}</div>
                <div className="text-gray-600 dark:text-gray-400">Global Position</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">XP</span>
                  <span className="text-gray-900 dark:text-white font-bold">{(userData.stats?.xp || user?.stats?.xp || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Focus</span>
                  <span className="text-green-400 font-bold">{userData.focusRating || 0}%</span>
                </div>
              </div>
              <ProfessionalButton 
                variant="outline" 
                className="w-full mt-6"
                onClick={() => navigate('/portal/leaderboard')}
              >
                View Full Leaderboard
              </ProfessionalButton>
            </ProfessionalCard>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfessionalCard className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Focus Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average Focus</span>
                <span className="text-gray-900 dark:text-white font-bold">{userData.focusAnalysis?.averageFocus || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Best Streak</span>
                <span className="text-green-400 font-bold">{userData.focusAnalysis?.bestStreak || 0} challenges</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Distraction Resistance</span>
                <span className="text-yellow-400 font-bold">{userData.focusAnalysis?.distractionResistance || 'Fair'}</span>
              </div>
            </div>
          </ProfessionalCard>

          <ProfessionalCard className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-400" />
              Coding Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Lines of Code</span>
                <span className="text-gray-900 dark:text-white font-bold">{userData.codingStats?.linesOfCode?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bugs Fixed</span>
                <span className="text-red-400 font-bold">{userData.codingStats?.bugsFixed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Code Quality</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{userData.codingStats?.codeQuality || 'F'}</span>
              </div>
            </div>
          </ProfessionalCard>

          <ProfessionalCard className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
              This Week
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">XP Gained</span>
                <span className="text-green-400 font-bold">+{userData.weeklyStats?.xpGained || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Challenges</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">+{userData.weeklyStats?.challengesCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Rank Change</span>
                <span className="text-green-400 font-bold">
                  {userData.weeklyStats?.rankChange ? 
                    (userData.weeklyStats.rankChange > 0 ? `↑ ${userData.weeklyStats.rankChange}` : `↓ ${Math.abs(userData.weeklyStats.rankChange)}`) : 
                    '0'}
                </span>
              </div>
            </div>
          </ProfessionalCard>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalDashboard;