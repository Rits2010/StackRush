import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, ArrowRight, CheckCircle, Code, Target, Zap, Trophy, 
  Star, Clock, Users, Award, BookOpen, Lightbulb, Rocket,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import MonacoEditor from '../components/MonacoEditor';

const TutorialPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('// Welcome to StackRush!\n// Let\'s start with a simple function\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Try calling the function\ngreet("Developer");');

  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'Welcome to StackRush! 🎉',
      description: 'Your journey into realistic development simulation begins here.',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Code Under Pressure?</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              StackRush simulates real-world development scenarios with authentic workplace distractions, 
              team dynamics, and time pressure. Let's get you started!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Code className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Real Coding</h3>
              <p className="text-gray-400 text-sm">Write actual code in our professional IDE</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Zap className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Real Chaos</h3>
              <p className="text-gray-400 text-sm">Handle interruptions and distractions</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Real Progress</h3>
              <p className="text-gray-400 text-sm">Earn XP and climb the ranks</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ranks',
      title: 'Understanding Your Rank 📊',
      description: 'Learn about the progression system and what each rank means.',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Career Progression System</h2>
            <p className="text-gray-300">
              Your rank reflects your coding skills and ability to handle workplace chaos.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              { rank: 'Intern', xp: '0 XP', description: 'Learning the basics, minimal distractions', color: 'from-gray-500 to-gray-600', current: true },
              { rank: 'Junior Developer', xp: '500 XP', description: 'Handling simple tasks with some interruptions', color: 'from-green-500 to-green-600', current: false },
              { rank: 'Mid-Level Developer', xp: '1,500 XP', description: 'Managing complex projects under pressure', color: 'from-blue-500 to-blue-600', current: false },
              { rank: 'Senior Developer', xp: '3,500 XP', description: 'Leading teams while coding in chaos', color: 'from-purple-500 to-purple-600', current: false },
              { rank: 'Lead Developer', xp: '6,000 XP', description: 'Architecting solutions amid constant interruptions', color: 'from-orange-500 to-orange-600', current: false },
              { rank: 'Principal Engineer', xp: '10,000 XP', description: 'Master of chaos, coding zen achieved', color: 'from-yellow-500 to-red-500', current: false }
            ].map((level, index) => (
              <div key={index} className={`flex items-center p-4 rounded-xl border transition-all duration-200 ${
                level.current ? 'bg-purple-500/20 border-purple-500/50' : 'bg-gray-800/30 border-gray-700'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${level.color} mr-4`}>
                  {level.current ? <Star className="h-6 w-6 text-white" /> : <span className="text-white font-bold">{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold ${level.current ? 'text-purple-400' : 'text-white'}`}>
                      {level.rank} {level.current && '(Current)'}
                    </h3>
                    <span className="text-gray-400 text-sm">{level.xp}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'challenges',
      title: 'Challenge Types 🎯',
      description: 'Explore the different types of coding challenges available.',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Three Types of Challenges</h2>
            <p className="text-gray-300">
              Each challenge type tests different aspects of real-world development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DSA Challenges</h3>
              <p className="text-gray-300 mb-4">
                Classic algorithms and data structures problems with workplace distractions.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Array manipulation</li>
                <li>• Tree traversal</li>
                <li>• Dynamic programming</li>
                <li>• Graph algorithms</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 border border-red-500/30">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bug Fixing</h3>
              <p className="text-gray-300 mb-4">
                Debug production issues while handling QA pressure and client escalations.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Authentication bugs</li>
                <li>• Performance issues</li>
                <li>• UI/UX problems</li>
                <li>• API integration fixes</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Feature Development</h3>
              <p className="text-gray-300 mb-4">
                Build complete features while managing scope changes and team coordination.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• User dashboards</li>
                <li>• API integrations</li>
                <li>• Component libraries</li>
                <li>• Full-stack features</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'distractions',
      title: 'Handling Distractions ⚡',
      description: 'Learn how to manage realistic workplace interruptions.',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">The Chaos System</h2>
            <p className="text-gray-300">
              Real development isn't done in silence. Our platform simulates authentic workplace chaos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-400" />
                Types of Distractions
              </h3>
              <div className="space-y-3">
                {[
                  { type: 'Slack Notifications', frequency: 'High', impact: 'Low' },
                  { type: 'Manager Check-ins', frequency: 'Medium', impact: 'Medium' },
                  { type: 'Client Calls', frequency: 'Low', impact: 'High' },
                  { type: 'System Outages', frequency: 'Low', impact: 'Critical' },
                  { type: 'QA Bug Reports', frequency: 'High', impact: 'Medium' },
                  { type: 'Scope Changes', frequency: 'Medium', impact: 'High' }
                ].map((distraction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">{distraction.type}</span>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        distraction.frequency === 'High' ? 'bg-red-500/20 text-red-400' :
                        distraction.frequency === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {distraction.frequency}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        distraction.impact === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        distraction.impact === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        distraction.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {distraction.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                Survival Tips
              </h3>
              <div className="space-y-3">
                {[
                  'Stay focused on the main task',
                  'Prioritize critical interruptions',
                  'Use time management techniques',
                  'Communicate clearly with team',
                  'Document your progress',
                  'Don\'t panic under pressure'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'editor',
      title: 'Code Editor Tour 💻',
      description: 'Get familiar with our professional development environment.',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Professional IDE Experience</h2>
            <p className="text-gray-300">
              Our Monaco-based editor provides a real IDE experience with IntelliSense, syntax highlighting, and more.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Editor Features</h3>
              <div className="space-y-3">
                {[
                  { feature: 'Syntax Highlighting', description: 'Beautiful code coloring for multiple languages' },
                  { feature: 'IntelliSense', description: 'Smart auto-completion and suggestions' },
                  { feature: 'Error Detection', description: 'Real-time error highlighting and fixes' },
                  { feature: 'Code Formatting', description: 'Automatic code formatting and indentation' },
                  { feature: 'Minimap', description: 'Bird\'s eye view of your entire code' },
                  { feature: 'Multiple Themes', description: 'Dark and light themes for comfort' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">{item.feature}</div>
                      <div className="text-gray-400 text-sm">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Try the Editor</h3>
                <ProfessionalButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? 'Hide' : 'Show'} Editor
                </ProfessionalButton>
              </div>
              
              {showCode && (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                  <MonacoEditor
                    value={code}
                    onChange={setCode}
                    language="javascript"
                    theme="vs-dark"
                    height="300px"
                  />
                </div>
              )}
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="font-bold text-blue-400 mb-2">Pro Tip</h4>
                <p className="text-gray-300 text-sm">
                  Use Ctrl+Space for auto-completion, Ctrl+/ for comments, and Alt+Shift+F for formatting!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'You\'re Ready! 🚀',
      description: 'Time to start your first challenge and begin your coding journey.',
      content: (
        <div className="text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Congratulations! 🎉</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              You've completed the tutorial and are ready to face your first coding challenge. 
              Remember, the chaos is part of the learning experience!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Start Simple</h3>
              <p className="text-gray-400 text-sm">Begin with easy challenges to build confidence</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Join Community</h3>
              <p className="text-gray-400 text-sm">Connect with other developers on the leaderboard</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Award className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Track Progress</h3>
              <p className="text-gray-400 text-sm">Monitor your growth and celebrate achievements</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Your First Challenge Awaits</h3>
            <p className="text-gray-300 mb-6">
              We recommend starting with "Two Sum Under Pressure" - a classic algorithm problem 
              with light distractions to ease you into the chaos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ProfessionalButton
                variant="primary"
                size="lg"
                icon={Play}
                iconPosition="right"
                onClick={() => navigate('/portal/challenge/1')}
              >
                Start First Challenge
              </ProfessionalButton>
              <ProfessionalButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/portal/challenges')}
              >
                Browse All Challenges
              </ProfessionalButton>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentTutorialStep = tutorialSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    navigate('/portal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Getting Started Tutorial</h1>
            <p className="text-gray-400">
              Step {currentStep + 1} of {tutorialSteps.length}: {currentTutorialStep.description}
            </p>
          </div>
          <ProfessionalButton
            variant="ghost"
            icon={X}
            onClick={skipTutorial}
          >
            Skip Tutorial
          </ProfessionalButton>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-gray-400">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Tutorial Content */}
        <ProfessionalCard className="p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-purple-400" />
              {currentTutorialStep.title}
            </h2>
          </div>
          
          {currentTutorialStep.content}
        </ProfessionalCard>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <ProfessionalButton
            variant="outline"
            icon={ChevronLeft}
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </ProfessionalButton>
          
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentStep ? 'bg-purple-500' :
                  completedSteps.has(index) ? 'bg-green-500' :
                  'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {currentStep === tutorialSteps.length - 1 ? (
            <ProfessionalButton
              variant="primary"
              icon={Rocket}
              iconPosition="right"
              onClick={() => navigate('/portal')}
            >
              Enter Portal
            </ProfessionalButton>
          ) : (
            <ProfessionalButton
              variant="primary"
              icon={ChevronRight}
              iconPosition="right"
              onClick={nextStep}
            >
              Next
            </ProfessionalButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;