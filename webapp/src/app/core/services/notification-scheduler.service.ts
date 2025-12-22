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
    // Prevent multiple schedulers
    if (this.checkInterval) {
      console.log('⚠️ Scheduler already running');
      return;
    }

    console.log('🚀 Starting notification scheduler...');

    // Kick off a permission request (non-blocking for the scheduler)
    this.browserNotification.requestPermission().subscribe(permission => {
      console.log(`🔐 Notification permission status: ${permission}`);
    });

    // Run an immediate check so we don't miss near-time notifications
    console.log('▶️ Running initial notification check...');
    this.checkNotifications();

    // Align the interval exactly to the next minute boundary to improve reliability
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
      // First aligned check at HH:mm:00
      this.checkNotifications();
      // Subsequent checks every full minute
      this.checkInterval = setInterval(() => {
        this.checkNotifications();
      }, 60000); // 60 seconds
      console.log('✅ Scheduler aligned to minute boundary and started');
    }, Math.max(msToNextMinute, 0));

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
        
        if (notifications.length === 0) {
          console.log('ℹ️ No active notifications to check');
          return;
        }
        
        notifications.forEach(notification => {
          const shouldTrigger = this.shouldTrigger(notification, currentDay, currentTime);
          console.log(`📌 "${notification.title}":`, {
            id: notification.id,
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
    // Normalize days in case Firestore has strings (e.g., '0', 'Sun', 'Sunday')
    const normalizedDays = this.normalizeDays(notification.daysOfWeek as any);
    if (!normalizedDays.includes(currentDay)) {
      return false;
    }

    // Allow a window around the scheduled minute so we never miss due to drift
    const now = new Date();
    const withinWindow = this.isWithinScheduledWindow(now, notification.time, 45); // seconds
    if (!withinWindow) {
      return false;
    }

    // Dedupe within the day for the scheduled minute
    const notificationKey = this.buildDailyNotificationKey(notification.id, notification.time);
    if (this.notifiedToday.has(notificationKey)) {
      return false;
    }

    return true;
  }

  /**
   * Trigger a browser notification
   */
  private triggerNotification(notification: NotificationModel): void {
    const notificationKey = this.buildDailyNotificationKey(notification.id, notification.time);
    
    console.log(`🔔 TRIGGERING NOTIFICATION: "${notification.title}"`);
    
    // Request permission first (in case it was revoked)
    this.browserNotification.requestPermission().subscribe(permission => {
      if (permission === 'granted') {
        console.log('✅ Permission granted, showing notification...');
        
        // Use the same method as Test Instant Notification
        this.browserNotification.show({
          title: notification.title,
          body: notification.body,
          icon: '/assets/icons/icon-192x192.svg',
          badge: '/assets/icons/icon-72x72.svg',
          tag: notification.id,
          requireInteraction: true // Keep it open like test notification
        }).subscribe(success => {
          if (success) {
            console.log(`✅✅✅ NOTIFICATION SHOWN: ${notification.title}`);
            this.notifiedToday.add(notificationKey);
          } else {
            console.error(`❌ Failed to show notification: ${notification.title}`);
          }
        });
      } else {
        console.error(`❌ Permission denied: ${permission}`);
      }
    });
  }

  /**
   * Normalize an array of days to number[0..6]
   */
  private normalizeDays(days: Array<number | string>): number[] {
    const mapNameToNum: Record<string, number> = {
      sun: 0, sunday: 0,
      mon: 1, monday: 1,
      tue: 2, tuesday: 2,
      wed: 3, wednesday: 3,
      thu: 4, thursday: 4,
      fri: 5, friday: 5,
      sat: 6, saturday: 6
    };
    const out: number[] = [];
    for (const d of days || []) {
      if (typeof d === 'number' && d >= 0 && d <= 6) {
        out.push(d);
      } else if (typeof d === 'string') {
        const trimmed = d.trim().toLowerCase();
        if (/^[0-6]$/.test(trimmed)) {
          out.push(parseInt(trimmed, 10));
        } else if (mapNameToNum.hasOwnProperty(trimmed)) {
          out.push(mapNameToNum[trimmed]);
        }
      }
    }
    // Remove duplicates
    return Array.from(new Set(out)).sort((a, b) => a - b);
  }

  /**
   * Determine if now is within N seconds of the scheduled HH:mm of today
   */
  private isWithinScheduledWindow(now: Date, hhmm: string, secondsWindow: number): boolean {
    const [hhStr, mmStr] = hhmm.split(':');
    const scheduled = new Date(now);
    scheduled.setHours(parseInt(hhStr, 10), parseInt(mmStr, 10), 0, 0);
    const diffMs = Math.abs(now.getTime() - scheduled.getTime());
    return diffMs <= secondsWindow * 1000;
  }

  /**
   * Build a unique key per day and scheduled minute for dedupe
   */
  private buildDailyNotificationKey(id: string, hhmm: string): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    return `${id}-${yyyy}-${mm}-${dd}-${hhmm}`;
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
    console.log('Current scheduler status:', {
      isRunning: !!this.checkInterval,
      permission: this.browserNotification.getPermission(),
      currentTime: this.formatTime(now)
    });
    
    if (!this.checkInterval) {
      alert('❌ SCHEDULER NOT RUNNING!\n\nThe scheduler is not active. Please:\n1. Refresh the page\n2. Make sure you are logged in\n3. Try again');
      return;
    }
    
    // Create a temporary test notification
    const testNotification = {
      id: 'test-' + Date.now(),
      title: '🧪 Test Scheduled Notification',
      body: `This was scheduled for ${testTime}. If you see this, scheduled notifications work!`,
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
        console.log('✅ Test notification created successfully');
        console.log('📋 Notification details:', testNotification);
        
        // Force an immediate check to verify it's in the database
        setTimeout(() => {
          console.log('🔍 Verifying notification was saved...');
          this.notificationService.getActiveNotifications().subscribe({
            next: (notifications) => {
              const found = notifications.find(n => n.id === testNotification.id);
              if (found) {
                console.log('✅ Notification found in database:', found);
              } else {
                console.error('❌ Notification NOT found in database!');
              }
            }
          });
        }, 1000);
        
        alert(`✅ Test notification scheduled!\n\n` +
              `Current time: ${this.formatTime(now)}\n` +
              `Notification time: ${testTime}\n` +
              `Day: ${this.getDayName(testDay)}\n\n` +
              `⏳ Wait ~1 minute...\n` +
              `📺 Keep this tab OPEN\n` +
              `🔍 Watch console (F12) for logs\n\n` +
              `Scheduler checks every 60 seconds at :00`);
      },
      error: (error) => {
        console.error('❌ Error creating test notification:', error);
        alert('Failed to create test notification: ' + error.message);
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
    console.log('🧪 Testing notification...');
    
    this.browserNotification.requestPermission().subscribe(permission => {
      console.log('Permission received:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Permission granted, showing test notification...');
        
        this.browserNotification.show({
          title: '🎯 Test Notification',
          body: 'SUCCESS! If you see this, notifications are working perfectly! 🎉',
          requireInteraction: true // Keep it open until user clicks
        }).subscribe(success => {
          console.log('Notification show result:', success);
          
          if (success) {
            console.log('✅✅✅ NOTIFICATION SHOWN SUCCESSFULLY!');
            setTimeout(() => {
              alert('✅ Notification shown!\n\nDid you see a popup notification?\n\nIf YES: Notifications are working!\nIf NO: Check notification center or system tray');
            }, 500);
          } else {
            console.error('❌ Failed to show notification');
            alert('❌ Failed to show notification.\n\nTroubleshooting:\n1. Check if Do Not Disturb is enabled\n2. Check notification center/system tray\n3. Try a different browser');
          }
        });
      } else {
        console.warn('❌ Permission denied or unavailable');
        alert(`❌ Cannot show notifications.\n\nPermission: ${permission}\n\nPlease enable notifications in your browser settings.`);
      }
    });
  }

  /**
   * Force check notifications immediately (for testing)
   */
  forceCheck(): void {
    console.log('🔧 FORCE CHECK - Running notification check immediately...');
    this.checkNotifications();
  }
}
