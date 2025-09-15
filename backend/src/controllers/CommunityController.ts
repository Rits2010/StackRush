import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CommunityPost from '../models/CommunityPost';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

// Get all community posts with pagination and filtering
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, tags, search } = req.query;
    
    // Build filter object
    const filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagsArray };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } }
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Fetch posts
    const posts = await CommunityPost.find(filter)
      .populate('author', 'username profile')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await CommunityPost.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        data: posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      },
      message: 'Community posts retrieved successfully'
    });
  } catch (error) {
    logger.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'POSTS_FETCH_ERROR',
        message: 'Failed to fetch community posts',
        details: (error as Error).message
      }
    });
  }
};

// Create a new community post
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, content, and category are required'
        }
      });
    }
    
    // Create new post
    const post = new CommunityPost({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user?._id,
      authorName: req.user?.username,
      interactions: {
        likes: 0,
        views: 0,
        comments: 0,
        likedBy: [],
        bookmarkedBy: []
      }
    });
    
    const savedPost = await post.save();
    
    // Populate author info
    await savedPost.populate('author', 'username profile');
    
    return res.status(201).json({
      success: true,
      data: savedPost,
      message: 'Post created successfully'
    });
  } catch (error) {
    logger.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'POST_CREATION_ERROR',
        message: 'Failed to create community post',
        details: (error as Error).message
      }
    });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const post = await CommunityPost.findById(id)
      .populate('author', 'username profile');
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }
    
    // Increment view count
    post.interactions.views += 1;
    await post.save();
    
    return res.json({
      success: true,
      data: post,
      message: 'Post retrieved successfully'
    });
  } catch (error) {
    logger.error('Get post by ID error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'POST_FETCH_ERROR',
        message: 'Failed to fetch post',
        details: (error as Error).message
      }
    });
  }
};

// Like/unlike a post
export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    
    const post = await CommunityPost.findById(id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }
    
    // Check if user has already liked the post
    const likedIndex = post.interactions.likedBy.findIndex(
      (id) => id.toString() === userId?.toString()
    );
    
    if (likedIndex > -1) {
      // Unlike the post
      post.interactions.likedBy.splice(likedIndex, 1);
      post.interactions.likes -= 1;
    } else {
      // Like the post
      post.interactions.likedBy.push(userId as any);
      post.interactions.likes += 1;
    }
    
    await post.save();
    
    return res.json({
      success: true,
      data: {
        likes: post.interactions.likes,
        isLiked: likedIndex === -1
      },
      message: likedIndex === -1 ? 'Post liked successfully' : 'Post unliked successfully'
    });
  } catch (error) {
    logger.error('Toggle like error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'LIKE_TOGGLE_ERROR',
        message: 'Failed to toggle like',
        details: (error as Error).message
      }
    });
  }
};

// Bookmark/unbookmark a post
export const toggleBookmark = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    
    const post = await CommunityPost.findById(id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }
    
    // Check if user has already bookmarked the post
    const bookmarkedIndex = post.interactions.bookmarkedBy.findIndex(
      (id) => id.toString() === userId?.toString()
    );
    
    if (bookmarkedIndex > -1) {
      // Remove bookmark
      post.interactions.bookmarkedBy.splice(bookmarkedIndex, 1);
    } else {
      // Add bookmark
      post.interactions.bookmarkedBy.push(userId as any);
    }
    
    await post.save();
    
    return res.json({
      success: true,
      data: {
        isBookmarked: bookmarkedIndex === -1
      },
      message: bookmarkedIndex === -1 ? 'Post bookmarked successfully' : 'Post unbookmarked successfully'
    });
  } catch (error) {
    logger.error('Toggle bookmark error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'BOOKMARK_TOGGLE_ERROR',
        message: 'Failed to toggle bookmark',
        details: (error as Error).message
      }
    });
  }
};