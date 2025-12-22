import { Injectable } from '@angular/core';
import { BrowserNotificationService } from './browser-notification.service';
import { NotificationFirebaseService } from './firebase/notification-firebase.service';
import { Notification as NotificationModel } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationSchedulerService {
  private checkInterval: any;
  private notifiedToday: Set<string> = new Set();

  constructor(
    private browserNotification: BrowserNotificationService,
    private notificationService: NotificationFirebaseService
  ) {}

  /**
   * Start checking for scheduled notifications every minute
   */
  startScheduler(): void {
    // Request permission first
    this.browserNotification.requestPermission().subscribe(permission => {
      if (permission === 'granted') {
        console.log('✓ Notification permission granted');
        this.checkNotifications();
        
        // Check every minute
        this.checkInterval = setInterval(() => {
          this.checkNotifications();
        }, 60000); // 60 seconds
      } else {
        console.warn('⚠ Notification permission denied');
      }
    });

    // Reset the "notified today" set at midnight
    this.resetAtMidnight();
  }

  /**
   * Stop the scheduler
   */
  stopScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for notifications that should be triggered now
   */
  private checkNotifications(): void {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
    const currentTime = this.formatTime(now);

    console.log(`🔍 Checking notifications at ${currentTime} (Day: ${currentDay} = ${this.getDayName(currentDay)})`);

    this.notificationService.getActiveNotifications().subscribe({
      next: (notifications) => {
        console.log(`📋 Found ${notifications.length} active notifications`);
        
        notifications.forEach(notification => {
          const shouldTrigger = this.shouldTrigger(notification, currentDay, currentTime);
          console.log(`📌 "${notification.title}":`, {
            scheduledTime: notification.time,
            currentTime: currentTime,
            scheduledDays: notification.daysOfWeek.map(d => this.getDayName(d)),
            currentDay: this.getDayName(currentDay),
            timeMatch: notification.time === currentTime,
            dayMatch: notification.daysOfWeek.includes(currentDay),
            alreadyNotified: this.notifiedToday.has(`${notification.id}-${currentTime}`),
            willTrigger: shouldTrigger
          });
          
          if (shouldTrigger) {
            console.log(`🔔 TRIGGERING: ${notification.title}`);
            this.triggerNotification(notification);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error checking notifications:', error);
      }
    });
  }

  /**
   * Check if a notification should be triggered
   */
  private shouldTrigger(
    notification: NotificationModel, 
    currentDay: number, 
    currentTime: string
  ): boolean {
    // Check if notification is for today
    if (!notification.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Check if it's the right time
    if (notification.time !== currentTime) {
      return false;
    }

    // Check if we already notified for this notification today
    const notificationKey = `${notification.id}-${currentTime}`;
    if (this.notifiedToday.has(notificationKey)) {
      return false;
    }

    return true;
  }

  /**
   * Trigger a browser notification
   */
  private triggerNotification(notification: NotificationModel): void {
    const notificationKey = `${notification.id}-${this.formatTime(new Date())}`;
    
    this.browserNotification.show({
      title: notification.title,
      body: notification.body,
      icon: '/assets/icons/icon-192x192.svg',
      badge: '/assets/icons/icon-72x72.svg',
      tag: notification.id,
      requireInteraction: false
    }).subscribe(success => {
      if (success) {
        console.log(`✓ Notification shown: ${notification.title}`);
        this.notifiedToday.add(notificationKey);
      }
    });
  }

  /**
   * Format time as HH:mm
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Get day name for logging
   */
  private getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  }

  /**
   * Get scheduler status info
   */
  getSchedulerStatus(): any {
    const now = new Date();
    return {
      isRunning: !!this.checkInterval,
      permission: this.browserNotification.getPermission(),
      currentTime: this.formatTime(now),
      currentDay: this.getDayName(now.getDay()),
      currentDayNumber: now.getDay(),
      notifiedCount: this.notifiedToday.size
    };
  }

  /**
   * Schedule a test notification for next minute
   */
  scheduleTestForNextMinute(): void {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    nextMinute.setSeconds(0);
    
    const testTime = this.formatTime(nextMinute);
    const testDay = nextMinute.getDay();
    
    console.log(`🧪 Creating test notification for ${testTime} (${this.getDayName(testDay)})`);
    
    // Create a temporary test notification
    const testNotification = {
      id: 'test-' + Date.now(),
      title: '🧪 Test Notification',
      body: `This notification was scheduled for ${testTime}. If you see this, scheduling works!`,
      time: testTime,
      daysOfWeek: [testDay],
      active: true,
      createdDate: new Date(),
      updatedDate: new Date(),
      createdBy: 'test',
      updatedBy: 'test'
    };
    
    // Save it to Firebase
    this.notificationService.createNotification(testNotification).subscribe({
      next: () => {
        alert(`✅ Test notification scheduled for ${testTime} (in ~1 minute).\n\nWatch your device for the notification!\n\nCurrent time: ${this.formatTime(now)}\nNotification time: ${testTime}`);
      },
      error: (error) => {
        console.error('Error creating test notification:', error);
        alert('Failed to create test notification');
      }
    });
  }

  /**
   * Reset the notified set at midnight
   */
  private resetAtMidnight(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.notifiedToday.clear();
      console.log('✓ Notification cache cleared at midnight');
      
      // Schedule next midnight reset
      this.resetAtMidnight();
    }, msUntilMidnight);
  }

  /**
   * Test notification (for debugging)
   */
  testNotification(): void {
    this.browserNotification.requestPermission().subscribe(permission => {
      if (permission === 'granted') {
        this.browserNotification.show({
          title: '🎯 Test Notification',
          body: 'If you see this, notifications are working!',
          requireInteraction: false
        }).subscribe();
      } else {
        alert('Please enable notifications in your browser settings');
      }
    });
  }
}
