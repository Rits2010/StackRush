import { Notification, INotification } from '../models/Notification';
import { User } from '../models/User';
import { PaginatedResult, FilterQuery } from '../types';
import { logger } from '../utils/logger';

export interface CreateNotificationDto {
  recipient: string;
  type: 'achievement' | 'challenge' | 'social' | 'system';
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high';
  channels?: ('email' | 'push')[];
  expiresAt?: Date;
}

export interface NotificationFilters extends FilterQuery {
  type?: string;
  priority?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export class NotificationService {
  /**
   * Create and deliver notification
   */
  static async createNotification(data: CreateNotificationDto): Promise<INotification> {
    try {
      // Verify recipient exists
      const recipient = await User.findById(data.recipient);
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Check user notification preferences
      const shouldSend = this.shouldSendNotification(recipient, data.type);
      if (!shouldSend) {
        logger.info('Notification skipped due to user preferences', {
          recipientId: data.recipient,
          type: data.type,
        });
        return null as any;
      }

      // Create notification
      const notification = new Notification({
        recipient: data.recipient,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        priority: data.priority || 'medium',
        channels: data.channels || ['email'],
        status: {
          isRead: false,
          isDelivered: false,
        },
        expiresAt: data.expiresAt,
      });

      await notification.save();

      // Deliver notification through specified channels
      await this.deliverNotification(notification);

      logger.info('Notification created and delivered', {
        notificationId: notification._id,
        recipientId: data.recipient,
        type: data.type,
        channels: notification.channels,
      });

      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters
  ): Promise<PaginatedResult<INotification>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
        type,
        priority,
        isRead,
        dateFrom,
        dateTo,
      } = filters;

      // Build query
      const query: any = {
        recipient: userId,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      };

      if (type) {
        query.type = type;
      }

      if (priority) {
        query.priority = priority;
      }

      if (isRead !== undefined) {
        query['status.isRead'] = isRead;
      }

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;

      // Execute query
      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        Notification.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        'status.isRead': false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      return count;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (!notification.status.isRead) {
        notification.status.isRead = true;
        notification.status.readAt = new Date();
        await notification.save();

        logger.info('Notification marked as read', {
          notificationId,
          userId,
        });
      }

      return notification;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const result = await Notification.updateMany(
        {
          recipient: userId,
          'status.isRead': false,
        },
        {
          $set: {
            'status.isRead': true,
            'status.readAt': new Date(),
          },
        }
      );

      logger.info('All notifications marked as read', {
        userId,
        updatedCount: result.modifiedCount,
      });
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });

      if (!result) {
        throw new Error('Notification not found');
      }

      logger.info('Notification deleted', {
        notificationId,
        userId,
      });
    } catch (error) {
      logger.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Get notifications by type
   */
  static async getNotificationsByType(
    userId: string,
    type: string,
    limit = 10
  ): Promise<INotification[]> {
    try {
      const notifications = await Notification.find({
        recipient: userId,
        type,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return notifications;
    } catch (error) {
      logger.error('Get notifications by type error:', error);
      throw error;
    }
  }

  /**
   * Deliver notification through specified channels
   */
  private static async deliverNotification(notification: INotification): Promise<void> {
    try {
      const deliveryPromises: Promise<void>[] = [];

      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            deliveryPromises.push(this.deliverEmailNotification(notification));
            break;
          case 'push':
            deliveryPromises.push(this.deliverPushNotification(notification));
            break;
        }
      }

      await Promise.allSettled(deliveryPromises);

      // Mark as delivered
      notification.status.isDelivered = true;
      notification.status.deliveredAt = new Date();
      await notification.save();
    } catch (error) {
      logger.error('Deliver notification error:', error);
    }
  }

  /**
   * Deliver notification via email
   */
  private static async deliverEmailNotification(notification: INotification): Promise<void> {
    try {
      // TODO: Implement email delivery
      // await EmailService.sendNotificationEmail(notification);
      logger.info('Email notification delivery (not implemented)', {
        notificationId: notification._id,
        recipient: notification.recipient,
      });
    } catch (error) {
      logger.error('Email notification delivery error:', error);
    }
  }

  /**
   * Deliver notification via push
   */
  private static async deliverPushNotification(notification: INotification): Promise<void> {
    try {
      // TODO: Implement push notification delivery
      // await PushService.sendNotification(notification);
      logger.info('Push notification delivery (not implemented)', {
        notificationId: notification._id,
        recipient: notification.recipient,
      });
    } catch (error) {
      logger.error('Push notification delivery error:', error);
    }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private static shouldSendNotification(user: any, type: string): boolean {
    const preferences = user.preferences?.notifications;
    if (!preferences) return true;

    switch (type) {
      case 'achievement':
        return preferences.achievements !== false;
      case 'challenge':
        return preferences.challenges !== false;
      case 'social':
        return preferences.email !== false; // Using email preference for social
      case 'system':
        return true; // Always send system notifications
      default:
        return true;
    }
  }

  /**
   * Create bulk notifications
   */
  static async createBulkNotifications(
    notifications: CreateNotificationDto[]
  ): Promise<INotification[]> {
    try {
      const createdNotifications: INotification[] = [];

      for (const notificationData of notifications) {
        try {
          const notification = await this.createNotification(notificationData);
          if (notification) {
            createdNotifications.push(notification);
          }
        } catch (error) {
          logger.error('Bulk notification creation error for single notification:', error);
        }
      }

      logger.info('Bulk notifications created', {
        totalRequested: notifications.length,
        totalCreated: createdNotifications.length,
      });

      return createdNotifications;
    } catch (error) {
      logger.error('Create bulk notifications error:', error);
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      logger.info('Expired notifications cleaned up', {
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      logger.error('Cleanup expired notifications error:', error);
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(userId: string): Promise<any> {
    try {
      const stats = await Notification.aggregate([
        { $match: { recipient: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$status.isRead', false] }, 1, 0] }
            },
            byType: {
              $push: {
                type: '$type',
                isRead: '$status.isRead'
              }
            },
            byPriority: {
              $push: {
                priority: '$priority',
                isRead: '$status.isRead'
              }
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          total: 0,
          unread: 0,
          readRate: 0,
          typeBreakdown: {},
          priorityBreakdown: {}
        };
      }

      const result = stats[0];
      const readRate = result.total > 0 ? ((result.total - result.unread) / result.total) * 100 : 0;

      // Process type breakdown
      const typeBreakdown = result.byType.reduce((acc: any, item: any) => {
        if (!acc[item.type]) {
          acc[item.type] = { total: 0, unread: 0 };
        }
        acc[item.type].total++;
        if (!item.isRead) {
          acc[item.type].unread++;
        }
        return acc;
      }, {});

      // Process priority breakdown
      const priorityBreakdown = result.byPriority.reduce((acc: any, item: any) => {
        if (!acc[item.priority]) {
          acc[item.priority] = { total: 0, unread: 0 };
        }
        acc[item.priority].total++;
        if (!item.isRead) {
          acc[item.priority].unread++;
        }
        return acc;
      }, {});

      return {
        total: result.total,
        unread: result.unread,
        readRate: Math.round(readRate * 100) / 100,
        typeBreakdown,
        priorityBreakdown
      };
    } catch (error) {
      logger.error('Get notification stats error:', error);
      throw error;
    }
  }
}

// Clean up expired notifications every hour
setInterval(() => {
  NotificationService.cleanupExpiredNotifications();
}, 60 * 60 * 1000);