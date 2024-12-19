import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    // You can customize how you display the message (e.g., using a modal or a toast)
    alert(`Notification: ${payload.notification?.title ?? 'New message received'}`);
  });
};

export { listenForMessages };