import { Request, Response } from 'express';
import LearningPlaylist from '../models/LearningPlaylist';
import { AuthenticatedRequest } from '../types';

// Get all learning playlists with pagination and filtering
export const getAllPlaylists = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, difficulty, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter['metadata.category'] = category;
    }
    
    if (difficulty) {
      filter['metadata.difficulty'] = difficulty;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Fetch playlists
    const playlists = await LearningPlaylist.find(filter)
      .populate('instructor', 'username profile')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await LearningPlaylist.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        data: playlists,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      },
      message: 'Playlists retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PLAYLISTS_FETCH_ERROR',
        message: 'Failed to fetch playlists',
        details: (error as Error).message
      }
    });
  }
};

// Enroll user in a learning playlist
export const enrollInPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // In a real implementation, we would:
    // 1. Check if playlist exists
    // 2. Check if user is already enrolled
    // 3. Create enrollment record
    // 4. Update playlist stats
    
    // For now, we'll just simulate the enrollment
    const playlist = await LearningPlaylist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAYLIST_NOT_FOUND',
          message: 'Playlist not found'
        }
      });
    }
    
    // Update playlist stats (increment enrollments)
    playlist.stats.enrollments += 1;
    await playlist.save();
    
    return res.json({
      success: true,
      data: {
        playlistId: id,
        userId: req.user?._id,
        enrolledAt: new Date().toISOString()
      },
      message: 'Successfully enrolled in playlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ENROLLMENT_ERROR',
        message: 'Failed to enroll in playlist',
        details: (error as Error).message
      }
    });
  }
};