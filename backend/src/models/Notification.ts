import mongoose, { Schema, Document } from 'mongoose';
import { BaseDocument } from '../types';

export interface INotification extends BaseDocument {
  recipient: mongoose.Types.ObjectId;
  type: 'achievement' | 'challenge' | 'social' | 'system';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  channels: ('email' | 'push')[];
  status: {
    isRead: boolean;
    readAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
  };
  expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['achievement', 'challenge', 'social', 'system'],
      message: 'Type must be one of: achievement, challenge, social, system'
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be one of: low, medium, high'
    },
    default: 'medium'
  },
  channels: [{
    type: String,
    enum: {
      values: ['email', 'push'],
      message: 'Channel must be one of: email, push'
    }
  }],
  status: {
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    }
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, 'status.isRead': 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, 'status.isDelivered': 1 });

// Virtual for age in minutes
notificationSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60));
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.status.isRead = true;
  this.status.readAt = new Date();
  return this.save();
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = async function() {
  this.status.isDelivered = true;
  this.status.deliveredAt = new Date();
  return this.save();
};

// Static method to get unread notifications
notificationSchema.statics.getUnread = function(userId: string, limit = 50) {
  return this.find({
    recipient: userId,
    'status.isRead': false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get notification count
notificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({
    recipient: userId,
    'status.isRead': false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    {
      recipient: userId,
      'status.isRead': false
    },
    {
      $set: {
        'status.isRead': true,
        'status.readAt': new Date()
      }
    }
  );
};

// Static method to get notifications by type
notificationSchema.statics.getByType = function(userId: string, type: string, limit = 20) {
  return this.find({
    recipient: userId,
    type,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to create and deliver notification
notificationSchema.statics.createAndDeliver = async function(notificationData: Partial<INotification>) {
  const notification = new this(notificationData);
  await notification.save();
  
  // TODO: Implement notification delivery via email/push
  
  return notification;
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);