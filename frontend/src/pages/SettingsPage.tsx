import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Code, Volume2, Monitor, Save } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ProfessionalInput, ProfessionalSelect } from '../components/ui/ProfessionalInput';
import PortalSidebar from '../components/PortalSidebar';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile settings
    name: 'Alex Thompson',
    email: 'alex@example.com',
    bio: 'Full-stack developer passionate about clean code',
    experience: 'mid',
    persona: 'startup',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    challengeReminders: true,
    weeklyDigest: true,
    
    // Privacy settings
    profileVisibility: 'public',
    showStats: true,
    showAchievements: true,
    
    // Appearance settings
    theme: 'dark',
    codeTheme: 'vs-dark',
    fontSize: 'medium',
    
    // Simulation settings
    distractionLevel: 'medium',
    soundEffects: true,
    autoSave: true,
    
    // Accessibility settings
    reducedMotion: false,
    highContrast: false,
    screenReader: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'simulation', label: 'Simulation', icon: Code },
    { id: 'accessibility', label: 'Accessibility', icon: Monitor }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfessionalInput
              label="Full Name"
              value={settings.name}
              onChange={(value) => updateSetting('name', value)}
            />
            <ProfessionalInput
              label="Email Address"
              type="email"
              value={settings.email}
              onChange={(value) => updateSetting('email', value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <textarea
                value={settings.bio}
                onChange={(e) => updateSetting('bio', e.target.value)}
                className="input-professional w-full h-24 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <ProfessionalSelect
              label="Experience Level"
              value={settings.experience}
              onChange={(e) => updateSetting('experience', e.target.value)}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'junior', label: 'Junior Developer' },
                { value: 'mid', label: 'Mid-level Developer' },
                { value: 'senior', label: 'Senior Developer' },
                { value: 'lead', label: 'Lead Developer' }
              ]}
            />
            <ProfessionalSelect
              label="Developer Persona"
              value={settings.persona}
              onChange={(e) => updateSetting('persona', e.target.value)}
              options={[
                { value: 'startup', label: 'Startup Developer' },
                { value: 'corporate', label: 'Corporate Engineer' },
                { value: 'freelancer', label: 'Freelancer' },
                { value: 'student', label: 'College Student' },
                { value: 'remote', label: 'Remote Worker' }
              ]}
            />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications for important updates' },
              { key: 'challengeReminders', label: 'Challenge Reminders', desc: 'Daily reminders to complete challenges' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of your progress' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-sm text-gray-400">{desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <ProfessionalSelect
              label="Profile Visibility"
              value={settings.profileVisibility}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              options={[
                { value: 'public', label: 'Public - Anyone can see your profile' },
                { value: 'friends', label: 'Friends Only - Only friends can see your profile' },
                { value: 'private', label: 'Private - Only you can see your profile' }
              ]}
            />
            {[
              { key: 'showStats', label: 'Show Statistics', desc: 'Display your coding stats on your profile' },
              { key: 'showAchievements', label: 'Show Achievements', desc: 'Display your achievements publicly' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-sm text-gray-400">{desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <ProfessionalSelect
              label="Theme"
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              options={[
                { value: 'dark', label: 'Dark Theme' },
                { value: 'light', label: 'Light Theme' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
            />
            <ProfessionalSelect
              label="Code Editor Theme"
              value={settings.codeTheme}
              onChange={(e) => updateSetting('codeTheme', e.target.value)}
              options={[
                { value: 'vs-dark', label: 'VS Code Dark' },
                { value: 'monokai', label: 'Monokai' },
                { value: 'github', label: 'GitHub' },
                { value: 'dracula', label: 'Dracula' }
              ]}
            />
            <ProfessionalSelect
              label="Font Size"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value)}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' }
              ]}
            />
          </div>
        );

      case 'simulation':
        return (
          <div className="space-y-6">
            <ProfessionalSelect
              label="Default Distraction Level"
              value={settings.distractionLevel}
              onChange={(e) => updateSetting('distractionLevel', e.target.value)}
              options={[
                { value: 'low', label: 'Low - Minimal distractions' },
                { value: 'medium', label: 'Medium - Moderate chaos' },
                { value: 'high', label: 'High - Maximum chaos' },
                { value: 'extreme', label: 'Extreme - Insane mode' }
              ]}
            />
            {[
              { key: 'soundEffects', label: 'Sound Effects', desc: 'Play notification sounds during simulation' },
              { key: 'autoSave', label: 'Auto Save', desc: 'Automatically save your progress' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-sm text-gray-400">{desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            {[
              { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Minimize animations and transitions' },
              { key: 'highContrast', label: 'High Contrast', desc: 'Increase contrast for better visibility' },
              { key: 'screenReader', label: 'Screen Reader Support', desc: 'Optimize for screen readers' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-sm text-gray-400">{desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <PortalSidebar />
      <div className="ml-72 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your coding chaos experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfessionalCard className="p-6">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-black dark:text-white" />
                    <span className="font-medium text-black dark:text-white">{label}</span>
                  </button>
                ))}
              </nav>
            </ProfessionalCard>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <ProfessionalCard className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-gray-400">
                  {activeTab === 'profile' && 'Manage your profile information and preferences'}
                  {activeTab === 'notifications' && 'Control how and when you receive notifications'}
                  {activeTab === 'privacy' && 'Manage your privacy and data sharing preferences'}
                  {activeTab === 'appearance' && 'Customize the look and feel of your interface'}
                  {activeTab === 'simulation' && 'Configure your coding simulation experience'}
                  {activeTab === 'accessibility' && 'Adjust accessibility features for better usability'}
                </p>
              </div>

              {renderTabContent()}

              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex justify-end space-x-4">
                  <ProfessionalButton variant="secondary">
                    Reset to Defaults
                  </ProfessionalButton>
                  <ProfessionalButton variant="primary" icon={Save}>
                    Save Changes
                  </ProfessionalButton>
                </div>
              </div>
            </ProfessionalCard>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage;