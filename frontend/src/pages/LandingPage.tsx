import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Zap, Users, Target, AlertTriangle, MessageSquare, Bug, Clock, Trophy, Star, Code, Phone } from 'lucide-react';
import { ProfessionalCard, FeatureCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import '../styles/design-system.css';

const LandingPage = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Real Distractions',
      description: 'Handle Slack notifications, urgent calls, and system outages while coding under pressure.',
      accent: 'orange'
    },
    {
      icon: Users,
      title: 'Team Dynamics',
      description: 'Navigate mood swings from managers, clients, and QA teams in realistic workplace scenarios.',
      accent: 'purple'
    },
    {
      icon: Bug,
      title: 'QA Simulation',
      description: 'Deal with bug reports, code reviews, and scope changes just like in real development.',
      accent: 'blue'
    },
    {
      icon: Target,
      title: 'Multiple Modes',
      description: 'Choose between DSA interview prep, bug fixing challenges, or feature development tasks.',
      accent: 'green'
    },
    {
      icon: Trophy,
      title: 'Career Progression',
      description: 'Level up from Intern to Lead Developer, unlocking harder challenges and more chaos.',
      accent: 'blue'
    },
    {
      icon: MessageSquare,
      title: 'Community Challenges',
      description: 'Create and share your own coding challenges with the developer community.',
      accent: 'purple'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Frontend Developer',
      company: 'TechCorp',
      content: 'This simulator prepared me for the real chaos of development. The distraction handling is spot on!',
      rating: 5
    },
    {
      name: 'Mike Rodriguez',
      role: 'Full Stack Engineer',
      company: 'StartupXYZ',
      content: 'Finally, a platform that shows what coding is really like. The manager mood swings are hilariously accurate.',
      rating: 5
    },
    {
      name: 'Alex Thompson',
      role: 'Junior Developer',
      company: 'BigTech Inc',
      content: 'Helped me ace my interviews by coding under pressure. The QA system is incredibly realistic.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="mb-8">
                <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Real Development Chaos Simulator
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                Can You Code
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Under Pressure?</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl">
                Master coding under pressure with <span className="font-semibold text-blue-600 dark:text-blue-400">realistic workplace distractions</span>. 
                Practice algorithms, fix bugs, and build features while handling 
                Slack notifications, urgent calls, and demanding deadlines.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <Link to="/auth/register">
                  <ProfessionalButton
                    variant="primary"
                    size="xl"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                  >
                    Start Coding Challenge
                  </ProfessionalButton>
                </Link>
                
                <ProfessionalButton
                  variant="outline"
                  size="xl"
                  icon={Code2}
                  iconPosition="left"
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Watch Demo
                </ProfessionalButton>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm group-hover:shadow-2xl transition-all duration-300">
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">500+</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Challenges</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm group-hover:shadow-2xl transition-all duration-300">
                    <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">50K+</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Developers</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm group-hover:shadow-2xl transition-all duration-300">
                    <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">98%</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Demo Preview */}
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
              
              <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
                
                {/* Mock IDE Header */}
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                  </div>
                  <div className="text-green-400 text-sm font-mono bg-gray-800/50 px-4 py-2 rounded-lg border border-green-500/20">
                    Challenge: Two Sum • Time: 12:34
                  </div>
                </div>
                
                {/* Mock Code */}
                <div className="bg-gray-800/80 rounded-2xl p-6 font-mono text-sm border border-gray-700/50 backdrop-blur-sm">
                  <div className="text-gray-500 mb-2">// Your solution here...</div>
                  <div className="text-blue-400 mb-1">function twoSum(nums, target) {'{'}</div>
                  <div className="text-white ml-4 mb-1">const map = new Map();</div>
                  <div className="text-white ml-4 mb-1">for (let i = 0; i &lt; nums.length; i++) {'{'}</div>
                  <div className="text-white ml-8 flex items-center">
                    <span className="animate-pulse bg-green-400 w-2 h-5 mr-1"></span>
                    <span className="text-gray-400">// Thinking...</span>
                  </div>
                </div>
                
                {/* Mock Distractions */}
                <div className="mt-6 flex justify-between items-center text-sm">
                  <div className="flex space-x-4">
                    <span className="flex items-center px-3 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      3 Slack messages
                    </span>
                    <span className="flex items-center px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 animate-pulse">
                      <Phone className="w-4 h-4 mr-2" />
                      Manager calling
                    </span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                    <Target className="w-4 h-4 mr-2" />
                    Focus: 67%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The Reality of Development
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Traditional coding practice doesn't prepare you for the chaos of real development. 
              Our platform bridges that gap with <span className="text-purple-600 dark:text-purple-400 font-semibold">authentic workplace simulation</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-red-300 dark:group-hover:border-red-600">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  Constant Interruptions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Slack notifications, urgent calls, and "quick questions" that derail your focus and test your ability to context-switch.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">📱 Notifications</span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">📞 Urgent Calls</span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">💬 Quick Questions</span>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-orange-600">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Impossible Deadlines
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Last-minute scope changes and unrealistic timelines that test your problem-solving under extreme pressure.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full">⏰ Time Pressure</span>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full">📋 Scope Changes</span>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full">🎯 Tight Deadlines</span>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-purple-300 dark:group-hover:border-purple-600">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Team Dynamics
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Navigate mood swings from managers, demanding clients, and overwhelmed QA teams in realistic scenarios.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">👔 Managers</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">🤝 Clients</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">🧪 QA Teams</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Experience Real Development?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join thousands of developers who are mastering the art of coding under pressure.
              </p>
              <ProfessionalButton
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                onClick={() => navigate('/signup')}
              >
                Start Your Journey
              </ProfessionalButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose StackRush?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience authentic development scenarios in a controlled, gamified environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={AlertTriangle}
              title="Realistic Distractions"
              description="Handle Slack notifications, urgent calls, and system outages while coding under pressure."
              accent="orange"
            />
            
            <FeatureCard
              icon={Users}
              title="Team Dynamics"
              description="Navigate mood swings from managers, clients, and QA teams in realistic workplace scenarios."
              accent="purple"
            />
            
            <FeatureCard
              icon={Bug}
              title="QA Simulation"
              description="Deal with bug reports, code reviews, and scope changes just like in real development."
              accent="blue"
            />
            
            <FeatureCard
              icon={Target}
              title="Multiple Challenge Types"
              description="Choose between DSA interview prep, bug fixing challenges, or feature development tasks."
              accent="green"
            />
            
            <FeatureCard
              icon={Trophy}
              title="Career Progression"
              description="Level up from Intern to Lead Developer, unlocking harder challenges and more chaos."
              accent="blue"
            />
            
            <FeatureCard
              icon={MessageSquare}
              title="Community Challenges"
              description="Create and share your own coding challenges with a global community of developers."
              accent="purple"
            />
          </div>
        </div>
      </section>


      {/* Social Proof Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-100/30 to-blue-100/30 dark:from-gray-800/30 dark:to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Trusted by Developers</span>
              <span className="text-slate-900 dark:text-white"> Worldwide</span>
            </h2>
            <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Join thousands of developers who have transformed their coding skills and career prospects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
            {testimonials.map((testimonial, index) => (
              <ProfessionalCard key={index} className="p-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                <div className="flex mb-8">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed italic text-xl">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">{testimonial.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </ProfessionalCard>
            ))}
          </div>

          {/* Company Logos */}
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-500 mb-10 text-lg">Developers from these companies trust our platform:</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400 transition-colors duration-200">Google</div>
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400 transition-colors duration-200">Microsoft</div>
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400 transition-colors duration-200">Amazon</div>
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400 transition-colors duration-200">Meta</div>
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400 transition-colors duration-200">Netflix</div>
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400 transition-colors duration-200">Spotify</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-purple-600/20 dark:from-blue-900/40 dark:to-purple-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-600/10 dark:to-purple-600/10"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-bold mb-12 text-slate-900 dark:text-white">
            Can You Code
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Under Pressure?</span>
          </h2>
          
          <p className="text-2xl text-slate-600 dark:text-slate-300 mb-16 leading-relaxed">
            Join the revolution in developer training. Master the chaos, excel in interviews, 
            and thrive in your development career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
            <ProfessionalButton
              variant="primary"
              size="xl"
              icon={Code2}
              iconPosition="left"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 text-xl font-bold py-6 px-12"
            >
              Start Your First Challenge
            </ProfessionalButton>
            
            <ProfessionalButton
              variant="outline"
              size="xl"
              className="border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-xl font-bold py-6 px-12"
            >
              Watch Demo Video
            </ProfessionalButton>
          </div>
          
          <div className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            ✨ Free to start • No credit card required • Join 50,000+ developers
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <span className="font-black text-xl text-white">StackRush</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Master the art of coding under pressure with realistic workplace simulations. 
                Join thousands of developers improving their skills through chaos.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-lg">🐙</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-lg">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-lg">💼</span>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/public-challenges" className="text-gray-400 hover:text-white transition-colors">Challenges</Link></li>
                <li><Link to="/public-leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 StackRush. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;