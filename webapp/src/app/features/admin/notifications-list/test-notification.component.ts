import { Component, OnInit } from '@angular/core';
import { BrowserNotificationService } from '../../../core/services/browser-notification.service';
import { MessagingFirebaseService } from '../../../core/services/firebase/messaging-firebase.service';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-test-notification',
  templateUrl: './test-notification.component.html',
  styleUrls: ['./test-notification.component.css']
})
export class TestNotificationComponent implements OnInit {
  fcmToken: string | null = null;
  pushSupported = false;
  notificationPermission: NotificationPermission = 'default';
  vapidConfigured = !!(environment as any).firebase?.vapidKey && (environment as any).firebase?.vapidKey !== 'REPLACE_WITH_YOUR_PUBLIC_VAPID_KEY';

  constructor(
    private browserNotification: BrowserNotificationService,
    private messagingService: MessagingFirebaseService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.pushSupported = 'serviceWorker' in navigator;
    this.notificationPermission = this.browserNotification.getPermission();
  }

  testNotification(): void {
    this.browserNotification.requestPermission().subscribe(permission => {
      this.notificationPermission = permission;
      if (permission === 'granted') {
        this.browserNotification.show({
          title: '🎯 Test Notification',
          body: 'SUCCESS! If you see this, notifications are working perfectly! 🎉',
          requireInteraction: true
        }).subscribe(success => {
          if (success) {
            this.toast.success('Notification shown!\nDid you see a popup notification?\nIf YES: Notifications are working!\nIf NO: Check notification center or system tray');
          } else {
            this.toast.error('Failed to show notification.\nTroubleshooting:\n1. Check if Do Not Disturb is enabled\n2. Check notification center/system tray\n3. Try a different browser');
          }
        });
      } else {
        this.toast.error(`Cannot show notifications.\n\nPermission: ${permission}\n\nPlease enable notifications in your browser settings.`);
      }
    });
  }

  enablePush(): void {
    if (!this.vapidConfigured) {
      this.toast.error('Missing VAPID key. Add firebase.vapidKey in environment files.');
      return;
    }
    this.messagingService.initAndRegisterToken().subscribe(token => {
      this.fcmToken = token;
      if (token) {
        this.toast.success('Push enabled! Token saved to your user profile.');
      } else {
        this.toast.warn('Could not enable push. Check permissions and VAPID key.');
      }
    });
  }

  attachForeground(): void {
    this.messagingService.attachForegroundHandler();
    this.toast.info('Foreground push handler attached. Send a push to test.');
  }
}
