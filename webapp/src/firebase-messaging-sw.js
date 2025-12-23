/* Firebase Messaging Service Worker */
/* Loads Firebase SDKs and handles background messages from FCM */

// Import Firebase SDKs (compat for SW)
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

// Initialize Firebase (public web config)
firebase.initializeApp({
  apiKey: "AIzaSyClnaSXQRuc6EAKMiSOe_vhU_heEFoDrDI",
  authDomain: "habit-tracker-1e347.firebaseapp.com",
  projectId: "habit-tracker-1e347",
  storageBucket: "habit-tracker-1e347.firebasestorage.app",
  messagingSenderId: "107464777450",
  appId: "1:107464777450:web:a4032afe0b553b18720193"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Habit Tracker';
  const body = payload.notification?.body || payload.data?.body || '';
  const icon = '/assets/icons/icon-192x192.svg';
  const badge = '/assets/icons/icon-72x72.svg';

  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    tag: payload?.data?.tag || 'habit-tracker-notification',
    data: { url: self.location.origin }
  });
});

// Click handler to focus/open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});