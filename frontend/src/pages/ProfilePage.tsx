import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Trophy, Code, Bug, Zap, Clock, Star, Calendar, 
  Target, BarChart3, Crown, Shield, Briefcase, TrendingUp, 
  Users, Eye, Settings, Share2, Download, Activity, AlertCircle
} from 'lucide-react';
import { ProfessionalCard, StatCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { usersApi } from '../services/api';
import { getErrorMessage } from '../services/errorHandler';
import type { User as UserType, UserStats } from '../types/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await usersApi.getProfile();
        setUserProfile(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Career progression path (this would ideally come from the backend)
  const careerPath = [
    { level: 'Intern', xp: 0, unlocked: true, completed: true },
    { level: 'Junior Developer', xp: 500, unlocked: true, completed: true },
    { level: 'Mid-Level Developer', xp: 1500, unlocked: true, completed: false },
    { level: 'Senior Developer', xp: 3500, unlocked: false, completed: false },
    { level: 'Lead Developer', xp: 6000, unlocked: false, completed: false },
    { level: 'Principal Engineer', xp: 10000, unlocked: false, completed: false }
  ];

  // Sample achievements (this would ideally come from the backend)
  const achievements = [
    {
      id: 1,
      title: 'Bug Hunter',
      description: 'Fixed 25 critical bugs',
      icon: Bug,
      unlocked: true,
      rarity: 'rare',
      unlockedDate: '2024-01-15',
      xp: 100
    },
    {
      id: 2,
      title: 'Focus Master',
      description: 'Maintained 90%+ focus for 10 challenges',
      icon: Zap,
      unlocked: true,
      rarity: 'epic',
      unlockedDate: '2024-01-20',
      xp: 200
    },
    {
      id: 3,
      title: 'Speed Demon',
      description: 'Complete 5 challenges under time limit',
      icon: Clock,
      unlocked: false,
      rarity: 'legendary',
      progress: 3,
      total: 5,
      xp: 300
    },
    {
      id: 4,
      title: 'Code Reviewer',
      description: 'Provided 50 helpful code reviews',
      icon: Eye,
      unlocked: true,
      rarity: 'rare',
      unlockedDate: '2024-01-25',
      xp: 150
    },
    {
      id: 5,
      title: 'Team Player',
      description: 'Completed 10 team challenges',
      icon: Users,
      unlocked: false,
      rarity: 'epic',
      progress: 7,
      total: 10,
      xp: 250
    },
    {
      id: 6,
      title: 'Algorithm Master',
      description: 'Solved 100 DSA challenges',
      icon: Target,
      unlocked: false,
      rarity: 'legendary',
      progress: 47,
      total: 100,
      xp: 500
    }
  ];

  // Sample challenge history (this would ideally come from the backend)
  const challengeHistory = [
    {
      id: 1,
      title: 'Two Sum Under Pressure',
      type: 'DSA',
      difficulty: 'Easy',
      completedAt: '2024-01-28',
      score: 95,
      xp: 50,
      timeSpent: '12m 34s',
      distractionLevel: 'Medium',
      focusRating: 87,
      attempts: 1
    },
    {
      id: 2,
      title: 'Login Bug Crisis',
      type: 'Bug Fix',
      difficulty: 'Medium',
      completedAt: '2024-01-27',
      score: 88,
      xp: 120,
      timeSpent: '28m 15s',
      distractionLevel: 'High',
      focusRating: 82,
      attempts: 2
    },
    {
      id: 3,
      title: 'API Integration Hell',
      type: 'Feature',
      difficulty: 'Medium',
      completedAt: '2024-01-26',
      score: 92,
      xp: 150,
      timeSpent: '35m 42s',
      distractionLevel: 'High',
      focusRating: 89,
      attempts: 1
    },
    {
      id: 4,
      title: 'Binary Tree Nightmare',
      type: 'DSA',
      difficulty: 'Hard',
      completedAt: '2024-01-25',
      score: 78,
      xp: 180,
      timeSpent: '42m 18s',
      distractionLevel: 'Medium',
      focusRating: 75,
      attempts: 3
    },
    {
      id: 5,
      title: 'CSS Layout Disaster',
      type: 'Bug Fix',
      difficulty: 'Easy',
      completedAt: '2024-01-24',
      score: 96,
      xp: 75,
      timeSpent: '18m 22s',
      distractionLevel: 'Low',
      focusRating: 94,
      attempts: 1
    }
  ];

  // Stats (this would ideally come from the backend)
  const stats = [
    {
      icon: Trophy,
      label: 'Total XP',
      value: userProfile?.stats?.xp?.toString() || '0',
      change: '+120 this week',
      changeType: 'positive' as const,
      color: 'yellow' as const
    },
    {
      icon: Code,
      label: 'Challenges Completed',
      value: userProfile?.stats?.completedChallenges?.toString() || '0',
      change: '+3 this week',
      changeType: 'positive' as const,
      color: 'blue' as const
    },
    {
      icon: Bug,
      label: 'Bugs Fixed',
      value: '28',
      change: '+5 this week',
      changeType: 'positive' as const,
      color: 'red' as const
    },
    {
      icon: Zap,
      label: 'Average Focus',
      value: '87%',
      change: '+2% this week',
      changeType: 'positive' as const,
      color: 'green' as const
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'challenges', label: 'Challenge History', icon: Code },
    { id: 'stats', label: 'Statistics', icon: BarChart3 }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 'from-blue-600 to-blue-700';
      case 'epic': return 'from-purple-600 to-purple-700';
      case 'legendary': return 'from-orange-600 to-orange-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border-green-200 dark:border-green-400/20';
      case 'Medium': return 'text-yellow-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20';
      case 'Hard': return 'text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
      default: return 'text-gray-800 dark:text-muted-foreground bg-muted border-border';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DSA': return 'text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 border-blue-200 dark:border-blue-400/20';
      case 'Bug Fix': return 'text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
      case 'Feature': return 'text-purple-800 dark:text-purple-400 bg-purple-100 dark:bg-purple-400/10 border-purple-200 dark:border-purple-400/20';
      default: return 'text-gray-800 dark:text-muted-foreground bg-muted border-border';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Career Progression */}
            <ProfessionalCard className="p-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center">
                <Briefcase className="h-6 w-6 mr-3 text-blue-400" />
                Career Progression
              </h3>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold text-black dark:text-white">
                      {userProfile?.profile?.firstName ? `${userProfile.profile.firstName} ${userProfile.profile.lastName || ''}` : userProfile?.username || 'User'}
                    </div>
                    <div className="text-black/80 dark:text-white/80">
                      Level {userProfile?.stats?.level || 1} Developer
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400 dark:text-blue-200">
                      {userProfile?.stats?.xp || 0} XP
                    </div>
                    <div className="text-sm text-black/80 dark:text-white/80">
                      {userProfile?.stats?.xp ? 1500 - userProfile.stats.xp : 1500} XP to next level
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((userProfile?.stats?.xp || 0) / 1500) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-black/80 dark:text-white/80">
                  {Math.round(((userProfile?.stats?.xp || 0) / 1500) * 100)}% to Level {userProfile?.stats?.level ? userProfile.stats.level + 1 : 2} Developer
                </div>
              </div>

              <div className="space-y-4">
                {careerPath.map((level, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      level.completed 
                        ? 'bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' 
                        : level.unlocked 
                        ? 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' 
                        : 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-600/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        level.completed 
                          ? 'bg-green-500' 
                          : level.unlocked 
                          ? 'bg-blue-500' 
                          : 'bg-gray-400 dark:bg-gray-600'
                      }`}>
                        {level.completed ? (
                          <Trophy className="h-5 w-5 text-black dark:text-foreground" />
                        ) : level.unlocked ? (
                          <Crown className="h-5 w-5 text-black dark:text-foreground" />
                        ) : (
                          <Shield className="h-5 w-5 text-black dark:text-foreground" />
                        )}
                      </div>
                      <div>
                        <div className={`font-bold ${level.unlocked ? 'text-black dark:text-white' : 'text-gray-700 dark:text-white/70'}`}>
                          {level.level}
                        </div>
                        <div className="text-sm text-black/80 dark:text-white/80">
                          {level.xp} XP required
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      level.completed 
                        ? 'text-green-400' 
                        : level.unlocked 
                        ? 'text-blue-400' 
                        : 'text-gray-500 dark:text-white/70'
                    }`}>
                      {level.completed ? 'Completed' : level.unlocked ? 'Current' : 'Locked'}
                    </div>
                  </div>
                ))}
              </div>
            </ProfessionalCard>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  change={stat.change}
                  changeType={stat.changeType}
                  color={stat.color}
                />
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <ProfessionalCard
                key={achievement.id}
                className={`p-6 transition-all duration-200 ${
                  achievement.unlocked ? 'hover:border-blue-500/50' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)}`}>
                    <achievement.icon className="h-6 w-6 text-black dark:text-white" />
                  </div>
                  {achievement.unlocked && (
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  )}
                </div>
                
                <h3 className={`font-bold text-lg mb-2 ${
                  achievement.unlocked ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-400'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className="text-sm text-black/80 dark:text-white/80 mb-4 leading-relaxed">
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-black dark:text-white`}>
                    {achievement.rarity}
                  </span>
                  <div className="text-right">
                    <div className="text-blue-400 dark:text-blue-200 font-bold text-sm">+{achievement.xp} XP</div>
                    {achievement.unlocked ? (
                      <div className="text-xs text-black/80 dark:text-white/80">{achievement.unlockedDate}</div>
                    ) : achievement.progress !== undefined ? (
                      <div className="text-xs text-black/80 dark:text-white/80">{achievement.progress}/{achievement.total}</div>
                    ) : null}
                  </div>
                </div>
                
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-4">
                    <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </ProfessionalCard>
            ))}
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-6">
            {challengeHistory.map((challenge) => (
              <ProfessionalCard key={challenge.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-black dark:text-white mb-2 text-lg">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getTypeColor(challenge.type)} dark:text-white`}>
                        {challenge.type}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(challenge.difficulty)} dark:text-white`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-black dark:text-white">{challenge.completedAt}</span>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-black dark:text-white mb-1">
                      {challenge.score}%
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                      +{challenge.xp} XP
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-black/80 dark:text-white/80">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{challenge.timeSpent}</span>
                  </div>
                  <div className="flex items-center text-black/80 dark:text-white/80">
                    <Zap className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                    <span>{challenge.distractionLevel} Chaos</span>
                  </div>
                  <div className="flex items-center text-black/80 dark:text-white/80">
                    <Target className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
                    <span>{challenge.focusRating}% Focus</span>
                  </div>
                  <div className="flex items-center text-black/80 dark:text-white/80">
                    <Activity className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                    <span>{challenge.attempts} Attempt{challenge.attempts > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </ProfessionalCard>
            ))}
          </div>
        );

      case 'stats':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProfessionalCard className="p-8">
              <h3 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Performance Breakdown
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-black/80 dark:text-white/80">DSA Challenges</span>
                    <span className="text-black dark:text-white font-bold">23 completed</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '49%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-black/80 dark:text-white/80">Bug Fixes</span>
                    <span className="text-black dark:text-white font-bold">15 completed</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-black/80 dark:text-white/80">Feature Development</span>
                    <span className="text-black dark:text-white font-bold">9 completed</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '19%' }}></div>
                  </div>
                </div>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-8">
              <h3 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Improvement Areas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-black/80 dark:text-white/80">Time Management</span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/80 dark:text-white/80">Code Quality</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">Excellent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/80 dark:text-white/80">Distraction Handling</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Very Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/80 dark:text-white/80">Problem Solving</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">Excellent</span>
                </div>
              </div>
            </ProfessionalCard>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-medium">Failed to load profile</p>
            <p>{error}</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <ProfessionalCard className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-foreground font-bold text-2xl shadow-xl">
                {userProfile?.profile?.firstName?.charAt(0) || userProfile?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                  {userProfile?.profile?.firstName ? `${userProfile.profile.firstName} ${userProfile.profile.lastName || ''}` : userProfile?.username || 'User'}
                </h1>
                <p className="text-blue-400 font-medium mb-2">@{userProfile?.username || 'username'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(userProfile?.createdAt || '').toLocaleDateString() || 'Unknown'}
                  </span>
                  {userProfile?.profile?.location && (
                    <span>{userProfile.profile.location}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex gap-3">
              <ProfessionalButton variant="outline" icon={Share2} size="sm">
                Share Profile
              </ProfessionalButton>
              <ProfessionalButton variant="outline" icon={Download} size="sm">
                Export Stats
              </ProfessionalButton>
              <ProfessionalButton 
                variant="primary" 
                icon={Settings} 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                Edit Profile
              </ProfessionalButton>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-black/80 dark:text-gray-300 leading-relaxed mb-4">
              {userProfile?.profile?.bio || 'No bio available.'}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-black/70 dark:text-gray-400">
              {userProfile?.profile?.company && (
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {userProfile.profile.company}
                </span>
              )}
              <span className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                Level {userProfile?.stats?.level || 1} Developer
              </span>
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {userProfile?.stats?.xp || 0} XP
              </span>
            </div>
          </div>
        </ProfessionalCard>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </PortalLayout>
  );
};

export default ProfilePage;