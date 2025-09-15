import { challengesApi } from '../services/api';
import type { Challenge as ApiChallenge } from '../types/api';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimit: string;
  xp: number;
  teamSize: number;
  distractions: string[];
  scenario: {
    background: string;
    businessContext: string;
    stakeholders: Array<{
      name: string;
      role: string;
      avatar: string;
    }>;
  };
  implementation: {
    requirements: string[];
    constraints: string[];
    dependencies: Array<{
      name: string;
      version: string;
    }>;
  };
  testing: {
    testCases: Array<{
      description: string;
      input: string;
      expectedOutput: string;
    }>;
  };
  learningObjectives: string[];
  files: Array<{
    name: string;
    content: string;
  }>;
}

export class ChallengeRepository {
  async getChallengeById(id: string): Promise<Challenge> {
    try {
      // Call the real API to get challenge data
      const apiChallenge = await challengesApi.getChallengeById(id);
      
      // Transform API challenge to repository challenge format
      const challenge: Challenge = {
        id: apiChallenge._id,
        title: apiChallenge.title,
        description: apiChallenge.description,
        type: apiChallenge.type,
        difficulty: apiChallenge.difficulty,
        timeLimit: apiChallenge.timeLimit?.toString() || '30',
        xp: apiChallenge.stats?.averageScore || 100,
        teamSize: 1, // Not available in API
        distractions: apiChallenge.scenario?.distractions?.map(d => d.type) || [],
        scenario: {
          background: apiChallenge.scenario?.background || '',
          businessContext: apiChallenge.scenario?.company || '',
          stakeholders: [{
            name: apiChallenge.author?.username || 'Unknown Author',
            role: apiChallenge.scenario?.role || 'Developer',
            avatar: ''
          }]
        },
        implementation: {
          requirements: [],
          constraints: apiChallenge.content?.constraints ? [apiChallenge.content.constraints] : [],
          dependencies: []
        },
        testing: {
          testCases: apiChallenge.code?.testCases?.map(testCase => ({
            description: `Test case with input: ${testCase.input}`,
            input: testCase.input || '',
            expectedOutput: testCase.expectedOutput || ''
          })) || []
        },
        learningObjectives: [],
        files: apiChallenge.code?.starterCode ? 
          Object.entries(apiChallenge.code.starterCode).map(([lang, code]) => ({
            name: `solution.${lang}`,
            content: code || ''
          })) : []
      };
      
      return challenge;
    } catch (error) {
      console.error('Error fetching challenge from API:', error);
      throw new Error(`Failed to load challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllChallenges(): Promise<Challenge[]> {
    try {
      // Call the real API to get all challenges
      const result = await challengesApi.getChallenges({ limit: 100 });
      
      // Transform API challenges to repository challenge format
      const challenges: Challenge[] = result.data.map((apiChallenge: ApiChallenge) => ({
        id: apiChallenge._id,
        title: apiChallenge.title,
        description: apiChallenge.description,
        type: apiChallenge.type,
        difficulty: apiChallenge.difficulty,
        timeLimit: apiChallenge.timeLimit?.toString() || '30',
        xp: apiChallenge.stats?.averageScore || 100,
        teamSize: 1, // Not available in API
        distractions: apiChallenge.scenario?.distractions?.map(d => d.type) || [],
        scenario: {
          background: apiChallenge.scenario?.background || '',
          businessContext: apiChallenge.scenario?.company || '',
          stakeholders: [{
            name: apiChallenge.author?.username || 'Unknown Author',
            role: apiChallenge.scenario?.role || 'Developer',
            avatar: ''
          }]
        },
        implementation: {
          requirements: [],
          constraints: apiChallenge.content?.constraints ? [apiChallenge.content.constraints] : [],
          dependencies: []
        },
        testing: {
          testCases: apiChallenge.code?.testCases?.map(testCase => ({
            description: `Test case with input: ${testCase.input}`,
            input: testCase.input || '',
            expectedOutput: testCase.expectedOutput || ''
          })) || []
        },
        learningObjectives: [],
        files: apiChallenge.code?.starterCode ? 
          Object.entries(apiChallenge.code.starterCode).map(([lang, code]) => ({
            name: `solution.${lang}`,
            content: code || ''
          })) : []
      }));
      
      return challenges;
    } catch (error) {
      console.error('Error fetching challenges from API:', error);
      throw new Error(`Failed to load challenges: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}