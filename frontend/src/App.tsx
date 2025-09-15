
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import ChallengesPage from './pages/ChallengesPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SimulationPage from './pages/SimulationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import PublicChallengesPage from './pages/PublicChallengesPage';
import PublicLeaderboardPage from './pages/PublicLeaderboardPage';
import PortalDashboard from './pages/PortalDashboard';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import ChallengeCompletePage from './pages/ChallengeCompletePage';
import TutorialPage from './pages/TutorialPage';
import PublicNavbar from './components/PublicNavbar';
import PortalNavbar from './components/PortalNavbar';
import { useLocation } from 'react-router-dom';
import AchievementsPage from './pages/AchievementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import CodeReviewsPage from './pages/CodeReviewsPage';
import CommunityPage from './pages/CommunityPage';
import PublicTemplatesPage from './pages/PublicTemplatesPage';
import StreakPage from './pages/StreakPage';
import ReviewsPage from './pages/ReviewsPage';
import PostDetailPage from './pages/PostDetailPage';
import CodeRunnerPage from './pages/CodeRunnerPage';
import LearningPage from './pages/LearningPage'; // Learning Hub

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isPortalRoute = location.pathname.startsWith('/portal');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {user && isPortalRoute ? <PortalNavbar /> : <PublicNavbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/public-challenges" element={<PublicChallengesPage />} />
        <Route path="/public-leaderboard" element={<PublicLeaderboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Portal Routes (Protected) */}
        <Route path="/portal" element={<PortalDashboard />} />
        <Route path="/portal/challenges" element={<ChallengesPage />} />
        <Route path="/portal/achievements" element={<AchievementsPage />} />
        <Route path="/portal/analytics" element={<AnalyticsPage />} />
        <Route path="/portal/history" element={<HistoryPage />} />
        <Route path="/portal/code-reviews" element={<CodeReviewsPage />} />
        <Route path="/portal/reviews" element={<ReviewsPage />} />
        <Route path="/portal/community" element={<CommunityPage />} />
        <Route path="/portal/community/post/:postId" element={<PostDetailPage />} />
        <Route path="/portal/code-runner" element={<CodeRunnerPage />} />
        <Route path="/portal/code-runner/:postId" element={<CodeRunnerPage />} />
        <Route path="/portal/code-runner/template/:templateId" element={<CodeRunnerPage />} />
        <Route path="/portal/code-runner/new" element={<CodeRunnerPage />} />
        <Route path="/portal/learning" element={<LearningPage />} />
        <Route path="/portal/templates" element={<PublicTemplatesPage />} />
        <Route path="/portal/streak" element={<StreakPage />} />
        <Route path="/portal/dashboard" element={<DashboardPage />} />
        <Route path="/portal/profile" element={<ProfilePage />} />
        <Route path="/portal/leaderboard" element={<LeaderboardPage />} />
        <Route path="/portal/challenge/:id" element={<ChallengeDetailPage />} />
        <Route path="/portal/simulation/:id" element={<SimulationPage />} />
        <Route path="/portal/challenge-complete/:id" element={<ChallengeCompletePage />} />
        <Route path="/portal/settings" element={<SettingsPage />} />
        <Route path="/portal/tutorial" element={<TutorialPage />} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/challenges" element={user ? <ChallengesPage /> : <PublicChallengesPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <LandingPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <LandingPage />} />
        <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <PublicLeaderboardPage />} />
        <Route path="/challenge/:id" element={user ? <ChallengeDetailPage /> : <LandingPage />} />
        <Route path="/simulation/:id" element={user ? <SimulationPage /> : <LandingPage />} />
        <Route path="/settings" element={user ? <SettingsPage /> : <LandingPage />} />
      </Routes>
    </div>
  );
};
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;