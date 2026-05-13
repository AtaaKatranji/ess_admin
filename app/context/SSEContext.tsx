'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define the type for the SSE context
interface SSEContextType {
  notificationsHourly: { requestId: string }[];
  notificationsLeave: { requestId: string }[];
  notificationsResignation: { requestId: string }[];
}

// Create the context with a default value
const SSEContext = createContext<SSEContextType>({ notificationsHourly: [], notificationsLeave: [], notificationsResignation: []  });

// Define the props for the SSEProvider component
interface SSEProviderProps {
  children: ReactNode;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const router = useRouter();
  const [notificationsHourly, setNotifications] = useState<{ requestId: any }[]>([]);
  const [notificationsLeave, setNotificationsLeave] = useState<{ requestId: any }[]>([]);
  const [notificationsResignation, setNotificationsResignation] = useState<{ requestId: any }[]>([]);
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

      // Helper to extract a displayable ID or name
      const getDisplayInfo = (data: any) => {
        let requestId = 'New';
        let employeeName = data.employeeName || '';

        if (Array.isArray(data.requestId)) {
          const first = data.requestId[0];
          if (first) {
            requestId = first.id || first._id || 'Multiple';
            if (!employeeName) employeeName = first.employeeName || first.user?.name || '';
          }
        } else if (typeof data.requestId === 'object' && data.requestId !== null) {
          requestId = data.requestId.id || data.requestId._id || 'New';
          if (!employeeName) employeeName = data.requestId.employeeName || data.requestId.user?.name || '';
        } else {
          requestId = data.requestId;
        }

        return { requestId, employeeName };
      };

      // Listen for the 'new-request-leaves' (Hourly) event
      eventSource.addEventListener('new-request-leaves', (event) => {
        const rawData = JSON.parse(event.data);
        const { requestId, employeeName } = getDisplayInfo(rawData);
        const orgSlug = rawData.orgSlug;
        
        console.log('Hourly Request:', rawData);
        setNotifications((prev) => [...prev, rawData]);

        const message = employeeName ? `New Hourly Leave Request from ${employeeName}` : `New Hourly Leave Request`;
        toast.info(message, { 
          position: 'top-right', 
          autoClose: 5000,
          onClick: () => {
            if (orgSlug) router.push(`/dashboard/institution/${orgSlug}/requests?type=hourly`);
          }
        });
        showDesktopNotification('New Hourly Leave Request', message);
      });

      // Listen for the 'new-leave-request' (Daily) event
      eventSource.addEventListener('new-leave-request', (event) => {
        const rawData = JSON.parse(event.data);
        const { requestId, employeeName } = getDisplayInfo(rawData);
        const orgSlug = rawData.orgSlug;

        console.log('Leave Request:', rawData);
        setNotificationsLeave((prev) => [...prev, rawData]);

        const message = employeeName ? `New Leave Request from ${employeeName}` : `New Leave Request`;
        toast.info(message, { 
          position: 'top-right', 
          autoClose: 5000,
          onClick: () => {
            if (orgSlug) router.push(`/dashboard/institution/${orgSlug}/requests?type=daily`);
          }
        });
        showDesktopNotification('New Leave Request', message);
      });

      // Listen for the 'new-resignation-request' event
      eventSource.addEventListener('new-resignation-request', (event) => {
        const rawData = JSON.parse(event.data);
        const { requestId, employeeName } = getDisplayInfo(rawData);
        const orgSlug = rawData.orgSlug;

        console.log('Resignation Request:', rawData);
        setNotificationsResignation((prev) => [...prev, rawData]);

        const message = employeeName ? `New Resignation Request from ${employeeName}` : `New Resignation Request`;
        toast.warning(message, { 
          position: 'top-right', 
          autoClose: 7000,
          onClick: () => {
            if (orgSlug) router.push(`/dashboard/institution/${orgSlug}/requests?type=resignation`);
          }
        });
        showDesktopNotification('New Resignation Request', message);
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
    <SSEContext.Provider value={{ notificationsHourly, notificationsLeave, notificationsResignation }}>
      {children}
    </SSEContext.Provider>
  );
};

// Custom hook to use the SSE context
export const useSSE = () => useContext(SSEContext);

export default SSEContext;