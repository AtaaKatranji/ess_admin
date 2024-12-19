import {onMessage } from "firebase/messaging";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  useEffect } from 'react';
const useFirebaseMessaging = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);

        // Extract notification data
        const { title, body } = payload.notification || {};

        // Display message in a toast
        if (title || body) {
          toast.info(
            <div>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          );
        }
      });
    }
  }, []);
};

export default useFirebaseMessaging;