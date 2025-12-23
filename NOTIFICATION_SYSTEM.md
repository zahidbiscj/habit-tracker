# Notification System - Developer Guide

## Architecture Overview

**Push-only system using Firebase Cloud Messaging (FCM)**
- No local browser scheduling
- Server-driven via Cloud Functions
- Multi-device support per user

---

## Flow: Creating a Notification

### 1. Admin Creates Notification
```
Admin → Notification Form → Fill details (title, body, time, days) → Click Save
```

### 2. Frontend (Angular)
**File:** `notification-firebase.service.ts`
- `createNotification()` called
- Document created in Firestore `notifications` collection
- `createdDate` and `updatedDate` set via `serverTimestamp()`
- Returns created notification with generated ID

### 3. Backend Trigger (Cloud Functions)
**File:** `functions/index.js` → `onNotificationCreate`

**Immediate push on creation:**
```javascript
.onCreate(async (snap, context) => {
  // Get notification data
  const notif = snap.data();
  
  // Query all active users
  const users = await firestore.collection('users')
    .where('role', '==', 'user')
    .where('active', '==', true')
    .get();
  
  // Build messages for all device tokens
  for each user:
    tokens = user.fcmTokens (array) || [user.fcmToken] (legacy)
    for each token:
      messages.push({ token, notification: { title, body } })
  
  // Send in chunks of 500 (FCM limit)
  admin.messaging().sendAll(messages)
}
```

**Result:** All logged-in devices receive immediate push notification

---

## Flow: Scheduled Delivery

### Cloud Function Cron Job
**File:** `functions/index.js` → `checkAndSendNotifications`

**Runs every minute:**
```javascript
schedule('* * * * *').onRun(async () => {
  // Get current time HH:mm and day (0-6)
  const currentTime = "14:30"
  const currentDay = 2 // Tuesday
  
  // Query matching notifications
  const notifications = await firestore.collection('notifications')
    .where('active', '==', true)
    .where('time', '==', currentTime)
    .get();
  
  // For each matching notification:
  for each notification:
    if (notification.daysOfWeek.includes(currentDay)):
      // Send to all users (same logic as onCreate)
      sendAll(messages)
})
```

**Result:** At scheduled time, all devices receive push notification

---

## Multi-Device Token System

### Registration (Login)
**File:** `app.component.ts` → `ngOnInit()`

```typescript
authService.getCurrentUser().subscribe(user => {
  if (user) {
    messagingService.initAndRegisterToken().subscribe(token => {
      // Token saved to user document
      userService.addFcmToken(userId, token)
    })
  }
})
```

### Token Storage
**File:** `user-firebase.service.ts` → `addFcmToken()`

**User document structure:**
```json
{
  "fcmToken": "latest_token",     // Legacy single token
  "fcmTokens": [                   // Array of all device tokens
    "token_from_desktop",
    "token_from_mobile",
    "token_from_tablet"
  ]
}
```

### Sending to All Devices
```javascript
// Cloud Function logic
const tokenList = user.fcmTokens || [user.fcmToken]
for (const token of tokenList) {
  messages.push({ token, notification })
}
```

---

## Frontend Components

### FCM Service
**File:** `messaging-firebase.service.ts`

**Methods:**
- `initAndRegisterToken()` - Request permission, get FCM token, save to user
- `attachForegroundHandler()` - Listen for push when app is open

### Browser Notification Service  
**File:** `browser-notification.service.ts`

**Methods:**
- `requestPermission()` - Ask user for notification permission
- `show()` - Display notification (used by FCM foreground handler)

### Service Worker
**File:** `firebase-messaging-sw.js`

**Handles:**
- Background messages (when app is closed)
- Click handler to open/focus app
- Shows notification via `registration.showNotification()`

---

## Key Files

### Frontend
- `app.component.ts` - Registers FCM token on login
- `messaging-firebase.service.ts` - FCM integration
- `user-firebase.service.ts` - Token management
- `notification-firebase.service.ts` - CRUD operations
- `notification-form.component.ts` - Create/edit UI
- `firebase-messaging-sw.js` - Service worker for background push

### Backend
- `functions/index.js` - Cloud Functions for push delivery

### Config
- `environment.ts` - Firebase config + VAPID key
- `firebase.json` - Deployment config
- `firestore.rules` - Security rules

---

## Data Flow Summary

```
[Admin creates notification]
         ↓
[Firestore: notifications collection]
         ↓
[Cloud Function: onNotificationCreate triggers]
         ↓
[Query all users with fcmTokens]
         ↓
[Send immediate push to all devices] ← onCreate push
         ↓
[User receives notification]

---

[Cloud Function cron runs every minute]
         ↓
[Check if time matches notification.time]
         ↓
[Check if day matches notification.daysOfWeek]
         ↓
[Send push to all devices] ← Scheduled push
         ↓
[User receives notification]
```

---

## Environment Setup

### VAPID Key
```typescript
// environment.ts
firebase: {
  vapidKey: "BA2amRZ3FCQVBhlGyfdNuHKCkzOHlT3N8r1..."
}
```

### Timezone
```javascript
// functions/index.js
.timeZone('Asia/Karachi')
```

---

## Testing

### Test Instant Notification
```
Admin → Test Notification → Click "Test Instant Notification"
→ Requests permission → Shows browser notification
```

### Test Push
```
Admin → Test Notification → Click "Enable Push (FCM)"
→ Registers token → Saves to user document
```

### Test Scheduled
```
Admin → Create Notification → Set time 1 minute ahead → Save
→ Immediate push sent
→ Wait 1 minute
→ Scheduled push sent (if current day matches)
```

---

## Debugging

### Check FCM Token
```
Firestore → users → [userId] → fcmTokens array
```

### Check Notifications
```
Firestore → notifications → active: true, time: "HH:mm"
```

### Cloud Function Logs
```bash
firebase functions:log
```

### Browser Console
```javascript
// Shows permission status, token registration, message received
console.log messages in messaging-firebase.service.ts
```

---

## Deployment

### Frontend
```bash
cd webapp
npm run build
firebase deploy --only hosting
```

### Backend
```bash
cd functions
npm ci
firebase deploy --only functions
```

---

## Security

### Firestore Rules
- Users can only read their own data
- Admins can CRUD notifications
- Cloud Functions bypass rules (admin SDK)

### Token Cleanup
- Invalid tokens should be removed on FCM error (not yet implemented)
- Consider token expiry/refresh logic

---

## Limitations

- FCM requires HTTPS (localhost or deployed)
- Service worker needs to be registered at root
- Push only works on supported browsers (Chrome, Edge, Firefox)
- iOS Safari has limited push support
- Background push requires service worker active

---

## Future Improvements

1. Token cleanup on FCM errors
2. Remove token on logout
3. User-specific notifications (not broadcast)
4. Notification history/read status
5. Custom notification sounds
6. Rich notifications with actions
7. Notification preferences per user
