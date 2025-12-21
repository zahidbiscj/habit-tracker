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
        if (!data.fcmToken) continue;
        messages.push({
          token: data.fcmToken,
          notification: { title: notif.title, body: notif.body }
        });
      }

      if (messages.length > 0) {
        await admin.messaging().sendAll(messages);
        console.log(`Sent ${messages.length} push messages for '${notif.title}' at ${currentTime}`);
      }
    }
    return null;
  });
