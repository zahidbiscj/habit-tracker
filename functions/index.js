const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Runs every minute to check notifications
exports.checkAndSendNotifications = functions.pubsub
  .schedule('* * * * *')
  .timeZone('Asia/Karachi')
  .onRun(async () => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    const currentDay = now.getDay(); // 0=Sun..6=Sat

    const notificationsSnapshot = await admin.firestore()
      .collection('notifications')
      .where('active', '==', true)
      .where('time', '==', currentTime)
      .get();

    if (notificationsSnapshot.empty) return null;

    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'user')
      .where('active', '==', true)
      .get();

    for (const notifDoc of notificationsSnapshot.docs) {
      const notif = notifDoc.data();
      if (!Array.isArray(notif.daysOfWeek) || !notif.daysOfWeek.includes(currentDay)) continue;

      const messages = [];
      for (const userDoc of usersSnapshot.docs) {
        const data = userDoc.data();
        const tokenList = Array.isArray(data.fcmTokens) && data.fcmTokens.length
          ? data.fcmTokens
          : (data.fcmToken ? [data.fcmToken] : []);
        for (const token of tokenList) {
          messages.push({
            token,
            notification: { title: notif.title, body: notif.body }
          });
        }
      }

      if (messages.length > 0) {
        // send in chunks of 500 per FCM limits
        const chunkSize = 500;
        for (let i = 0; i < messages.length; i += chunkSize) {
          const chunk = messages.slice(i, i + chunkSize);
          await admin.messaging().sendAll(chunk);
        }
        console.log(`Sent ${messages.length} push messages for '${notif.title}' at ${currentTime}`);
      }
    }
    return null;
  });

// Push immediately when a new notification is created (informational broadcast)
exports.onNotificationCreate = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notif = snap.data();
    if (!notif || notif.active === false) return null;

    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'user')
      .where('active', '==', true)
      .get();

    const title = notif.title || 'New Notification';
    const body = notif.body ? String(notif.body) : `Scheduled at ${notif.time}`;

    const messages = [];
    for (const userDoc of usersSnapshot.docs) {
      const data = userDoc.data();
      const tokenList = Array.isArray(data.fcmTokens) && data.fcmTokens.length
        ? data.fcmTokens
        : (data.fcmToken ? [data.fcmToken] : []);
      for (const token of tokenList) {
        messages.push({
          token,
          notification: { title, body },
          data: {
            type: 'notificationCreated',
            notificationId: context.params.notificationId || '',
            time: notif.time || ''
          }
        });
      }
    }

    if (messages.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        await admin.messaging().sendAll(chunk);
      }
      console.log(`Broadcasted creation push to ${messages.length} device tokens`);
    }
    return null;
  });
