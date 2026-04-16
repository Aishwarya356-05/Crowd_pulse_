import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io({
        path: '/api/socket', // If using Next.js API route for socket, but I'm using a custom server.
        // For custom server, default path is usually /socket.io/
      });
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, isConnected };
};
