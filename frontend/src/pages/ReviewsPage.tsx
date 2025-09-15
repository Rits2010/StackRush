import { useState, useCallback } from 'react';
import { Star, User, Calendar, ChevronDown, Filter, Search, MessageCircle, Heart, Flag, Award } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ProfessionalInput } from '../components/ui/ProfessionalInput';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  challengeId: string;
  challengeName: string;
  rating: number;
  title: string;
  content: string;
  tags: string[];
  helpful: number;
  timestamp: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  helpful: number;
}

interface NewReview {
  challengeId: string;
  challengeName: string;
  rating: number;
  title: string;
  content: string;
  tags: string[];
}

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Alex Chen',
      userAvatar: '/api/placeholder/40/40',
      challengeId: 'challenge1',
      challengeName: 'Two Sum Algorithm',
      rating: 5,
      title: 'Great challenge for beginners!',
      content: 'This challenge really helped me understand hash tables and time complexity. The explanations were clear and the test cases covered edge cases well.',
      tags: ['beginner-friendly', 'algorithms', 'hash-tables'],
      helpful: 24,
      timestamp: '2024-01-15T10:30:00Z',
      replies: [
        {
          id: 'r1',
          userId: 'user2',
          userName: 'Sarah Kim',
          userAvatar: '/api/placeholder/32/32',
          content: 'I agree! The step-by-step approach really helped me grasp the concept.',
          timestamp: '2024-01-15T14:20:00Z',
          helpful: 8
        }
      ]
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'Marcus Johnson',
      userAvatar: '/api/placeholder/40/40',
      challengeId: 'challenge2',
      challengeName: 'React Component Bug Fix',
      rating: 4,
      title: 'Realistic debugging scenario',
      content: 'Loved the realistic bug scenario. It felt like debugging actual production code. The hints were helpful without giving away the solution.',
      tags: ['react', 'debugging', 'realistic'],
      helpful: 18,
      timestamp: '2024-01-14T16:45:00Z',
      replies: []
    },
    {
      id: '3',
      userId: 'user4',
      userName: 'Elena Rodriguez',
      userAvatar: '/api/placeholder/40/40',
      challengeId: 'challenge3',
      challengeName: 'API Integration Challenge',
      rating: 5,
      title: 'Excellent real-world practice',
      content: 'This challenge perfectly simulates working with external APIs. The error handling scenarios were particularly valuable for learning.',
      tags: ['apis', 'error-handling', 'practical'],
      helpful: 31,
      timestamp: '2024-01-13T09:15:00Z',
      replies: [
        {
          id: 'r2',
          userId: 'user5',
          userName: 'David Park',
          userAvatar: '/api/placeholder/32/32',
          content: 'The timeout scenarios really prepared me for production issues!',
          timestamp: '2024-01-13T11:30:00Z',
          helpful: 12
        }
      ]
    }
  ]);

  const [showNewReviewModal, setShowNewReviewModal] = useState(false);
  const [newReview, setNewReview] = useState<NewReview>({
    challengeId: '',
    challengeName: '',
    rating: 5,
    title: '',
    content: '',
    tags: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from reviews
  const allTags = Array.from(new Set(reviews.flatMap(review => review.tags)));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.challengeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = !filterRating || review.rating >= filterRating;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => review.tags.includes(tag));
      return matchesSearch && matchesRating && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const handleSubmitReview = useCallback(() => {
    if (!newReview.title.trim() || !newReview.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      challengeId: newReview.challengeId,
      challengeName: newReview.challengeName,
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      tags: newReview.tags,
      helpful: 0,
      timestamp: new Date().toISOString(),
      replies: []
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({
      challengeId: '',
      challengeName: '',
      rating: 5,
      title: '',
      content: '',
      tags: []
    });
    setShowNewReviewModal(false);
  }, [newReview]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Community Reviews
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Share your experience and help others improve their coding skills
              </p>
            </div>
            <ProfessionalButton
              onClick={() => setShowNewReviewModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Write Review
            </ProfessionalButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <ProfessionalCard className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reviews.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Reviews</div>
            </ProfessionalCard>
            <ProfessionalCard className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Rating</div>
            </ProfessionalCard>
            <ProfessionalCard className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {reviews.reduce((acc, r) => acc + r.helpful, 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Helpful Votes</div>
            </ProfessionalCard>
            <ProfessionalCard className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {allTags.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Topics Covered</div>
            </ProfessionalCard>
          </div>
        </div>

        {/* Filters and Search */}
        <ProfessionalCard className="mb-6">
          <div className="space-y-4">
            {/* Search and Sort */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <ProfessionalInput
                  type="text"
                  placeholder="Search reviews, challenges, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
                <select
                  value={filterRating || ''}
                  onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars Only</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <div className="flex items-center mb-2">
                <Filter className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by Topics
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </ProfessionalCard>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map(review => (
            <ProfessionalCard key={review.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {review.userName}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(review.timestamp)}</span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {review.challengeName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                      <Heart className="h-4 w-4" />
                      <span>{review.helpful}</span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {review.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply ({review.replies.length})</span>
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {review.replies.length > 0 && (
                  <div className="pl-8 space-y-3 border-l-2 border-slate-100 dark:border-slate-700">
                    {review.replies.map(reply => (
                      <div key={reply.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                              {reply.userName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {reply.content}
                          </p>
                          <button className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mt-1">
                            <Heart className="h-3 w-3" />
                            <span>{reply.helpful}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ProfessionalCard>
          ))}
        </div>

        {/* No results message */}
        {filteredReviews.length === 0 && (
          <ProfessionalCard className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No reviews found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search criteria or be the first to write a review!
            </p>
          </ProfessionalCard>
        )}
      </div>

      {/* New Review Modal */}
      {showNewReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Write a Review
                </h2>
                <button
                  onClick={() => setShowNewReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Challenge Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Challenge
                  </label>
                  <select
                    value={newReview.challengeId}
                    onChange={(e) => {
                      const challengeId = e.target.value;
                      const challengeName = e.target.options[e.target.selectedIndex].text;
                      setNewReview(prev => ({ ...prev, challengeId, challengeName }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select a challenge</option>
                    <option value="challenge1">Two Sum Algorithm</option>
                    <option value="challenge2">React Component Bug Fix</option>
                    <option value="challenge3">API Integration Challenge</option>
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Review Title
                  </label>
                  <ProfessionalInput
                    type="text"
                    placeholder="Summarize your experience..."
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Review Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share your detailed experience, what you learned, and any suggestions..."
                    value={newReview.content}
                    onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags (Optional)
                  </label>
                  <ProfessionalInput
                    type="text"
                    placeholder="Enter tags separated by commas (e.g., beginner, algorithms, react)"
                    value={newReview.tags.join(', ')}
                    onChange={(e) => setNewReview(prev => ({
                      ...prev,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <ProfessionalButton
                  variant="outline"
                  onClick={() => setShowNewReviewModal(false)}
                >
                  Cancel
                </ProfessionalButton>
                <ProfessionalButton
                  onClick={handleSubmitReview}
                  disabled={!newReview.title.trim() || !newReview.content.trim() || !newReview.challengeId}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Submit Review
                </ProfessionalButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;