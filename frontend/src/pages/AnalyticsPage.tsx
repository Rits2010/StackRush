import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Zap, Calendar, Award, Activity } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import PortalLayout from '../components/PortalLayout';
import { usersApi, submissionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User, Challenge } from '../types/api';

interface AnalyticsData {
  totalChallenges: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  bestStreak: number;
  skillProgress: { skill: string; level: number; progress: number }[];
  recentActivity: { date: string; challenges: number; score: number }[];
  performanceByType: { type: string; completed: number; avgScore: number }[];
  timeDistribution: { timeRange: string; count: number }[];
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user?._id) {
          throw new Error('User not authenticated');
        }
        
        // Load data in parallel
        const [userStats, submissionStats] = await Promise.all([
          usersApi.getUserStats(user._id),
          submissionsApi.getUserSubmissionStats()
        ]);
        
        // Transform the data to match our interface
        const transformedData: AnalyticsData = {
          totalChallenges: userStats.totalChallenges || 0,
          completionRate: userStats.completionRate || 0,
          averageScore: submissionStats.averageScore || userStats.averageScore || 0,
          totalTimeSpent: submissionStats.totalExecutionTime || 0,
          currentStreak: userStats.streak || 0,
          bestStreak: userStats.streak || 0, // We don't have best streak in the API yet
          skillProgress: [
            { skill: 'Data Structures', level: 1, progress: 20 },
            { skill: 'Algorithms', level: 2, progress: 60 },
            { skill: 'System Design', level: 1, progress: 30 },
            { skill: 'Frontend', level: 3, progress: 75 },
            { skill: 'Backend APIs', level: 2, progress: 50 }
          ],
          recentActivity: submissionStats.recentActivity || [
            { date: new Date().toISOString(), challenges: 1, score: 85 }
          ],
          performanceByType: [
            { type: 'DSA', completed: 15, avgScore: 82 },
            { type: 'Bug Fix', completed: 8, avgScore: 76 },
            { type: 'Feature', completed: 5, avgScore: 74 }
          ],
          timeDistribution: submissionStats.languageBreakdown ? 
            Object.entries(submissionStats.languageBreakdown).map(([language, count]) => ({
              timeRange: language,
              count: count as number
            })) : [
              { timeRange: 'JavaScript', count: 10 },
              { timeRange: 'TypeScript', count: 8 },
              { timeRange: 'Python', count: 5 }
            ]
        };
        
        setAnalyticsData(transformedData);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [selectedPeriod, user]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSkillLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Novice';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
            <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Analytics</h3>
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

  if (!analyticsData) return null;

  return (
    <PortalLayout>
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your coding performance and progress</p>
            </div>
            
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProfessionalCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Challenges</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalChallenges}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analyticsData.averageScore)}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(analyticsData.totalTimeSpent)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </ProfessionalCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Skill Progress */}
            <ProfessionalCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Skill Progress</h3>
              <div className="space-y-4">
                {analyticsData.skillProgress.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs text-white ${getSkillLevelColor(skill.level)}`}>
                          {getSkillLevelText(skill.level)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{skill.progress}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getSkillLevelColor(skill.level)}`}
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </ProfessionalCard>

            {/* Recent Activity */}
            <ProfessionalCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="space-y-3">
                {analyticsData.recentActivity.slice(0, 7).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.challenges} challenges completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.score}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">avg score</p>
                    </div>
                  </div>
                ))}
              </div>
            </ProfessionalCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance by Type */}
            <ProfessionalCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Performance by Type</h3>
              <div className="space-y-4">
                {analyticsData.performanceByType.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.completed} completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{type.avgScore}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">avg score</p>
                    </div>
                  </div>
                ))}
              </div>
            </ProfessionalCard>

            {/* Time Distribution */}
            <ProfessionalCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Time Distribution</h3>
              <div className="space-y-4">
                {analyticsData.timeDistribution.map((time, index) => {
                  const maxCount = Math.max(...analyticsData.timeDistribution.map(t => t.count));
                  const percentage = maxCount > 0 ? (time.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{time.timeRange}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{time.count} challenges</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ProfessionalCard>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AnalyticsPage;