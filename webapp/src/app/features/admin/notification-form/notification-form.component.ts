import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationFirebaseService } from '../../../core/services/firebase/notification-firebase.service';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { BrowserNotificationService } from '../../../core/services/browser-notification.service';
import { Notification, NotificationModel } from '../../../core/models/notification.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.css']
})
export class NotificationFormComponent implements OnInit {
  notification: NotificationModel = new NotificationModel();
  isEditMode = false;
  loading = false;
  notificationId: string | null = null;
  currentUserId = '';

  daysOptions = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationFirebaseService,
    private authService: AuthFirebaseService,
    private browserNotification: BrowserNotificationService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId() || '';
    this.notificationId = this.route.snapshot.paramMap.get('id');
    
    if (this.notificationId) {
      this.isEditMode = true;
      this.loadNotification();
    }
  }

  loadNotification(): void {
    if (!this.notificationId) return;

    this.loading = true;
    this.notificationService.getNotificationById(this.notificationId).subscribe({
      next: (notification) => {
        if (notification) {
          this.notification = new NotificationModel(notification);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notification:', error);
        this.toast.error('Failed to load notification');
        this.loading = false;
      }
    });
  }

  isDaySelected(dayValue: number): boolean {
    return this.notification.daysOfWeek.includes(dayValue);
  }

  toggleDay(dayValue: number): void {
    const index = this.notification.daysOfWeek.indexOf(dayValue);
    if (index > -1) {
      this.notification.daysOfWeek.splice(index, 1);
    } else {
      this.notification.daysOfWeek.push(dayValue);
    }
    this.notification.daysOfWeek.sort((a, b) => a - b);
  }

  saveNotification(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.notification.updatedBy = this.currentUserId;

    if (this.isEditMode) {
      this.notificationService.updateNotification(this.notification).subscribe({
        next: () => {
          this.toast.success('Notification updated successfully!');
          this.router.navigate(['/admin/notifications']);
        },
        error: (error) => {
          console.error('Error updating notification:', error);
          this.toast.error('Failed to update notification');
          this.loading = false;
        }
      });
    } else {
      this.notification.createdBy = this.currentUserId;
      this.notificationService.createNotification(this.notification).subscribe({
        next: (createdNotification) => {
          this.loading = false;
          const daysString = this.getDaysString(this.notification.daysOfWeek);
          
          // Show success message with test option
          const testNow = confirm(
            `✅ Notification Created Successfully!\n\n` +
            `Title: ${createdNotification.title}\n` +
            `Time: ${createdNotification.time}\n` +
            `Days: ${daysString}\n` +
            `Status: ${createdNotification.active ? 'Active ✓' : 'Inactive'}\n\n` +
            `🔔 Do you want to test this notification NOW?\n` +
            `(Click OK to show a test notification)`
          );

          if (testNow) {
            this.testNotificationNow(createdNotification);
          } else {
            this.router.navigate(['/admin/notifications']);
          }
        },
        error: (error) => {
          console.error('Error creating notification:', error);
          this.toast.error('Failed to create notification: ' + (error.message || 'Unknown error'));
          this.loading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.notification.title.trim()) {
      this.toast.warn('Please enter a title');
      return false;
    }

    if (this.notification.title.length > 100) {
      this.toast.warn('Title must be 100 characters or less');
      return false;
    }

    if (!this.notification.body.trim()) {
      this.toast.warn('Please enter a message');
      return false;
    }

    if (this.notification.body.length > 500) {
      this.toast.warn('Message must be 500 characters or less');
      return false;
    }

    if (!this.notification.time.trim()) {
      this.toast.warn('Please enter a time');
      return false;
    }

    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(this.notification.time)) {
      this.toast.warn('Please enter a valid time in HH:mm format (00:00 to 23:59)');
      return false;
    }

    if (this.notification.daysOfWeek.length === 0) {
      this.toast.warn('Please select at least one day of the week');
      return false;
    }

    return true;
  }

  cancel(): void {
    this.router.navigate(['/admin/notifications']);
  }

  getDaysString(daysOfWeek: number[]): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (daysOfWeek.length === 7) return 'Everyday';
    if (daysOfWeek.length === 0) return 'None';
    return daysOfWeek.map(d => dayNames[d]).join(', ');
  }

  testNotificationNow(notification: Notification): void {
    console.log('🧪 Testing notification:', notification.title);
    
    this.browserNotification.requestPermission().subscribe(permission => {
      if (permission === 'granted') {
        this.browserNotification.show({
          title: '🧪 ' + notification.title,
          body: notification.body + '\n\nThis is a test. The actual notification will appear at ' + notification.time,
          requireInteraction: true
        }).subscribe(success => {
          if (success) {
            this.toast.success(
              'Test notification sent!\nDid you see the notification?\n\n' +
              'The real notification will appear:\n' +
              `• Time: ${notification.time}\n` +
              `• Days: ${this.getDaysString(notification.daysOfWeek)}\n\n` +
              'Make sure the app is open or installed as PWA.'
            );
            this.router.navigate(['/admin/notifications']);
          } else {
            this.toast.error('Failed to show test notification. Please check browser permissions.');
            this.router.navigate(['/admin/notifications']);
          }
        });
      } else {
        this.toast.error(
          `Notification permission: ${permission}\n\n` +
          'Please enable notifications in your browser settings to test.'
        );
        this.router.navigate(['/admin/notifications']);
      }
    });
  }
}
