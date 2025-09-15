import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { notificationSchemas } from '../validation/notificationSchemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with filters
 * @access  Private
 */
router.get(
  '/',
  validateQuery(notificationSchemas.getUserNotifications),
  NotificationController.getUserNotifications
);

/**
 * @route   GET /api/notifications/count
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get(
  '/count',
  NotificationController.getUnreadCount
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private
 */
router.get(
  '/stats',
  NotificationController.getNotificationStats
);

/**
 * @route   GET /api/notifications/type/:type
 * @desc    Get notifications by type
 * @access  Private
 */
router.get(
  '/type/:type',
  validateQuery(notificationSchemas.getByType),
  NotificationController.getNotificationsByType
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put(
  '/:id/read',
  validateParams(notificationSchemas.markAsRead),
  NotificationController.markAsRead
);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put(
  '/read-all',
  NotificationController.markAllAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:id',
  validateParams(notificationSchemas.deleteNotification),
  NotificationController.deleteNotification
);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/',
  authorize(['admin']),
  validate(notificationSchemas.createNotification),
  NotificationController.createNotification
);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create bulk notifications (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/bulk',
  authorize(['admin']),
  validate(notificationSchemas.createBulkNotifications),
  NotificationController.createBulkNotifications
);

export { router as notificationRoutes };