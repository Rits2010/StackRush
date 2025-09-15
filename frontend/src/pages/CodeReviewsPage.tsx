import { useState, useEffect } from 'react';
import { GitPullRequest, MessageSquare, CheckCircle, Clock, Eye, ThumbsUp, Code, User } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import PortalLayout from '../components/PortalLayout';
import { communityApi } from '../services/api';
import type { CommunityPost } from '../types/api';

interface CodeReview {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  challengeType: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'pending' | 'approved' | 'changes-requested' | 'merged';
  createdAt: string;
  updatedAt: string;
  description: string;
  linesAdded: number;
  linesRemoved: number;
  comments: number;
  approvals: number;
  reviewers: string[];
  tags: string[];
}

interface CommunityPostData {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  category: 'discussion' | 'help' | 'showcase' | 'tips' | 'news' | 'code-share';
  tags: string[];
  interactions: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

const CodeReviewsPage = () => {
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunityPosts = async () => {
      try {
        setIsLoading(true);
        const result = await communityApi.getAllPosts({
          category: 'code-share',
          limit: 20
        });
        
        // Transform community posts to code reviews
        const transformedReviews: CodeReview[] = result.data.map((post: any) => ({
          id: post._id,
          title: post.title,
          author: post.author?.username || 'Unknown User',
          authorAvatar: post.author?.username?.substring(0, 2).toUpperCase() || 'UU',
          challengeType: post.metadata?.challengeType || 'dsa',
          difficulty: post.metadata?.difficulty || 'Medium',
          status: 'pending', // Default status
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          description: post.content,
          linesAdded: 0, // Not available in community posts
          linesRemoved: 0, // Not available in community posts
          comments: post.interactions?.comments || 0,
          approvals: post.interactions?.likes || 0,
          reviewers: [], // Not available in community posts
          tags: post.tags || []
        }));
        
        setReviews(transformedReviews);
      } catch (error) {
        console.error('Failed to load community posts:', error);
        // Fallback to mock data
        const mockReviews: CodeReview[] = [
          {
            id: 'pr-001',
            title: 'Implement binary search algorithm with edge case handling',
            author: 'Alex Chen',
            authorAvatar: 'AC',
            challengeType: 'dsa',
            difficulty: 'Medium',
            status: 'pending',
            createdAt: '2024-01-20T10:30:00Z',
            updatedAt: '2024-01-20T14:15:00Z',
            description: 'Added optimized binary search implementation with proper handling of duplicate elements and edge cases.',
            linesAdded: 45,
            linesRemoved: 12,
            comments: 3,
            approvals: 1,
            reviewers: ['Sarah Kim', 'Mike Johnson'],
            tags: ['algorithms', 'optimization', 'edge-cases']
          }
        ];
        setReviews(mockReviews);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCommunityPosts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'changes-requested':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'merged':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'changes-requested':
        return <MessageSquare className="h-4 w-4" />;
      case 'merged':
        return <GitPullRequest className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Hard':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dsa':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'bug-fix':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'feature':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredReviews = activeTab === 'all' 
    ? reviews 
    : reviews.filter(review => review.status === activeTab);

  const tabs = [
    { id: 'all', name: 'All Reviews', count: reviews.length },
    { id: 'pending', name: 'Pending', count: reviews.filter(r => r.status === 'pending').length },
    { id: 'approved', name: 'Approved', count: reviews.filter(r => r.status === 'approved').length },
    { id: 'changes-requested', name: 'Changes Requested', count: reviews.filter(r => r.status === 'changes-requested').length },
    { id: 'merged', name: 'Merged', count: reviews.filter(r => r.status === 'merged').length }
  ];

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GitPullRequest className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading code reviews...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Code Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400">Review and collaborate on coding solutions</p>
            </div>
            
            <ProfessionalButton variant="primary">
              <GitPullRequest className="h-4 w-4 mr-2" />
              Submit for Review
            </ProfessionalButton>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.name}</span>
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <ProfessionalCard key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* Author Avatar */}
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.authorAvatar}
                    </div>
                    
                    {/* Review Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {review.title}
                      </h3>
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          by <strong>{review.author}</strong>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(review.status)}
                            <span className="capitalize">{review.status.replace('-', ' ')}</span>
                          </div>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(review.challengeType)}`}>
                          {review.challengeType.toUpperCase().replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(review.difficulty)}`}>
                          {review.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {review.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Code className="h-4 w-4" />
                          <span className="text-green-600">+{review.linesAdded}</span>
                          <span className="text-red-600">-{review.linesRemoved}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{review.comments} comments</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{review.approvals} approvals</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{review.reviewers.length} reviewers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <ProfessionalButton variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </ProfessionalButton>
                    {review.status === 'pending' && (
                      <>
                        <ProfessionalButton variant="primary" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </ProfessionalButton>
                        <ProfessionalButton variant="secondary" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comment
                        </ProfessionalButton>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Reviewers */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reviewers:</span>
                    <div className="flex space-x-2">
                      {review.reviewers.map((reviewer, index) => (
                        <span key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          {reviewer}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {new Date(review.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </ProfessionalCard>
            ))}
          </div>

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <ProfessionalCard className="p-12 text-center">
              <GitPullRequest className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No code reviews found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeTab === 'all' 
                  ? 'Start by submitting your solutions for peer review!'
                  : `No reviews with status "${activeTab.replace('-', ' ')}" found.`
                }
              </p>
              <ProfessionalButton variant="primary">
                <GitPullRequest className="h-4 w-4 mr-2" />
                Submit Your First Review
              </ProfessionalButton>
            </ProfessionalCard>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default CodeReviewsPage;