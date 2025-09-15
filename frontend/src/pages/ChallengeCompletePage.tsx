import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Star, Clock, Zap, TrendingUp, Award, Target, 
  ArrowRight, RotateCcw, Home, Share2, Download, CheckCircle,
  XCircle, AlertTriangle, Crown, Flame, Code, Bug, Briefcase,
  Sparkles, PartyPopper, Medal, Gift, Github, FolderDown, Link2
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ConfettiEffect } from '../components/ui/ConfettiEffect';
import { useAuth } from '../context/AuthContext';
import GitHubService from '../services/githubService';

// Helper function to get user initials
const getUserInitials = (user: any) => {
  if (user?.profile?.firstName && user?.profile?.lastName) {
    return `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}`.toUpperCase();
  }
  return user?.username?.charAt(0)?.toUpperCase() || 'U';
};

interface Achievement {
  name: string;
  icon: any;
  description: string;
  rarity: string;
}

interface ChallengeData {
  title: string;
  type: string;
  difficulty: string;
  baseXP: number;
}

const ChallengeCompletePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const success = searchParams.get('success') === 'true';
  const score = parseInt(searchParams.get('score') || '0');
  const timeUsed = searchParams.get('time') || '00:00';
  const reason = searchParams.get('reason') || '';
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [showAchievementAnimation, setShowAchievementAnimation] = useState(false);
  
  // GitHub Integration State
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubService, setGithubService] = useState<GitHubService | null>(null);
  const [userCode, setUserCode] = useState<string>('');  
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');

  // Mock challenge data
  const challengeData: Record<number, ChallengeData> = {
    1: { title: 'Two Sum Under Pressure', type: 'DSA', difficulty: 'Easy', baseXP: 50 },
    2: { title: 'Login Bug Crisis', type: 'Bug Fix', difficulty: 'Medium', baseXP: 120 },
    3: { title: 'User Dashboard Feature', type: 'Feature', difficulty: 'Hard', baseXP: 200 }
  };

  const challenge = challengeData[parseInt(id || '1')] || challengeData[1];

  // Calculate results
  const xpEarned = success ? Math.floor(challenge.baseXP * (score / 100)) : 0;
  const bonusXP = success && score > 90 ? 25 : success && score > 80 ? 15 : success && score > 70 ? 10 : 0;
  const totalXP = xpEarned + bonusXP;
  
  // Mock user progression
  const currentXP = 2450;
  const newXP = currentXP + totalXP;
  const currentLevel = 'Mid-Level Developer';
  const nextLevelXP = 3500;
  const progressToNext = (newXP / nextLevelXP) * 100;

  useEffect(() => {
    if (success) {
      // Confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Animate score
      let scoreCounter = 0;
      const scoreInterval = setInterval(() => {
        scoreCounter += 2;
        if (scoreCounter >= score) {
          setAnimatedScore(score);
          clearInterval(scoreInterval);
        } else {
          setAnimatedScore(scoreCounter);
        }
      }, 30);
      
      // Animate XP
      setTimeout(() => {
        let xpCounter = 0;
        const xpInterval = setInterval(() => {
          xpCounter += 3;
          if (xpCounter >= totalXP) {
            setAnimatedXP(totalXP);
            clearInterval(xpInterval);
          } else {
            setAnimatedXP(xpCounter);
          }
        }, 50);
      }, 1000);
      
      // Check for level up
      if (newXP >= nextLevelXP) {
        setTimeout(() => {
          setLevelUp(true);
          setShowLevelUpAnimation(true);
          setTimeout(() => setShowLevelUpAnimation(false), 3000);
        }, 2000);
      }
      
      // Check for new achievements
      const achievements: Achievement[] = [];
      if (score >= 95) achievements.push({ 
        name: 'Perfectionist', 
        icon: Star, 
        description: 'Scored 95% or higher',
        rarity: 'legendary'
      });
      if (challenge.type === 'Bug Fix' && success) achievements.push({ 
        name: 'Bug Squasher', 
        icon: Bug, 
        description: 'Fixed a critical bug',
        rarity: 'rare'
      });
      if (timeUsed.startsWith('0') && parseInt(timeUsed.split(':')[1]) < 30) achievements.push({ 
        name: 'Speed Demon', 
        icon: Zap, 
        description: 'Completed in under 30 minutes',
        rarity: 'epic'
      });
      
      if (achievements.length > 0) {
        setTimeout(() => {
          setNewAchievements(achievements);
          setShowAchievementAnimation(true);
          setTimeout(() => setShowAchievementAnimation(false), 4000);
        }, 3000);
      }
    }
  }, [success, score, newXP, nextLevelXP, challenge.type, timeUsed, totalXP]);

  // Load user code from localStorage or session storage
  useEffect(() => {
    const savedCode = localStorage.getItem(`challenge-${id}-code`) || 
      `// ${challenge.title} Solution\n// Completed with ${score}% score\n\nfunction solution() {\n  // Your implementation here\n  return 'Hello World!';\n}`;
    setUserCode(savedCode);
    setCommitMessage(`Add solution for ${challenge.title}`);
  }, [id, challenge.title, score]);

  // GitHub Integration Functions
  const handleConnectGithub = async () => {
    setIsConnectingGithub(true);
    try {
      const service = new GitHubService({
        apiUrl: 'https://api.github.com'
        // In production, you would get the token from OAuth flow
      });
      
      // In a real app, this would be actual OAuth
      // For demo, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGithubService(service);
      const repos = await service.getUserRepositories();
      setGithubRepos(repos);
      setShowGitHubModal(true);
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
      alert('Failed to connect to GitHub. Please try again.');
    } finally {
      setIsConnectingGithub(false);
    }
  };

  const handlePushToGithub = async () => {
    if (!githubService || !selectedRepo) {
      alert('Please select a repository');
      return;
    }

    try {
      const [owner, repo] = selectedRepo.split('/');
      const fileName = `${challenge.title.toLowerCase().replace(/\s+/g, '-')}.js`;
      
      const files = [{
        path: `solutions/${fileName}`,
        content: userCode
      }];

      await githubService.pushCodeToRepository(
        owner, 
        repo, 
        files, 
        commitMessage
      );

      setShowGitHubModal(false);
      alert('Code successfully pushed to GitHub!');
    } catch (error) {
      console.error('Failed to push code:', error);
      alert('Failed to push code to GitHub. Please try again.');
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([userCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${challenge.title.toLowerCase().replace(/\s+/g, '-')}-solution.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    // Create a simple zip-like structure
    const content = {
      [`${challenge.title.toLowerCase().replace(/\s+/g, '-')}-solution.js`]: userCode,
      'README.md': `# ${challenge.title}\n\nSolution completed with ${score}% score.\n\n## Challenge Details\n- Type: ${challenge.type}\n- Difficulty: ${challenge.difficulty}\n- Time Used: ${timeUsed}\n\n## Results\n- Score: ${score}%\n- XP Earned: ${totalXP}\n`
    };
    
    // For a real implementation, you'd use a library like JSZip
    // For now, we'll download the main file
    handleDownloadCode();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    return 'F';
  };

  const getFailureReason = () => {
    switch (reason) {
      case 'timeout': return 'Time ran out before completion';
      case 'bugs': return 'Too many bugs in the solution';
      case 'incomplete': return 'Solution was incomplete';
      default: return 'Solution did not meet requirements';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-orange-500 to-red-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Professional Confetti Effect */}
      <ConfettiEffect 
        show={showConfetti} 
        intensity={score >= 95 ? 'heavy' : score >= 80 ? 'medium' : 'light'}
        duration={3000}
      />

      {/* Level Up Animation */}
      {showLevelUpAnimation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <ConfettiEffect 
            show={true} 
            intensity="heavy" 
            colors={['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#451a03']}
          />
          <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-12 rounded-3xl border border-yellow-500/30 backdrop-blur-md">
            <div className="mb-6">
              <Crown className="h-20 w-20 text-yellow-400 mx-auto animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
              LEVEL UP!
            </h1>
            <p className="text-xl text-white font-semibold mb-6">
              Senior Developer Unlocked!
            </p>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Animation */}
      {showAchievementAnimation && newAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <ConfettiEffect 
            show={true} 
            intensity="medium" 
            colors={['#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc']}
          />
          <div className="text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-10 rounded-3xl border border-purple-500/30 backdrop-blur-md max-w-md">
            <div className="mb-6">
              <Medal className="h-16 w-16 text-purple-400 mx-auto animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 mb-6">
              Achievement Unlocked!
            </h2>
            <div className="space-y-3">
              {newAchievements.map((achievement, index) => (
                <div key={index} className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-4 rounded-xl border border-white/20`}>
                  <achievement.icon className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">{achievement.name}</h3>
                  <p className="text-white/80 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            {success ? (
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-2">
            {success ? (
              <span className="text-green-400">Challenge Complete!</span>
            ) : (
              <span className="text-red-400">Challenge Failed</span>
            )}
          </h1>
          
          <p className="text-lg text-gray-300 mb-1">{challenge.title}</p>
          <p className="text-gray-400">
            {success ? 'Congratulations on completing the challenge!' : getFailureReason()}
          </p>
        </div>

        {/* Main Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Score Card */}
          <ProfessionalCard className="p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
            <div className="relative">
              <div className="mb-3">
                <div className={`text-5xl font-bold ${getScoreColor(success ? animatedScore : 0)} mb-2 transition-all duration-500`}>
                  {success ? animatedScore : 0}%
                </div>
                <div className={`text-xl font-bold ${getScoreColor(success ? animatedScore : 0)}`}>
                  Grade: {getScoreGrade(success ? animatedScore : 0)}
                </div>
              </div>
              <div className="text-gray-400 text-sm">Performance Score</div>
              
              {/* Animated Progress Ring */}
              <div className="mt-4">
                <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={getScoreColor(success ? animatedScore : 0)}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${success ? animatedScore : 0}, 100`}
                    strokeLinecap="round"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{ transition: 'stroke-dasharray 2s ease-in-out' }}
                  />
                </svg>
              </div>
            </div>
          </ProfessionalCard>

          {/* XP Earned */}
          <ProfessionalCard className="p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
            <div className="relative">
              <div className="mb-3">
                <div className="text-5xl font-bold text-blue-400 mb-2 transition-all duration-500">
                  +{animatedXP}
                </div>
                {bonusXP > 0 && (
                  <div className="text-sm text-green-400 animate-pulse">
                    +{bonusXP} bonus XP
                  </div>
                )}
              </div>
              <div className="text-gray-400 text-sm">XP Earned</div>
              
              {/* XP Animation */}
              <div className="mt-4">
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-8 rounded-full transition-all duration-500 ${
                        i < Math.floor((animatedXP / totalXP) * 5) ? 'bg-blue-400' : 'bg-gray-700'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </ProfessionalCard>

          {/* Time */}
          <ProfessionalCard className="p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
            <div className="relative">
              <div className="mb-3">
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  {timeUsed}
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                {reason === 'timeout' ? 'Time Expired' : 'Time Used'}
              </div>
              
              {/* Time Icon */}
              <div className="mt-4">
                <Clock className="h-12 w-12 mx-auto text-purple-400/50" />
              </div>
            </div>
          </ProfessionalCard>
        </div>

        {/* Level Up Notification */}
        {levelUp && !showLevelUpAnimation && (
          <ProfessionalCard className="p-6 mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <div className="text-center">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">LEVEL UP!</h2>
              <p className="text-lg text-white mb-1">You've been promoted to Senior Developer!</p>
              <p className="text-gray-300 text-sm">New challenges and features unlocked</p>
            </div>
          </ProfessionalCard>
        )}

        {/* Performance & Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Breakdown */}
          <ProfessionalCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-400" />
              Performance Breakdown
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Code Quality', value: success ? Math.max(score - 10, 0) : 0, color: 'bg-blue-500' },
                { label: 'Problem Solving', value: success ? score : 0, color: 'bg-green-500' },
                { label: 'Time Management', value: success ? Math.min(score + 10, 100) : 0, color: 'bg-purple-500' },
                { label: 'Focus Under Pressure', value: success ? Math.max(score - 5, 0) : 0, color: 'bg-orange-500' }
              ].map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{metric.label}</span>
                    <span className="text-white font-bold">{metric.value}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3">
                    <div 
                      className={`${metric.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </ProfessionalCard>

          {/* Career Progress */}
          <ProfessionalCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-400" />
              Career Progress
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {getUserInitials(user)}
                </div>
                <div className="text-lg font-bold text-white">{currentLevel}</div>
                <div className="text-gray-400 text-sm">Current Level</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Progress to Senior Developer</span>
                  <span className="text-white font-bold">{Math.round(progressToNext)}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-2000 ease-out"
                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{newXP} XP</span>
                  <span>{nextLevelXP} XP</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl p-4 border border-blue-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">+{totalXP} XP</div>
                  <div className="text-sm text-gray-300">Added to your profile</div>
                </div>
              </div>
            </div>
          </ProfessionalCard>
        </div>

        {/* New Achievements */}
        {newAchievements.length > 0 && !showAchievementAnimation && (
          <ProfessionalCard className="p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-400" />
              New Achievements Unlocked!
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newAchievements.map((achievement, index) => (
                <div key={index} className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-4 rounded-xl text-center border border-white/20`}>
                  <achievement.icon className="h-10 w-10 text-white mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-1 text-sm">{achievement.name}</h4>
                  <p className="text-white/80 text-xs">{achievement.description}</p>
                </div>
              ))}
            </div>
          </ProfessionalCard>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ProfessionalButton
            variant="primary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/portal/challenges')}
          >
            Try Another Challenge
          </ProfessionalButton>
          
          <ProfessionalButton
            variant="outline"
            size="lg"
            icon={RotateCcw}
            onClick={() => navigate(`/portal/challenge/${id}`)}
          >
            Retry This Challenge
          </ProfessionalButton>
          
          <ProfessionalButton
            variant="secondary"
            size="lg"
            icon={Home}
            onClick={() => navigate('/portal')}
          >
            Back to Dashboard
          </ProfessionalButton>
        </div>

        {/* Share & Export Results */}
        <div className="mt-8">
          <ProfessionalCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Share & Export Your Solution
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ProfessionalButton
                variant="outline"
                size="lg"
                icon={Github}
                onClick={handleConnectGithub}
                disabled={isConnectingGithub}
                className="w-full"
              >
                {isConnectingGithub ? 'Connecting...' : 'Push to GitHub'}
              </ProfessionalButton>
              
              <ProfessionalButton
                variant="outline"
                size="lg"
                icon={FolderDown}
                onClick={handleDownloadZip}
                className="w-full"
              >
                Download ZIP
              </ProfessionalButton>
              
              <ProfessionalButton
                variant="outline"
                size="lg"
                icon={Download}
                onClick={handleDownloadCode}
                className="w-full"
              >
                Download Code
              </ProfessionalButton>
              
              <ProfessionalButton
                variant="outline"
                size="lg"
                icon={Share2}
                className="w-full"
              >
                Share Results
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        </div>
      </div>
      
      {/* GitHub Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Github className="h-5 w-5 mr-2" />
                Push to GitHub
              </h3>
              <button
                onClick={() => setShowGitHubModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Repository
                </label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a repository...</option>
                  {githubRepos.map((repo: any) => (
                    <option key={repo.id} value={repo.full_name}>
                      {repo.full_name} ({repo.language || 'No language'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add solution for challenge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code Preview
                </label>
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {userCode.substring(0, 200)}{userCode.length > 200 ? '...' : ''}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <ProfessionalButton
                variant="primary"
                onClick={handlePushToGithub}
                disabled={!selectedRepo || !commitMessage}
                className="flex-1"
                icon={Github}
              >
                Push Code
              </ProfessionalButton>
              
              <ProfessionalButton
                variant="outline"
                onClick={() => setShowGitHubModal(false)}
                className="flex-1"
              >
                Cancel
              </ProfessionalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeCompletePage;