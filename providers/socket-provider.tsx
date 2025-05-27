'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('Connecting to Socket.IO server at:', socketUrl);
    
    // Use polling first, then try to upgrade to websocket
    // This is more reliable across different network environments
    const socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      autoConnect: true,
      transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
      forceNew: false,
      withCredentials: true,
      path: '/socket.io/',
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    // Connection established
    const onConnect = () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    };

    // Connection error
    const onConnectError = (error: Error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
      
      // Log more details about the error
      console.log('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        transport: socketInstance.io?.engine?.transport?.name
      });
      
      // Try to reconnect with polling if websocket failed
      if (socketInstance.io?.engine?.transport?.name === 'websocket') {
        console.log('Trying to reconnect with polling transport...');
        socketInstance.io.engine.transport.close();
      }
    };

    // Connection closed
    const onDisconnect = (reason: string) => {
      console.log('Socket.IO disconnected:', reason);
      setIsConnected(false);
      
      // Attempt to reconnect for most disconnect reasons
      if (reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
        
        // Short delay before reconnecting
        setTimeout(() => {
          console.log('Reconnecting after disconnect...');
          socketInstance.connect();
        }, 1000);
      }
    };

    // Reconnection events
    const onReconnectAttempt = (attempt: number) => {
      console.log(`Reconnection attempt ${attempt}`);
    };

    const onReconnectError = (error: Error) => {
      console.error('Reconnection error:', error);
    };

    const onReconnectFailed = () => {
      console.error('Reconnection failed after maximum attempts');
    };

    // Set up event listeners
    socketInstance.on('connect', onConnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.io.on('reconnect_attempt', onReconnectAttempt);
    socketInstance.io.on('reconnect_error', onReconnectError);
    socketInstance.io.on('reconnect_failed', onReconnectFailed);
    
    // Log transport changes
    if (socketInstance.io?.engine) {
      socketInstance.io.engine.on('upgrade', (transport) => {
        console.log(`Transport upgraded to: ${transport}`);
      });
      
      socketInstance.io.engine.on('upgradeError', (err) => {
        console.error('Transport upgrade error:', err);
      });
    }

    setSocket(socketInstance);

    // Clean up
    return () => {
      if (socketInstance) {
        console.log('Cleaning up Socket.IO connection');
        socketInstance.off('connect', onConnect);
        socketInstance.off('connect_error', onConnectError);
        socketInstance.off('disconnect', onDisconnect);
        
        if (socketInstance.io) {
          socketInstance.io.off('reconnect_attempt', onReconnectAttempt);
          socketInstance.io.off('reconnect_error', onReconnectError);
          socketInstance.io.off('reconnect_failed', onReconnectFailed);
        }
        
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};