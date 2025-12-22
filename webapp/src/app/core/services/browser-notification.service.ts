import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BrowserNotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Check if browser supports notifications
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission from user
   */
  requestPermission(): Observable<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Browser does not support notifications');
      return of('denied');
    }

    if (this.permission === 'granted') {
      return of('granted');
    }

    return from(Notification.requestPermission()).pipe(
      map(permission => {
        this.permission = permission;
        return permission;
      }),
      catchError(error => {
        console.error('Error requesting notification permission:', error);
        return of('denied' as NotificationPermission);
      })
    );
  }

  /**
   * Show a browser notification
   */
  show(options: BrowserNotificationOptions): Observable<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return of(false);
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return of(false);
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/assets/icons/icon-192x192.svg',
        badge: options.badge || '/assets/icons/icon-72x72.svg',
        tag: options.tag || 'habit-tracker-notification',
        requireInteraction: options.requireInteraction || false
      });

      // Auto close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return of(true);
    } catch (error) {
      console.error('Error showing notification:', error);
      return of(false);
    }
  }

  /**
   * Schedule a notification (uses setTimeout - only works while app is open)
   */
  scheduleNotification(options: BrowserNotificationOptions, delayMs: number): void {
    setTimeout(() => {
      this.show(options).subscribe();
    }, delayMs);
  }
}
