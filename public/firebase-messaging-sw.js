// firebase-messaging-sw.js

// Import the Firebase scripts for messaging
importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,

  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

export const requestPermissionAndGetToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PRIVATE_ID,
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);

      // Store this token in your MongoDB (or send it to your server) to use for sending notifications
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentToken }),
      });
    } else {
      console.warn('No registration token available.');
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
};
