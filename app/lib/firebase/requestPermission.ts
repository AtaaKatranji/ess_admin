import { getToken } from "firebase/messaging";
import {  type Messaging } from "firebase/messaging";
import { messaging } from "./firebase";

// Add type annotation to the imported messaging
const messagingInstance: Messaging = messaging;

// Function to request permission to show notifications
const requestPermission = async (userId: string) => {
  console.log("TEst");
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    console.log(permission)
    console.log(messagingInstance)
    if (permission === "granted") {
      // Use the typed messaging instance
      const token = await getToken(messagingInstance, {
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
