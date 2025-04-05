'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Define the type for the SSE context
interface SSEContextType {
  notificationsHourly: { requestId: string }[];
  notificationsLeave: { requestId: string }[];
}

// Create the context with a default value
const SSEContext = createContext<SSEContextType>({ notificationsHourly: [], notificationsLeave: []  });

// Define the props for the SSEProvider component
interface SSEProviderProps {
  children: ReactNode;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const [notificationsHourly, setNotifications] = useState<{ requestId: string }[]>([]);
  const [notificationsLeave, setNotificationsLeave] = useState<{ requestId: string }[]>([]);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        } else {
          console.warn('Notification permission denied');
          toast.warn('Desktop notifications are disabled. Please enable them in browser settings.');
        }
      });
    } else {
      console.warn('Notifications not supported in this browser');
    }
  }, []);

  // Show desktop notification
  const showDesktopNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/path-to-icon.png', // Optional: Add an icon (place it in your public folder)
        tag: 'leave-request', // Prevents duplicate notifications
        requireInteraction: true, // Keeps notification visible until user interacts (if supported)
      });
    }
  };
  useEffect(() => {
    // Create an EventSource connection to the SSE endpoint
    let eventSource: EventSource;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const initialReconnectDelay = 1000;

    const connectToSSE = () => {
      eventSource = new EventSource(`${BaseUrl}/sse`);

      // Listen for the 'new-request-leaves' event
      eventSource.addEventListener('new-request-leaves', (event) => {
        const data = JSON.parse(event.data) as { requestId: string };
        console.log(data.requestId);
        setNotifications((prevNotifications) => [...prevNotifications, data]);

        // Display a toast message
        toast.info(`New Hourly Leave Request: ${data.requestId}`, {
          position: 'top-right',
          autoClose: 5000, // Close after 5 seconds
        });
        showDesktopNotification('New Hourly Leave Request', `Request ID: ${data.requestId}`);
      });
      eventSource.addEventListener('new-leave-request', (event) => {
        const data = JSON.parse(event.data) as { requestId: string };
        console.log(`New Leave Request: ${data.requestId}`);
        setNotificationsLeave((prevNotifications) => [...prevNotifications, data]);

        // Display a toast message
        toast.info(`New Leave Request for employee: ${data.requestId}`, {
          position: 'top-right',
          autoClose: 5000, // Close after 5 seconds
        });
        showDesktopNotification('New Leave Request', `Request ID: ${data.requestId}`);
      });
    // Handle errors
    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = initialReconnectDelay * Math.pow(2, reconnectAttempts);
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts++;
          connectToSSE();
        }, delay);
      } else {
        toast.error('Lost connection to server. Please refresh the page.');
      }
    };

    eventSource.onopen = () => {
      reconnectAttempts = 0;
    
    };
  };
    connectToSSE();
    // Clean up on component unmount
    return () => {
      clearTimeout(reconnectTimeout);
      eventSource.close();
    };
  }, [BaseUrl]);

  return (
    <SSEContext.Provider value={{ notificationsHourly, notificationsLeave }}>
      {children}
    </SSEContext.Provider>
  );
};

// Custom hook to use the SSE context
export const useSSE = () => useContext(SSEContext);

export default SSEContext;