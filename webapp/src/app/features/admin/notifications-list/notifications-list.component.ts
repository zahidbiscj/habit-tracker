import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationFirebaseService } from '../../../core/services/firebase/notification-firebase.service';
import { Notification } from '../../../core/models/notification.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css']
})
export class NotificationsListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;

  constructor(
    private notificationService: NotificationFirebaseService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.toast.error('Failed to load notifications');
        this.loading = false;
      }
    });
  }

  createNotification(): void {
    this.router.navigate(['/admin/notifications/create']);
  }

  editNotification(id: string): void {
    this.router.navigate(['/admin/notifications/edit', id]);
  }

  deleteNotification(notification: Notification): void {
    if (!confirm(`Are you sure you want to delete "${notification.title}"?`)) {
      return;
    }

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.toast.success('Notification deleted successfully');
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
        this.toast.error('Failed to delete notification');
      }
    });
  }

  getDaysDisplay(daysOfWeek: number[]): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (daysOfWeek.length === 7) return 'Everyday';
    return daysOfWeek.map(d => dayNames[d]).join(', ');
  }
}
