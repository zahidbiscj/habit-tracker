import { Component, OnInit } from '@angular/core';
import { NotificationSchedulerService } from '../../../core/services/notification-scheduler.service';
import { BrowserNotificationService } from '../../../core/services/browser-notification.service';

@Component({
  selector: 'app-test-notification',
  templateUrl: './test-notification.component.html',
  styleUrls: ['./test-notification.component.css']
})
export class TestNotificationComponent implements OnInit {
  permissionStatus: string = '';

  constructor(
    private notificationScheduler: NotificationSchedulerService,
    private browserNotification: BrowserNotificationService
  ) {}

  ngOnInit(): void {
    this.permissionStatus = this.browserNotification.getPermission();
  }

  testNotification(): void {
    this.notificationScheduler.testNotification();
    
    // Update permission status after requesting
    setTimeout(() => {
      this.permissionStatus = this.browserNotification.getPermission();
    }, 500);
  }
}
