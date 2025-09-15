import { useState, useEffect, useCallback } from 'react';
import { challengesApi } from '../services/api';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  message?: string;
  duration?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  initialCode?: string;
  testCases: Array<{
    input: any;
    expected: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  time: number;
  submittedAt: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: {
        message: string;
        code?: string;
      };
    };
  };
}

export const useChallenge = (challengeId: string) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'testing' | 'submitting' | 'submitted' | 'error'>('idle');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [relatedChallenges, setRelatedChallenges] = useState<Challenge[]>([]);

  // Fetch challenge details
  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      const response = await challengesApi.getChallengeById(challengeId);
      setChallenge(response.data.data);
      setError(null);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.error?.message || 'Failed to fetch challenge');
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  // Run tests against the solution
  const runTests = useCallback(async (code: string) => {
    try {
      setSubmissionStatus('testing');
      const response = await challengesApi.runTests(challengeId, code);
      setTestResults(response.data.data.testResults);
      setSubmissionStatus('submitted');
      return response.data.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Error running tests:', error);
      setError(error.response?.data?.error?.message || 'Failed to run tests');
      setSubmissionStatus('error');
      throw error;
    }
  }, [challengeId]);

  // Submit solution
  const submitSolution = useCallback(async (code: string) => {
    try {
      setSubmissionStatus('submitting');
      const response = await challengesApi.submitSolution(challengeId, code);
      setSubmissionStatus('submitted');
      return response.data.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Error submitting solution:', error);
      setError(error.response?.data?.error?.message || 'Failed to submit solution');
      setSubmissionStatus('error');
      throw error;
    }
  }, [challengeId]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await challengesApi.getChallengeLeaderboard(challengeId);
      setLeaderboard(response.data.data);
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    }
  }, [challengeId]);

  // Fetch related challenges
  const fetchRelatedChallenges = useCallback(async () => {
    if (!challenge?.tags?.length) return;
    
    try {
      const response = await challengesApi.getChallenges({
        tags: challenge.tags.join(','),
        limit: 4,
        exclude: challengeId
      });
      setRelatedChallenges(response.data.data.challenges);
    } catch (err) {
      console.error('Error fetching related challenges:', err);
    }
  }, [challenge?.tags, challengeId]);

  // Initial data fetch
  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
      fetchLeaderboard();
    }
  }, [challengeId, fetchChallenge, fetchLeaderboard]);

  // Fetch related challenges when challenge tags are available
  useEffect(() => {
    if (challenge?.tags?.length) {
      fetchRelatedChallenges();
    }
  }, [challenge?.tags, fetchRelatedChallenges]);

  return {
    challenge,
    loading,
    error,
    testResults,
    submissionStatus,
    leaderboard,
    relatedChallenges,
    runTests,
    submitSolution,
    refetchChallenge: fetchChallenge,
    refetchLeaderboard: fetchLeaderboard,
  };
};
