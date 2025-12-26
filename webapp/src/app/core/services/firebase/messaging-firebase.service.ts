import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthFirebaseService } from './auth-firebase.service';
import { UserFirebaseService } from './user-firebase.service';
import { BrowserNotificationService } from '../browser-notification.service';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';

@Injectable({ providedIn: 'root' })
export class MessagingFirebaseService {
  private messaging: Messaging | null = null;

  constructor(
    private authService: AuthFirebaseService,
    private userService: UserFirebaseService,
    private browserNotification: BrowserNotificationService
  ) {}

  /** Initialize messaging and register SW, return token */
  initAndRegisterToken(): Observable<string | null> {
    return from(isSupported()).pipe(
      switchMap(supported => {
        if (!supported) {
          console.warn('FCM messaging not supported in this browser');
          return of(null);
        }

        // Register messaging service worker - use absolute path
        const swPath = self.location?.origin ? '/firebase-messaging-sw.js' : './firebase-messaging-sw.js';
        return from(navigator.serviceWorker.register(swPath, { scope: '/' })).pipe(
          switchMap(swReg => {
            const app = initializeApp(environment.firebase);
            this.messaging = getMessaging(app);

            // Request notification permission
            return this.browserNotification.requestPermission().pipe(
              switchMap(permission => {
                if (permission !== 'granted') {
                  return of(null);
                }
                const vapidKey = (environment as any).firebase.vapidKey;
                if (!vapidKey) {
                  console.warn('Missing VAPID key in environment');
                }
                return from(getToken(this.messaging!, { vapidKey, serviceWorkerRegistration: swReg })).pipe(
                  catchError(err => {
                    console.error('Failed to get FCM token:', err);
                    return of(null);
                  })
                );
              })
            );
          })
        );
      }),
      switchMap(token => {
        if (!token) return of(null);
        const userId = this.authService.getCurrentUserId();
        if (!userId) {
          console.warn('No authenticated user; skipping token sync');
          return of(token);
        }
        // Save token for this device in user's token array
        return this.userService.addFcmToken(userId, token).pipe(
          map(() => token),
          catchError(err => {
            console.error('Failed to sync FCM token to user:', err);
            return of(token);
          })
        );
      })
    );
  }

  /** Listen for foreground messages and show notifications */
  attachForegroundHandler(): void {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => {
      const title = (payload.notification?.['title'] as string) || (payload.data?.['title'] as string) || 'Habit Tracker';
      const body = (payload.notification?.['body'] as string) || (payload.data?.['body'] as string) || '';
      this.browserNotification.show({ title, body }).subscribe();
    });
  }
}