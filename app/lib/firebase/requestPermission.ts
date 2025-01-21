// import { getToken } from "firebase/messaging";
// import { messaging } from "./firebase";

// export const requestPermission = async (): Promise<string | null> => {
//   if (!messaging) {
//     console.warn("Firebase Messaging is not initialized.");
//     return null;
//   }

//   try {
//     const token = await getToken(messaging, {
//       vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Must be PUBLIC
//     });
//     if (token) {
//       console.log("FCM Token:", token);
//       return token;
//     } else {
//       console.warn("No FCM token available.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error retrieving FCM token:", error);
//     return null;
//   }
// };