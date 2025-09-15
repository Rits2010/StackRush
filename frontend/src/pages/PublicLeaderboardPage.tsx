import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Trophy, Star, Lock, ArrowRight } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';

const PublicLeaderboardPage = () => {
  const navigate = useNavigate();

  const topPerformers = [
    { 
      rank: 1, 
      name: 'CodeMaster2024', 
      xp: 15420, 
      avatar: 'CM', 
      level: 'Principal Engineer',
      challengesCompleted: 234,
      focusRating: 94,
      streak: 45,
      badges: ['🏆', '🔥', '⚡']
    },
    { 
      rank: 2, 
      name: 'BugSlayer', 
      xp: 14890, 
      avatar: 'BS', 
      level: 'Lead Developer',
      challengesCompleted: 198,
      focusRating: 91,
      streak: 32,
      badges: ['🐛', '🎯', '💎']
    },
    { 
      rank: 3, 
      name: 'AlgoNinja', 
      xp: 14250, 
      avatar: 'AN', 
      level: 'Lead Developer',
      challengesCompleted: 187,
      focusRating: 89,
      streak: 28,
      badges: ['🥷', '🧠', '⚡']
    },
    { 
      rank: 4, 
      name: 'ReactQueen', 
      xp: 13780, 
      avatar: 'RQ', 
      level: 'Senior Developer',
      challengesCompleted: 165,
      focusRating: 92,
      streak: 41,
      badges: ['👑', '⚛️', '🔥']
    },
    { 
      rank: 5, 
      name: 'FullStackHero', 
      xp: 12950, 
      avatar: 'FS', 
      level: 'Senior Developer',
      challengesCompleted: 156,
      focusRating: 88,
      streak: 19,
      badges: ['🦸', '🌟', '💻']
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500 to-yellow-600';
      case 2: return 'from-gray-400 to-gray-500';
      case 3: return 'from-orange-500 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-primary">Top Performers</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            See how the best developers handle coding chaos. These are the legends who've mastered 
            the art of programming under pressure.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-blue-300 font-medium">
              🔒 Want to compete and see your ranking? 
              <span className="block mt-2">
                <ProfessionalButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Join the Competition
                </ProfessionalButton>
              </span>
            </p>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {topPerformers.slice(0, 3).map((user) => (
            <ProfessionalCard
              key={user.rank}
              className={`p-8 text-center relative overflow-hidden ${
                user.rank === 1 ? 'ring-2 ring-yellow-500/50' : ''
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute top-4 right-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${getRankColor(user.rank)}`}>
                  {user.rank}
                </div>
              </div>

              {/* Rank Icon */}
              <div className="text-6xl mb-4">
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                {user.avatar}
              </div>

              {/* User Info */}
              <h3 className="text-xl font-bold text-white mb-2">{user.name}</h3>
              <p className="text-blue-400 font-medium mb-4">{user.level}</p>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">XP</span>
                  <span className="text-white font-bold">{user.xp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Challenges</span>
                  <span className="text-white font-bold">{user.challengesCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Focus</span>
                  <span className="text-green-400 font-bold">{user.focusRating}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Streak</span>
                  <span className="text-orange-400 font-bold">{user.streak} days</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex justify-center space-x-2">
                {user.badges.map((badge, index) => (
                  <span key={index} className="text-2xl">{badge}</span>
                ))}
              </div>
            </ProfessionalCard>
          ))}
        </div>

        {/* Full Leaderboard Preview */}
        <ProfessionalCard className="p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-yellow-400" />
            Global Rankings Preview
          </h2>
          
          <div className="space-y-4 mb-8">
            {topPerformers.map((user) => (
              <div 
                key={user.rank} 
                className="flex items-center justify-between p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/30 transition-all duration-200"
              >
                <div className="flex items-center space-x-6">
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${getRankColor(user.rank)}`}>
                      {user.rank}
                    </div>
                    {getRankIcon(user.rank) && (
                      <span className="text-2xl">{getRankIcon(user.rank)}</span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white">{user.name}</div>
                      <div className="text-sm text-gray-400 mb-1">{user.level}</div>
                      <div className="flex items-center space-x-2">
                        {user.badges.map((badge, index) => (
                          <span key={index} className="text-lg">{badge}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{user.xp.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{user.challengesCompleted}</div>
                    <div className="text-xs text-gray-400">Challenges</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{user.focusRating}%</div>
                    <div className="text-xs text-gray-400">Focus</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{user.streak}</div>
                    <div className="text-xs text-gray-400">Streak</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Locked Content Indicator */}
          <div className="text-center p-8 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">More Rankings Available</h3>
            <p className="text-gray-500 mb-4">
              See the full leaderboard, your position, and compete with developers worldwide
            </p>
            <ProfessionalButton
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/signup')}
            >
              Unlock Full Leaderboard
            </ProfessionalButton>
          </div>
        </ProfessionalCard>

        {/* CTA Section */}
        <div className="text-center">
          <ProfessionalCard className="p-12">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">
              Think You Can Make It to the Top?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the competition and prove your skills. Climb the ranks, earn badges, 
              and become a coding chaos legend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ProfessionalButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Start Competing
              </ProfessionalButton>
              <ProfessionalButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Login to Continue
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        </div>
      </div>
    </div>
  );
};

export default PublicLeaderboardPage;