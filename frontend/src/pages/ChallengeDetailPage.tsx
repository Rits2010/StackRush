import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Challenge, ChallengeType, ChallengeDifficulty } from '../types/challenge';
import { ChallengeRepository } from '../repositories/challengeRepository';
import {
  ArrowLeft, Play, Clock, Zap, Users, Star, AlertTriangle,
  Bug, Code, GitBranch, Headphones, Phone,
  Mail, Coffee, Home, Calendar, Target, Shield, Database,
  Server, Wifi, Monitor, HelpCircle, Globe, BarChart3
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ChallengeStartModal } from '../components/ChallengeStartModal';
import PortalSidebar from '../components/PortalSidebar';

const challengeRepository = new ChallengeRepository();

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('standard');
  const [activeTab, setActiveTab] = useState('overview');
  const [showStartModal, setShowStartModal] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock challenge data structure to match the old design
  const mockChallengeData = {
    expectedChallenges: [
      { type: 'Focus Distractions', description: 'Random notifications and mental distractions', frequency: 'High' },
      { type: 'Time Pressure', description: 'Countdown timer creating urgency', frequency: 'Constant' },
      { type: 'Algorithm Complexity', description: 'Multiple solution approaches to consider', frequency: 'Medium' }
    ],
    availableTools: [
      { name: 'Code Editor', description: 'Syntax-highlighted JavaScript editor', icon: Code },
      { name: 'Test Runner', description: 'Instant feedback on test cases', icon: Target },
      { name: 'Hint System', description: 'Progressive hints if you get stuck', icon: HelpCircle }
    ],
    distractionProfile: {
      environmental: [
        { type: 'Phone Notifications', count: 3, timing: 'Random', urgency: 'Low' },
        { type: 'Email Alerts', count: 2, timing: 'Mid-challenge', urgency: 'Medium' },
        { type: 'Social Media Pings', count: 4, timing: 'Throughout', urgency: 'Low' }
      ]
    },
    modes: [
      {
        id: 'standard',
        name: 'Standard Mode',
        description: 'Normal distraction level for focused practice',
        multiplier: 1.0,
        features: ['Basic distractions', 'Hint system', 'Progress tracking']
      },
      {
        id: 'interview',
        name: 'Interview Mode',
        description: 'High-pressure simulation like real interviews',
        multiplier: 1.5,
        features: ['No hints', 'Time pressure', 'Performance tracking']
      },
      {
        id: 'zen',
        name: 'Zen Mode',
        description: 'Minimal distractions for learning',
        multiplier: 0.8,
        features: ['Reduced distractions', 'Extended time', 'Learning focus']
      }
    ]
  };

  // Transform API response to match Challenge type
  const transformChallengeData = useCallback((data: any): Challenge => ({
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type as ChallengeType,
    difficulty: data.difficulty as ChallengeDifficulty,
    timeLimit: data.timeLimit || '30',
    distractionLevel: 'Medium',
    scenario: {
      background: data.scenario?.background || '',
      businessContext: data.scenario?.businessContext || '',
      constraints: [],
      stakeholders: Array.isArray(data.scenario?.stakeholders) 
        ? data.scenario.stakeholders.map((s: any) => s.name)
        : []
    },
    implementation: {
      startingFiles: [],
      dependencies: [],
      environment: {
        type: data.type as ChallengeType,
        runtime: 'node',
        dependencies: []
      }
    },
    testing: {
      testCases: Array.isArray(data.testing?.testCases) 
        ? data.testing.testCases.map((tc: any) => ({
            id: tc.id || Math.random().toString(36).substring(2, 9),
            type: 'unit' as const,
            description: tc.description || '',
            input: tc.input || {},
            expectedOutput: tc.expectedOutput || {},
            validationRules: [],
            metadata: {
              timeout: 5000,
              retries: 3,
              criticality: 'high' as const
            }
          }))
        : [],
      validationRules: [],
      performanceCriteria: undefined
    },
    metadata: {
      estimatedTime: 30,
      realWorldContext: data.scenario?.businessContext || '',
      learningObjectives: Array.isArray(data.learningObjectives) ? data.learningObjectives : [],
      tags: [],
      rating: 0,
      completions: 0,
      xp: data.xp || 100,
      teamSize: data.teamSize ? String(data.teamSize) : '1',
      distractionTypes: Array.isArray(data.distractions) ? data.distractions : [],
      focusRating: 0,
      popularity: 0
    },
  }), []);

  const startChallenge = useCallback(() => {
    if (!id || !challenge) return;
    // Map mode to distraction level
    const distractionLevel = selectedMode === 'zen' ? 'low' : selectedMode === 'interview' ? 'high' : 'medium';
    navigate(`/portal/simulation/${id}?mode=${selectedMode}&type=${challenge.type.toLowerCase().replace(' ', '-')}&distractionLevel=${distractionLevel}`);
  }, [id, selectedMode, navigate, challenge]);

  const handleStartConfirmed = useCallback(() => {
    setShowStartModal(false);
    startChallenge();
  }, [startChallenge]);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) {
        setError('No challenge ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await challengeRepository.getChallengeById(id);
        const challengeData = transformChallengeData(data);
        setChallenge(challengeData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching challenge:', {
          error: errorMessage,
          challengeId: id,
          timestamp: new Date().toISOString()
        });
        setError(`Failed to load challenge: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [id, transformChallengeData]);

  const handleStartChallenge = useCallback(() => {
    setShowStartModal(true);
  }, []);

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
      case 'dsa': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'frontend': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'backend-api': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      case 'Constant': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const renderSpecs = () => {
    if (!challenge) return null;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Problem Description</h3>
          <ProfessionalCard className="p-6">
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
              {challenge.scenario.businessContext || challenge.description}
            </pre>
          </ProfessionalCard>
        </div>

        {challenge.testing.testCases && challenge.testing.testCases.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Examples</h3>
            <div className="space-y-4">
              {challenge.testing.testCases.slice(0, 2).map((testCase, index) => (
                <ProfessionalCard key={testCase.id} className="p-6">
                  <div className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Example {index + 1}:
                  </div>
                  <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {testCase.description}
                  </div>
                  <div className="font-mono text-sm p-2 rounded" 
                       style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>
                    Output: {JSON.stringify(testCase.expectedOutput)}
                  </div>
                </ProfessionalCard>
              ))}
            </div>
          </div>
        )}

        {challenge.scenario.constraints && challenge.scenario.constraints.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Constraints</h3>
            <ProfessionalCard className="p-6">
              <ul className="space-y-2">
                {challenge.scenario.constraints.map((constraint, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-sm mt-1">•</span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {constraint}
                    </span>
                  </li>
                ))}
              </ul>
            </ProfessionalCard>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Error Loading Challenge</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">Challenge not found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The requested challenge could not be found.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/challenges')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Challenges
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <PortalSidebar />
        <div className="ml-72">
          {/* Header Bar */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/portal/challenges')}
                className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all duration-200 font-medium group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Challenges
              </button>

              <ProfessionalButton
                variant="primary"
                onClick={handleStartChallenge}
                icon={Play}
                iconPosition="right"
              >
                Start Challenge
              </ProfessionalButton>
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Challenge Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getTypeColor(challenge.type)}`}>
                    {challenge.type.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-5 w-5 mr-1 fill-current" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">1,247 completed</span>
                </div>

                <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  {challenge.title}
                </h1>

                <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {challenge.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <ProfessionalCard className="p-6 text-center hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{challenge.timeLimit} mins</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Time Limit</div>
                </ProfessionalCard>
                <ProfessionalCard className="p-6 text-center hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Medium</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Chaos Level</div>
                </ProfessionalCard>
                <ProfessionalCard className="p-6 text-center hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>+{challenge.metadata?.xp || 100}</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>XP Reward</div>
                </ProfessionalCard>
                <ProfessionalCard className="p-6 text-center hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>73%</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Success Rate</div>
                </ProfessionalCard>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['overview', 'specs', 'tools', 'distractions'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === tab
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'specs' && renderSpecs()}

                  {activeTab === 'overview' && (
                    <ProfessionalCard className="p-8">
                      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Challenge Overview</h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>What You'll Face</h4>
                          <div className="grid gap-4">
                            {mockChallengeData.expectedChallenges.map((item, index) => (
                              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.type}</div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</div>
                                  <div className={`text-xs font-medium mt-1 ${getUrgencyColor(item.frequency)}`}>
                                    {item.frequency} frequency
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ProfessionalCard>
                  )}

                  {activeTab === 'tools' && (
                    <ProfessionalCard className="p-8">
                      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Available Tools</h3>
                      <div className="grid gap-4">
                        {mockChallengeData.availableTools.map((tool, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <tool.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{tool.name}</div>
                              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{tool.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ProfessionalCard>
                  )}

                  {activeTab === 'distractions' && (
                    <ProfessionalCard className="p-8">
                      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Distraction Profile</h3>
                      <div className="space-y-6">
                        {Object.entries(mockChallengeData.distractionProfile).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="text-lg font-semibold mb-3 capitalize" style={{ color: 'var(--color-text-primary)' }}>
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className="grid gap-3">
                              {items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                  <div>
                                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.type}</div>
                                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                      {item.timing} • {item.count} times
                                    </div>
                                  </div>
                                  <div className={`text-sm font-medium ${getUrgencyColor(item.urgency)}`}>
                                    {item.urgency}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ProfessionalCard>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <ProfessionalCard className="p-6">
                      <h3 className="text-lg font-bold mb-6 flex items-center" style={{ color: 'var(--color-text-primary)' }}>
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                        Challenge Mode
                      </h3>
                      <div className="space-y-4">
                        {mockChallengeData.modes.map((mode) => (
                          <label key={mode.id} className="block">
                            <input
                              type="radio"
                              name="mode"
                              value={mode.id}
                              checked={selectedMode === mode.id}
                              onChange={(e) => setSelectedMode(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedMode === mode.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-500/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
                              }`} style={{ backgroundColor: selectedMode === mode.id ? 'var(--color-bg-secondary)' : 'var(--color-card-bg)' }}>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{mode.name}</h5>
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                    {mode.multiplier}x XP
                                  </span>
                                  {selectedMode === mode.id && (
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>{mode.description}</p>
                              {mode.features && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {mode.features.slice(0, 2).map((feature, index) => (
                                    <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                      {feature}
                                    </span>
                                  ))}
                                  {mode.features.length > 2 && (
                                    <span className="text-xs text-gray-500">+{mode.features.length - 2} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </ProfessionalCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Start Modal */}
      <ChallengeStartModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartConfirmed}
        challenge={challenge}
        selectedMode={selectedMode}
        modes={mockChallengeData.modes}
      />
    </>
  );
};

export default ChallengeDetailPage;