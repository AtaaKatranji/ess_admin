import { getMessaging } from "firebase/messaging";

let messaging;
if (typeof window !== "undefined") {
  // Initialize messaging only in the browser
  messaging = getMessaging();
}

export default messaging;
