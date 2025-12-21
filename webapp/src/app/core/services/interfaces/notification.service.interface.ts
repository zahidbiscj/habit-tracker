import { Observable } from 'rxjs';
import { Notification } from '../../models/notification.model';

/**
 * Provider-agnostic Notification Service Interface
 */
export interface INotificationService {
  /**
   * Get notification by ID
   */
  getNotificationById(notificationId: string): Observable<Notification | null>;

  /**
   * Get all notifications
   */
  getAllNotifications(): Observable<Notification[]>;

  /**
   * Get active notifications
   */
  getActiveNotifications(): Observable<Notification[]>;

  /**
   * Create a new notification
   */
  createNotification(notification: Notification): Observable<Notification>;

  /**
   * Update an existing notification
   */
  updateNotification(notification: Notification): Observable<void>;

  /**
   * Delete a notification (soft delete - set active=false)
   */
  deleteNotification(notificationId: string): Observable<void>;
}
