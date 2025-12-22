# Habit Tracker - Remaining Implementation Guide

This document contains all remaining component implementations needed to complete the app. Copy each section into its respective file.

## 1. Admin Notifications List Component

### File: `webapp/src/app/features/admin/notifications-list/notifications-list.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { INotificationService } from '../../../core/services/interfaces/notification.service.interface';
import { Notification } from '../../../core/models/notification.model';
import { TableColumn, TableAction } from '../../../shared/components/common/ht-table/ht-table.component';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css']
})
export class NotificationsListComponent implements OnInit {
  notifications: Notification[] = [];
  loading: boolean = false;
  columns: TableColumn[] = [];
  actions: TableAction[] = [];

  constructor(
    private notificationService: INotificationService,
    private router: Router
  ) {
    this.setupTable();
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  setupTable(): void {
    this.columns = [
      { field: 'title', header: 'Title', sortable: true, filterable: true },
      { field: 'body', header: 'Message', sortable: false, filterable: true },
      { field: 'time', header: 'Time', sortable: true, filterable: false },
      { 
        field: 'daysOfWeek', 
        header: 'Days', 
        sortable: false, 
        filterable: false,
        template: (row: Notification) => row.getDaysString()
      },
      { 
        field: 'active', 
        header: 'Status', 
        sortable: true, 
        filterable: false,
        template: (row: Notification) => row.active ? 'Active' : 'Inactive'
      }
    ];

    this.actions = [
      {
        icon: 'pi pi-pencil',
        label: 'Edit',
        severity: 'info',
        tooltip: 'Edit notification',
        visible: () => true,
        handler: (row: Notification) => this.editNotification(row)
      },
      {
        icon: 'pi pi-trash',
        label: 'Delete',
        severity: 'danger',
        tooltip: 'Delete notification',
        visible: () => true,
        handler: (row: Notification) => this.deleteNotification(row)
      }
    ];
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
        this.loading = false;
        alert('Failed to load notifications');
      }
    });
  }

  createNotification(): void {
    this.router.navigate(['/admin/notifications/create']);
  }

  editNotification(notification: Notification): void {
    this.router.navigate(['/admin/notifications/edit', notification.id]);
  }

  deleteNotification(notification: Notification): void {
    if (!confirm(`Are you sure you want to delete "${notification.title}"?`)) {
      return;
    }

    this.loading = true;
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.loading = false;
        alert('Notification deleted successfully');
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
        this.loading = false;
        alert('Failed to delete notification');
      }
    });
  }
}
```

### File: `webapp/src/app/features/admin/notifications-list/notifications-list.component.html`
```html
<div class="notifications-list-container">
  <ht-card 
    [title]="'Notifications Management'" 
    [subtitle]="'Manage all scheduled notifications'"
    [showActions]="true">
    <div cardActions>
      <ht-button
        [label]="'Create New Notification'"
        [icon]="'pi pi-plus'"
        [severity]="'primary'"
        (onClick)="createNotification()">
      </ht-button>
    </div>

    <div class="table-container">
      <ht-table
        [data]="notifications"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading"
        [searchable]="true"
        [paginator]="true"
        [rows]="10">
      </ht-table>
    </div>
  </ht-card>
</div>
```

### File: `webapp/src/app/features/admin/notifications-list/notifications-list.component.css`
```css
.notifications-list-container {
  padding: 1rem;
}

.table-container {
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .notifications-list-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .notifications-list-container {
    padding: 2rem;
  }
}
```

## 2. Admin Notification Form Component

### File: `webapp/src/app/features/admin/notification-form/notification-form.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INotificationService } from '../../../core/services/interfaces/notification.service.interface';
import { IAuthService } from '../../../core/services/interfaces/auth.service.interface';

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.css']
})
export class NotificationFormComponent implements OnInit {
  isEditMode: boolean = false;
  notificationId: string | null = null;
  
  title: string = '';
  body: string = '';
  time: string = '09:00';
  selectedDays: number[] = [];
  
  daysOptions = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];
  
  loading: boolean = false;
  currentUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: INotificationService,
    private authService: IAuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId() || '';
    
    this.notificationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.notificationId;
    
    if (this.isEditMode && this.notificationId) {
      this.loadNotification(this.notificationId);
    } else {
      // Default: all days selected
      this.selectedDays = [0, 1, 2, 3, 4, 5, 6];
    }
  }

  loadNotification(notificationId: string): void {
    this.loading = true;
    this.notificationService.getNotificationById(notificationId).subscribe({
      next: (notification) => {
        if (notification) {
          this.title = notification.title;
          this.body = notification.body;
          this.time = notification.time;
          this.selectedDays = [...notification.daysOfWeek];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notification:', error);
        this.loading = false;
        alert('Failed to load notification');
        this.router.navigate(['/admin/notifications']);
      }
    });
  }

  onSubmit(): void {
    if (!this.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!this.body.trim()) {
      alert('Message body is required');
      return;
    }

    if (this.selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.notificationId) {
      this.updateNotification();
    } else {
      this.createNotification();
    }
  }

  createNotification(): void {
    const notificationData = {
      title: this.title.trim(),
      body: this.body.trim(),
      time: this.time,
      daysOfWeek: this.selectedDays,
      active: true,
      createdDate: new Date(),
      updatedDate: new Date(),
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId
    };

    this.notificationService.createNotification(notificationData).subscribe({
      next: () => {
        this.loading = false;
        alert('Notification created successfully');
        this.router.navigate(['/admin/notifications']);
      },
      error: (error) => {
        console.error('Error creating notification:', error);
        this.loading = false;
        alert('Failed to create notification');
      }
    });
  }

  updateNotification(): void {
    if (!this.notificationId) return;

    const updates = {
      title: this.title.trim(),
      body: this.body.trim(),
      time: this.time,
      daysOfWeek: this.selectedDays,
      updatedBy: this.currentUserId
    };

    this.notificationService.updateNotification(this.notificationId, updates).subscribe({
      next: () => {
        this.loading = false;
        alert('Notification updated successfully');
        this.router.navigate(['/admin/notifications']);
      },
      error: (error) => {
        console.error('Error updating notification:', error);
        this.loading = false;
        alert('Failed to update notification');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/notifications']);
  }
}
```

### File: `webapp/src/app/features/admin/notification-form/notification-form.component.html`
```html
<div class="notification-form-container">
  <ht-card 
    [title]="isEditMode ? 'Edit Notification' : 'Create New Notification'" 
    [subtitle]="isEditMode ? 'Update notification details' : 'Add a new scheduled notification'">
    <div class="form-content">
      <ht-input
        [(ngModel)]="title"
        [label]="'Title'"
        [placeholder]="'Enter notification title'"
        [required]="true"
        [disabled]="loading">
      </ht-input>

      <ht-textarea
        [(ngModel)]="body"
        [label]="'Message Body'"
        [placeholder]="'Enter notification message'"
        [rows]="4"
        [required]="true"
        [disabled]="loading">
      </ht-textarea>

      <ht-input
        [(ngModel)]="time"
        [label]="'Time (HH:mm)'"
        [type]="'time'"
        [required]="true"
        [disabled]="loading">
      </ht-input>

      <div class="days-section">
        <label class="days-label">Days of Week</label>
        <div class="days-checkboxes">
          <div *ngFor="let day of daysOptions">
            <ht-checkbox
              [(ngModel)]="selectedDays"
              [value]="day.value"
              [label]="day.label">
            </ht-checkbox>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <ht-button
          [label]="'Cancel'"
          [severity]="'secondary'"
          [outlined]="true"
          (onClick)="onCancel()">
        </ht-button>
        <ht-button
          [label]="isEditMode ? 'Update Notification' : 'Create Notification'"
          [severity]="'primary'"
          [loading]="loading"
          (onClick)="onSubmit()">
        </ht-button>
      </div>
    </div>
  </ht-card>
</div>
```

### File: `webapp/src/app/features/admin/notification-form/notification-form.component.css`
```css
.notification-form-container {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.days-section {
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.days-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.days-checkboxes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

@media (min-width: 768px) {
  .notification-form-container {
    padding: 1.5rem;
  }

  .days-checkboxes {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .notification-form-container {
    padding: 2rem;
  }

  .days-checkboxes {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 3. Settings Component (Shared by Admin and User)

### File: `webapp/src/app/features/shared/settings/settings.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { IAuthService } from '../../../core/services/interfaces/auth.service.interface';
import { IUserService } from '../../../core/services/interfaces/user.service.interface';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  
  // Profile fields
  name: string = '';
  email: string = '';
  profileLoading: boolean = false;
  
  // Password fields
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordLoading: boolean = false;
  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: IAuthService,
    private userService: IUserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.name = user.name;
          this.email = user.email;
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });
  }

  onUpdateProfile(): void {
    if (!this.user) return;

    if (!this.name.trim()) {
      this.errorMessage = 'Name is required';
      return;
    }

    this.profileLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Update name in Firestore
    this.userService.updateUser(this.user.id, { name: this.name.trim() }).subscribe({
      next: () => {
        // Update email if changed
        if (this.email !== this.user!.email) {
          this.authService.updateEmail(this.email).subscribe({
            next: () => {
              this.profileLoading = false;
              this.successMessage = 'Profile updated successfully';
              this.loadUserData();
            },
            error: (error) => {
              console.error('Error updating email:', error);
              this.profileLoading = false;
              this.errorMessage = error.message || 'Failed to update email';
            }
          });
        } else {
          this.profileLoading = false;
          this.successMessage = 'Profile updated successfully';
          this.loadUserData();
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.profileLoading = false;
        this.errorMessage = 'Failed to update profile';
      }
    });
  }

  onUpdatePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all password fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.passwordLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.updatePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.successMessage = 'Password updated successfully';
        // Clear password fields
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.passwordLoading = false;
        this.errorMessage = error.message || 'Failed to update password';
      }
    });
  }
}
```

### File: `webapp/src/app/features/shared/settings/settings.component.html`
```html
<div class="settings-container">
  <ht-card 
    [title]="'Settings'" 
    [subtitle]="'Manage your account settings'">
    <div class="settings-content">
      <!-- Success/Error Messages -->
      <div class="success-message" *ngIf="successMessage">
        {{ successMessage }}
      </div>
      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <!-- Profile Section -->
      <div class="settings-section">
        <h3>Profile Information</h3>
        <div class="form-fields">
          <ht-input
            [(ngModel)]="name"
            [label]="'Name'"
            [placeholder]="'Enter your name'"
            [required]="true"
            [disabled]="profileLoading">
          </ht-input>

          <ht-input
            [(ngModel)]="email"
            [label]="'Email'"
            [type]="'email'"
            [placeholder]="'Enter your email'"
            [required]="true"
            [disabled]="profileLoading">
          </ht-input>

          <ht-button
            [label]="'Update Profile'"
            [severity]="'primary'"
            [loading]="profileLoading"
            (onClick)="onUpdateProfile()">
          </ht-button>
        </div>
      </div>

      <!-- Password Section -->
      <div class="settings-section">
        <h3>Change Password</h3>
        <div class="form-fields">
          <ht-input
            [(ngModel)]="currentPassword"
            [label]="'Current Password'"
            [type]="'password'"
            [placeholder]="'Enter current password'"
            [required]="true"
            [disabled]="passwordLoading">
          </ht-input>

          <ht-input
            [(ngModel)]="newPassword"
            [label]="'New Password'"
            [type]="'password'"
            [placeholder]="'Enter new password'"
            [required]="true"
            [helperText]="'At least 6 characters'"
            [disabled]="passwordLoading">
          </ht-input>

          <ht-input
            [(ngModel)]="confirmPassword"
            [label]="'Confirm New Password'"
            [type]="'password'"
            [placeholder]="'Confirm new password'"
            [required]="true"
            [disabled]="passwordLoading">
          </ht-input>

          <ht-button
            [label]="'Update Password'"
            [severity]="'primary'"
            [loading]="passwordLoading"
            (onClick)="onUpdatePassword()">
          </ht-button>
        </div>
      </div>
    </div>
  </ht-card>
</div>
```

### File: `webapp/src/app/features/shared/settings/settings.component.css`
```css
.settings-container {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.success-message {
  padding: 0.75rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 0.375rem;
  color: #155724;
  font-size: 0.875rem;
}

.error-message {
  padding: 0.75rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 0.375rem;
  color: #c33;
  font-size: 0.875rem;
}

.settings-section {
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.settings-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .settings-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .settings-container {
    padding: 2rem;
  }
}
```

---

**Continue with User Pages in next section...**
