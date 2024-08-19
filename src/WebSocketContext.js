import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [authData, setAuthData] = useState(() => {
    const savedAuthData = localStorage.getItem('authData');
    return savedAuthData ? JSON.parse(savedAuthData) : null;
  });

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3001');

    websocket.onopen = () => {
      console.log('WebSocket connection established.');
      setWs(websocket);

      if (authData) {
        console.log('Sending authentication data:', authData);
        websocket.send(JSON.stringify({
          type: 'LOGIN',
          email_or_name: authData.email_or_name
        }));
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket connection closed.', event.reason);
      setWs(null);

      // Optionally, handle reconnection logic here
    };

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [authData]);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
