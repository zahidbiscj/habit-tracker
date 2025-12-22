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
      alert('❌ Your browser does not support notifications. Please use Chrome, Edge, or Firefox.');
      return of('denied');
    }

    if (this.permission === 'granted') {
      console.log('✅ Permission already granted');
      return of('granted');
    }

    console.log('🔔 Requesting notification permission...');
    
    return from(Notification.requestPermission()).pipe(
      map(permission => {
        this.permission = permission;
        console.log('📋 Permission result:', permission);
        
        if (permission === 'granted') {
          console.log('✅ User granted notification permission!');
        } else if (permission === 'denied') {
          console.warn('❌ User denied notification permission');
          alert('⚠️ You blocked notifications!\n\nTo enable:\n1. Click the 🔒 lock icon in address bar\n2. Go to Site Settings\n3. Change Notifications to "Allow"\n4. Refresh the page');
        }
        
        return permission;
      }),
      catchError(error => {
        console.error('Error requesting notification permission:', error);
        alert('Failed to request notification permission. Please check your browser settings.');
        return of('denied' as NotificationPermission);
      })
    );
  }

  /**
   * Show a browser notification
   */
  show(options: BrowserNotificationOptions): Observable<boolean> {
    console.log('🔔 Attempting to show notification:', options.title);
    
    if (!this.isSupported()) {
      console.warn('❌ Notifications not supported');
      alert('Your browser does not support notifications');
      return of(false);
    }

    if (this.permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted:', this.permission);
      alert(`Cannot show notification.\nPermission status: ${this.permission}\n\nPlease click "Test Instant Notification" first to grant permission.`);
      return of(false);
    }

    try {
      console.log('✅ Creating notification...');
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/assets/icons/icon-192x192.svg',
        badge: options.badge || '/assets/icons/icon-72x72.svg',
        tag: options.tag || 'habit-tracker-notification',
        requireInteraction: options.requireInteraction || false
      });

      console.log('✅ Notification created successfully!');

      // Auto close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          console.log('⏰ Auto-closing notification');
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        console.log('👆 Notification clicked');
        window.focus();
        notification.close();
      };

      notification.onerror = (event) => {
        console.error('❌ Notification error:', event);
      };

      notification.onshow = () => {
        console.log('👁️ Notification shown on device');
      };

      notification.onclose = () => {
        console.log('❌ Notification closed');
      };

      return of(true);
    } catch (error) {
      console.error('❌ Error showing notification:', error);
      alert(`Failed to show notification: ${error}`);
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
