import { Request, Response } from 'express';
import Template from '../models/Template';
import { AuthenticatedRequest } from '../types';

// Get all templates with pagination and filtering
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, framework, difficulty, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter['metadata.category'] = category;
    }
    
    if (framework) {
      filter['code.framework'] = framework;
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
    
    // Fetch templates
    const templates = await Template.find(filter)
      .populate('author', 'username profile')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Template.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        data: templates,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      },
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATES_FETCH_ERROR',
        message: 'Failed to fetch templates',
        details: (error as Error).message
      }
    });
  }
};

// Create a new template (placeholder for future implementation)
export const createTemplate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real implementation, we would:
    // 1. Validate the template data
    // 2. Create the template in the database
    // 3. Return the created template
    
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Template creation is not yet implemented'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATE_CREATION_ERROR',
        message: 'Failed to create template',
        details: (error as Error).message
      }
    });
  }
};