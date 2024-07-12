

import React, { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '../WebSocketContext';

function Client() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const ws = useWebSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'WELCOME') {
        setMessages([{ text: msg.message, role: 'system', timestamp: new Date().toISOString() }]);
      } else if (msg.type === 'MESSAGE') {
        console.log("chat_id: ",msg.type);
        setMessages((prev) => [...prev, msg.message]);
      }
    };
  }, [ws]);

  const handleSelectArea = (areaId) => {
    setSelectedArea(areaId);
    ws.send(JSON.stringify({
      type: 'SELECT_AREA',
      area_id: areaId,
    }));
  };

  const handleSendMessage = () => {
    if (!ws || !selectedArea) {
      alert('No area selected or WebSocket connection not established.');
      return;
    }

    ws.send(JSON.stringify({
      type: 'MESSAGE',
      text: messageInput,
      owner_id: localStorage.getItem('user_id'), // Assume client user_id is stored in localStorage
    }));

    setMessageInput('');
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="client-container">
      <div className="area-selection">
        <h2>Select Area</h2>
        <button onClick={() => handleSelectArea(1)}>Area 1</button>
        <button onClick={() => handleSelectArea(2)}>Area 2</button>
        <button onClick={() => handleSelectArea(3)}>Area 3</button>
      </div>
      <div className="chat-window">
        <h2>Chat</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div>{msg.text}</div>
              <div>{msg.timestamp}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="message-input">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Client;
