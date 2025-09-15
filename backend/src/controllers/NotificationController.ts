import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

export class NotificationController {
  /**
   * Get user notifications
   */
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const filters = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await NotificationService.getUserNotifications(userId, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Get user notifications error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_NOTIFICATIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get notifications',
        },
      });
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const count = await NotificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_UNREAD_COUNT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get unread count',
        },
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;

      const notification = await NotificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read',
      });
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'MARK_READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mark notification as read',
        },
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      await NotificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      logger.error('Mark all as read error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'MARK_ALL_READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
        },
      });
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;

      await NotificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_NOTIFICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete notification',
        },
      });
    }
  }

  /**
   * Get notifications by type
   */
  static async getNotificationsByType(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const notifications = await NotificationService.getNotificationsByType(userId, type, limit);

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      logger.error('Get notifications by type error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_NOTIFICATIONS_BY_TYPE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get notifications by type',
        },
      });
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const userId = req.user.id;
      const stats = await NotificationService.getNotificationStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Get notification stats error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_NOTIFICATION_STATS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get notification statistics',
        },
      });
    }
  }

  /**
   * Create notification (admin only)
   */
  static async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationData = req.body;
      const notification = await NotificationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      logger.error('Create notification error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_NOTIFICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create notification',
        },
      });
    }
  }

  /**
   * Create bulk notifications (admin only)
   */
  static async createBulkNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { notifications } = req.body;
      const createdNotifications = await NotificationService.createBulkNotifications(notifications);

      res.status(201).json({
        success: true,
        data: createdNotifications,
        message: `${createdNotifications.length} notifications created successfully`,
      });
    } catch (error) {
      logger.error('Create bulk notifications error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_BULK_NOTIFICATIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create bulk notifications',
        },
      });
    }
  }
}