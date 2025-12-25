import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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

  constructor(private toast: ToastService) {
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
      this.toast.error('Your browser does not support notifications. Please use Chrome, Edge, or Firefox.');
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
          // this.toast.warn('You blocked notifications! Please enable from site settings and refresh.');
        }
        
        return permission;
      }),
      catchError(error => {
        console.error('Error requesting notification permission:', error);
        this.toast.error('Failed to request notification permission. Please check your browser settings.');
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
      this.toast.error('Your browser does not support notifications');
      return of(false);
    }

    if (this.permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted:', this.permission);
      this.toast.warn(`Cannot show notification. Permission status: ${this.permission}. Please enable notifications.`);
      return of(false);
    }

    // Check if service worker is available (PWA)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('✅ Using Service Worker API for notification');
      
      return from(navigator.serviceWorker.ready).pipe(
        map(registration => {
          registration.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/assets/icons/icon-192x192.svg',
            badge: options.badge || '/assets/icons/icon-72x72.svg',
            tag: options.tag || 'habit-tracker-notification',
            requireInteraction: options.requireInteraction || false,
            data: {
              url: window.location.origin
            }
          });
          console.log('✅ Service Worker notification created successfully!');
          return true;
        }),
        catchError(error => {
          console.error('❌ Service Worker notification error:', error);
          // Fallback to direct notification
          return this.showDirectNotification(options);
        })
      );
    } else {
      // No service worker, use direct Notification API
      console.log('📱 Using direct Notification API (no service worker)');
      return this.showDirectNotification(options);
    }
  }

  /**
   * Show notification using direct Notification API
   */
  private showDirectNotification(options: BrowserNotificationOptions): Observable<boolean> {
    try {
      console.log('✅ Creating direct notification...');
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/assets/icons/icon-192x192.svg',
        badge: options.badge || '/assets/icons/icon-72x72.svg',
        tag: options.tag || 'habit-tracker-notification',
        requireInteraction: options.requireInteraction || false
      });

      console.log('✅ Direct notification created successfully!');

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
      console.error('❌ Error showing direct notification:', error);
      this.toast.error(`Failed to show notification: ${error}. Try refreshing the page or using a different browser.`);
      return of(false);
    }
  }

}
