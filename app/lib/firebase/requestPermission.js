import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

// Function to request permission to show notifications
const requestPermission = async (userId) => {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get the Firebase Cloud Messaging token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PRIVATE_ID,
      });
      console.log("FCM Token:", token);
      // Store this token in your MongoDB (or send it to your server) to use for sending notifications
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
    } else {
      console.error("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error getting permission:", error);
  }
};

export { requestPermission };
