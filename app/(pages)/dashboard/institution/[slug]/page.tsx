"use client"
import { useParams } from 'next/navigation';
import InstitutionDashboard from '@/app/components/InstitutionDashboard';
import { useSocket } from '@/app/context/SocketContext';
import { useEffect } from 'react';

export default function Page() {
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("notify_admin", (data) => {
      if (Notification.permission === "granted") {
        new Notification(data.message);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(data.message);
          }
        });
      }
    });

    return () => {
      socket.off("notify_admin");
    };
  }, [socket]);
  return <InstitutionDashboard activeSection={section as string} />;
}
