import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationSchedulerService } from '../../../core/services/notification-scheduler.service';
import { BrowserNotificationService } from '../../../core/services/browser-notification.service';

@Component({
  selector: 'app-test-notification',
  templateUrl: './test-notification.component.html',
  styleUrls: ['./test-notification.component.css']
})
export class TestNotificationComponent implements OnInit, OnDestroy {
  schedulerStatus: any = null;
  private statusInterval: any;

  constructor(
    private notificationScheduler: NotificationSchedulerService,
    private browserNotification: BrowserNotificationService
  ) {}

  ngOnInit(): void {
    this.updateStatus();
    
    // Update status every second
    this.statusInterval = setInterval(() => {
      this.updateStatus();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  updateStatus(): void {
    this.schedulerStatus = this.notificationScheduler.getSchedulerStatus();
  }

  testNotification(): void {
    this.notificationScheduler.testNotification();
    
    // Update permission status after requesting
    setTimeout(() => {
      this.updateStatus();
    }, 500);
  }

  scheduleTestForNextMinute(): void {
    if (this.schedulerStatus.permission !== 'granted') {
      alert('Please enable notifications first by clicking "Test Instant Notification"');
      return;
    }
    
    this.notificationScheduler.scheduleTestForNextMinute();
  }
}
