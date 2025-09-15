import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Star, ArrowRight, Lock } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';

const PublicChallengesPage = () => {
  const navigate = useNavigate();

  const sampleChallenges = [
    {
      id: 1,
      title: 'Two Sum Under Pressure',
      type: 'DSA',
      difficulty: 'Easy',
      timeLimit: '15 mins',
      distractionLevel: 'Medium',
      description: 'Solve the classic Two Sum problem while dealing with Slack notifications and a stressed manager.',
      tags: ['Array', 'Hash Table', 'Interview Prep'],
      rating: 4.8,
      completions: 1247,
      xp: 50,
      isLocked: false
    },
    {
      id: 2,
      title: 'Login Bug Crisis',
      type: 'Bug Fix',
      difficulty: 'Medium',
      timeLimit: '30 mins',
      distractionLevel: 'High',
      description: 'Fix a critical login bug while QA keeps finding edge cases and the client is losing patience.',
      tags: ['Authentication', 'React', 'Critical Bug'],
      rating: 4.6,
      completions: 892,
      xp: 120,
      isLocked: false
    },
    {
      id: 3,
      title: 'Feature Sprint Chaos',
      type: 'Feature',
      difficulty: 'Hard',
      timeLimit: '60 mins',
      distractionLevel: 'Extreme',
      description: 'Build a complete user dashboard feature while handling scope changes and system outages.',
      tags: ['Full Stack', 'Dashboard', 'Sprint Planning'],
      rating: 4.9,
      completions: 456,
      xp: 200,
      isLocked: true
    },
    {
      id: 4,
      title: 'Binary Tree Nightmare',
      type: 'DSA',
      difficulty: 'Hard',
      timeLimit: '45 mins',
      distractionLevel: 'Medium',
      description: 'Traverse a binary tree while your mom calls and the office coffee machine breaks down.',
      tags: ['Tree', 'Recursion', 'Algorithm'],
      rating: 4.7,
      completions: 623,
      xp: 180,
      isLocked: true
    }
  ];

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
      case 'DSA': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Bug Fix': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Feature': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getDistractionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Sample Challenges
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Get a taste of what awaits you in the chaos. These sample challenges show the variety 
            of coding scenarios you'll face once you join our platform.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              🔒 Want to unlock all challenges and track your progress? 
              <span className="block mt-3">
                <ProfessionalButton 
                  variant="primary" 
                  size="md"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up Now
                </ProfessionalButton>
              </span>
            </p>
          </div>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleChallenges.map((challenge) => (
            <ProfessionalCard
              key={challenge.id}
              className={`p-6 group cursor-pointer relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 ${
                challenge.isLocked ? 'opacity-60' : ''
              }`}
              hover={!challenge.isLocked}
            >
              {challenge.isLocked && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-3 transition-colors duration-200 ${
                    challenge.isLocked 
                      ? 'text-gray-400' 
                      : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>
                    {challenge.title}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(challenge.type)}`}>
                      {challenge.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-500 mb-1">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    <span className="text-sm font-bold">{challenge.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {challenge.completions} completed
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {challenge.description}
              </p>

              {/* Challenge Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center mr-2">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm">{challenge.timeLimit}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-2">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${getDistractionColor(challenge.distractionLevel)}`}>
                      {challenge.distractionLevel} Chaos
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">XP Reward</div>
                  <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    +{challenge.xp} XP
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {challenge.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              {challenge.isLocked ? (
                <ProfessionalButton
                  variant="outline"
                  className="w-full opacity-50 cursor-not-allowed"
                  icon={Lock}
                  iconPosition="left"
                >
                  Sign Up to Unlock
                </ProfessionalButton>
              ) : (
                <ProfessionalButton
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up to Start
                </ProfessionalButton>
              )}
            </ProfessionalCard>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <ProfessionalCard className="p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Face the Real Chaos?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of developers who are mastering the art of coding under pressure. 
              Unlock all challenges, track your progress, and climb the leaderboards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ProfessionalButton
                variant="primary"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/signup')}
              >
                Start Your Journey
              </ProfessionalButton>
              <ProfessionalButton
                variant="outline"
                size="lg"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                onClick={() => navigate('/login')}
              >
                Already Have Account?
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        </div>
      </div>
    </div>
  );
};

export default PublicChallengesPage;