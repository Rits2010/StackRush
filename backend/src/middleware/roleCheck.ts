import { Request, Response, NextFunction } from 'express';
import { RequestUser } from '../types';

export const adminOnly = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user as RequestUser | undefined;
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  if (!user.roles?.includes('admin')) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  next();
};
