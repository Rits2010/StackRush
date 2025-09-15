import { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, Zap, CheckCircle, Crown, Shield } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import PortalLayout from '../components/PortalLayout';
import { achievementsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Achievement as ApiAchievement, UserAchievement } from '../types/api';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  category: 'coding' | 'speed' | 'consistency' | 'social' | 'special';
}

// Map API icons to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  'Target': Target,
  'Zap': Zap,
  'Star': Star,
  'Trophy': Trophy,
  'Award': Award,
  'Crown': Crown,
  'Shield': Shield,
  'CheckCircle': CheckCircle,
};

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalXP: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all achievements
        const allAchievements = await achievementsApi.getAllAchievements();
        
        // Fetch user's achievements
        let userAchievements: UserAchievement[] = [];
        if (user) {
          userAchievements = await achievementsApi.getUserAchievements();
        }
        
        // Combine data
        const achievementsData: Achievement[] = allAchievements.map(achievement => {
          const userAchievement = userAchievements.find(ua => ua.achievement._id === achievement._id);
          
          // Map API category to frontend category
          const categoryMap: Record<string, any> = {
            'beginner': 'coding',
            'performance': 'speed',
            'consistency': 'consistency',
            'social': 'social'
          };
          
          // Map API icon to Lucide icon
          let IconComponent = Trophy;
          if (achievement.icon && typeof achievement.icon === 'string' && iconMap[achievement.icon]) {
            IconComponent = iconMap[achievement.icon];
          }
          
          return {
            id: achievement._id,
            title: achievement.name,
            description: achievement.description,
            icon: IconComponent,
            rarity: achievement.rarity,
            progress: userAchievement ? 1 : 0,
            maxProgress: 1,
            unlocked: !!userAchievement,
            unlockedAt: userAchievement?.unlockedAt,
            xpReward: achievement.rewards?.xp || 0,
            category: categoryMap[achievement.category] || 'coding'
          };
        });
        
        setAchievements(achievementsData);
        
        const unlockedCount = achievementsData.filter(a => a.unlocked).length;
        const totalXP = achievementsData.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);
        
        setStats({
          totalAchievements: achievementsData.length,
          unlockedAchievements: unlockedCount,
          totalXP,
          currentStreak: 12 // This would come from user stats API in a real implementation
        });
      } catch (err) {
        console.error('Failed to load achievements:', err);
        setError('Failed to load achievements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAchievements();
  }, [user]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'coding', name: 'Coding', icon: Target },
    { id: 'speed', name: 'Speed', icon: Zap },
    { id: 'consistency', name: 'Consistency', icon: Zap },
    { id: 'social', name: 'Social', icon: Award },
    { id: 'special', name: 'Special', icon: Crown }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading achievements...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Trophy className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Achievements</h3>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your coding journey and unlock rewards</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ProfessionalCard className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unlockedAchievements}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">of {stats.totalAchievements} unlocked</div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalXP}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total XP Earned</div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalAchievements > 0 ? Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
            </ProfessionalCard>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <ProfessionalCard 
                key={achievement.id} 
                className={`p-6 relative overflow-hidden ${
                  achievement.unlocked ? 'opacity-100' : 'opacity-75'
                } ${getRarityBorder(achievement.rarity)} border-2`}
              >
                {/* Rarity Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-5`}></div>
                
                {/* Unlocked Badge */}
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <achievement.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Reward and Rarity */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      +{achievement.xpReward} XP
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  {/* Unlock Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </ProfessionalCard>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AchievementsPage;