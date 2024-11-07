// hooks/useSocket.js
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url, onNewLeaveRequest) => {
  useEffect(() => {
    const socket = io(url);

    // Listen for new leave requests
    socket.on('newLeaveRequest', (leaveRequest) => {
      onNewLeaveRequest(leaveRequest);
    });

    return () => {
      socket.disconnect();
    };
  }, [url, onNewLeaveRequest]);
};

export default useSocket;
