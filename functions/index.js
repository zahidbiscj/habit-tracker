const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { CloudTasksClient } = require('@google-cloud/tasks');

admin.initializeApp();
const tasksClient = new CloudTasksClient();

const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
const location = 'us-central1'; // Your Firebase region
const queue = 'notification-scheduler';
const timezone = 'Asia/Kuala_Lumpur';

// Helper: Calculate next occurrence time in Asia/Kuala_Lumpur timezone
function getNextOccurrence(timeString, daysOfWeek) {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Get current time in Malaysia timezone
  const now = new Date();
  const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  // Find the next matching day
  const currentDay = malaysiaTime.getDay();
  let daysToAdd = null;
  
  for (let i = 0; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7;
    if (daysOfWeek.includes(checkDay)) {
      const targetTime = new Date(malaysiaTime);
      targetTime.setDate(targetTime.getDate() + i);
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If it's today, check if time hasn't passed yet
      if (i === 0 && targetTime <= malaysiaTime) continue;
      
      return targetTime;
    }
  }
  
  return null;
}

// Helper: Schedule Cloud Task for notification
async function scheduleNotificationTask(notificationId, notificationData) {
  if (!notificationData.active || !notificationData.time || !notificationData.daysOfWeek?.length) {
    console.log(`Skipping schedule for ${notificationId}: inactive or missing data`);
    return;
  }
  
  const nextTime = getNextOccurrence(notificationData.time, notificationData.daysOfWeek);
  if (!nextTime) {
    console.log(`No valid next occurrence for ${notificationId}`);
    return;
  }
  
  const parent = tasksClient.queuePath(project, location, queue);
  const url = `https://${location}-${project}.cloudfunctions.net/sendScheduledNotification`;
  
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify({ notificationId })).toString('base64'),
      oidcToken: {
        serviceAccountEmail: `${project}@appspot.gserviceaccount.com`
      }
    },
    scheduleTime: {
      seconds: Math.floor(nextTime.getTime() / 1000)
    }
  };
  
  try {
    await tasksClient.createTask({ parent, task });
    console.log(`✅ Scheduled notification ${notificationId} for ${nextTime.toLocaleString('en-US', { timeZone: timezone })}`);
  } catch (error) {
    console.error(`❌ Failed to schedule ${notificationId}:`, error.message);
  }
}

// Helper: Cancel all tasks for a notification
async function cancelNotificationTasks(notificationId) {
  try {
    const parent = tasksClient.queuePath(project, location, queue);
    const [tasks] = await tasksClient.listTasks({ parent });
    
    let cancelled = 0;
    for (const task of tasks) {
      const taskBody = task.httpRequest?.body;
      if (taskBody) {
        const decoded = JSON.parse(Buffer.from(taskBody, 'base64').toString());
        if (decoded.notificationId === notificationId) {
          await tasksClient.deleteTask({ name: task.name });
          cancelled++;
        }
      }
    }
    
    if (cancelled > 0) {
      console.log(`✅ Cancelled ${cancelled} tasks for ${notificationId}`);
    }
  } catch (error) {
    console.error(`❌ Error cancelling tasks for ${notificationId}:`, error.message);
  }
}

// HTTP Function: Send notification at scheduled time
exports.sendScheduledNotification = functions.https.onRequest(async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    if (!notificationId) {
      return res.status(400).send('Missing notificationId');
    }
    
    // Get notification from Firestore
    const notifDoc = await admin.firestore()
      .collection('notifications')
      .doc(notificationId)
      .get();
    
    if (!notifDoc.exists) {
      console.log(`Notification ${notificationId} not found`);
      return res.status(404).send('Notification not found');
    }
    
    const notif = notifDoc.data();
    
    if (!notif.active) {
      console.log(`Notification ${notificationId} is inactive`);
      return res.status(200).send('Notification inactive');
    }
    
    // Get all active users with FCM tokens
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('active', '==', true)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('No active users found');
      return res.status(200).send('No users to notify');
    }
    
    const title = notif.title || 'Habit Tracker';
    const body = notif.body || 'Reminder';
    
    // Build messages for all user tokens
    const messages = [];
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const tokenList = Array.isArray(userData.fcmTokens) && userData.fcmTokens.length
        ? userData.fcmTokens
        : (userData.fcmToken ? [userData.fcmToken] : []);
      
      for (const token of tokenList) {
        messages.push({
          token,
          notification: { title, body },
          data: {
            notificationId,
            time: notif.time || '',
            type: 'scheduled'
          }
        });
      }
    }
    
    if (messages.length === 0) {
      console.log('No FCM tokens found');
      return res.status(200).send('No tokens to send to');
    }
    
    // Send in chunks of 500 (FCM limit)
    const chunkSize = 500;
    let totalSent = 0;
    
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      try {
        const response = await admin.messaging().sendAll(chunk);
        totalSent += response.successCount;
        if (response.failureCount > 0) {
          console.warn(`${response.failureCount} messages failed in chunk`);
        }
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    }
    
    console.log(`✅ Sent ${totalSent}/${messages.length} notifications for "${title}"`);
    
    // Schedule next occurrence
    await scheduleNotificationTask(notificationId, notif);
    
    res.status(200).send(`Sent ${totalSent} notifications`);
  } catch (error) {
    console.error('❌ Error in sendScheduledNotification:', error);
    res.status(500).send('Error processing notification');
  }
});

// Firestore Trigger: Schedule when notification is created
exports.onNotificationCreate = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notif = snap.data();
    const notificationId = context.params.notificationId;
    
    if (!notif) return null;
    
    // Send immediate notification to all users
    if (notif.active) {
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('active', '==', true)
        .get();
      
      if (!usersSnapshot.empty) {
        const title = notif.title || 'Habit Tracker';
        const body = notif.body || 'New notification';
        
        const messages = [];
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const tokenList = Array.isArray(userData.fcmTokens) && userData.fcmTokens.length
            ? userData.fcmTokens
            : (userData.fcmToken ? [userData.fcmToken] : []);
          
          for (const token of tokenList) {
            messages.push({
              token,
              notification: { title, body },
              data: {
                notificationId,
                time: notif.time || '',
                type: 'immediate'
              }
            });
          }
        }
        
        if (messages.length > 0) {
          const chunkSize = 500;
          let totalSent = 0;
          
          for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            try {
              const response = await admin.messaging().sendAll(chunk);
              totalSent += response.successCount;
            } catch (error) {
              console.error('Error sending immediate notification:', error);
            }
          }
          
          console.log(`✅ Sent ${totalSent} immediate notifications for "${title}"`);
        }
      }
      
      // Also schedule for future recurring occurrences
      await scheduleNotificationTask(notificationId, notif);
    }
    
    return null;
  });

// Firestore Trigger: Reschedule when notification is updated
exports.onNotificationUpdate = functions.firestore
  .document('notifications/{notificationId}')
  .onUpdate(async (change, context) => {
    const notificationId = context.params.notificationId;
    const newData = change.after.data();
    
    // Cancel old scheduled tasks
    await cancelNotificationTasks(notificationId);
    
    // Schedule new tasks if active
    if (newData && newData.active) {
      await scheduleNotificationTask(notificationId, newData);
    }
    
    return null;
  });

// Firestore Trigger: Cancel tasks when notification is deleted
exports.onNotificationDelete = functions.firestore
  .document('notifications/{notificationId}')
  .onDelete(async (snap, context) => {
    const notificationId = context.params.notificationId;
    await cancelNotificationTasks(notificationId);
    return null;
  });
