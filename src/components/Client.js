/* 
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function Client() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const socket = useRef(null); // Utilizar useRef para la instancia de WebSocket
  const [clientName, setClientName] = useState(''); // Estado para almacenar el nombre del cliente
  const [nameConfirmed, setNameConfirmed] = useState(false); // Estado para confirmar el nombre del cliente
  const messagesEndRef = useRef(null); // Referencia para el final de los mensajes

  useEffect(() => {
    if (nameConfirmed) {
      const socketInstance = new WebSocket('ws://localhost:3001');
      socket.current = socketInstance; // Asignar la instancia de WebSocket a la referencia

      socketInstance.onopen = () => {
        console.log('WebSocket connection established.');
        // Enviar el nombre del cliente al servidor
        socketInstance.send(JSON.stringify({ type: 'NEW_CLIENT', client: clientName }));
      };

      socketInstance.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        console.log('Received message:', receivedMessage);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages, receivedMessage];
          return removeDuplicateMessages(newMessages);
        });
      };

      socketInstance.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        socketInstance.close();
      };
    }
  }, [nameConfirmed, clientName]);

  useEffect(() => {
    // Desplazar automáticamente al final de los mensajes cuando se actualizan
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const removeDuplicateMessages = (messages) => {
    const uniqueMessages = [];
    const seenTimestamps = new Set();

    messages.forEach(message => {
      if (!seenTimestamps.has(message.timestamp)) {
        uniqueMessages.push(message);
        seenTimestamps.add(message.timestamp);
      }
    });

    return uniqueMessages;
  };

  const sendMessage = () => {
    if (messageInput.trim() !== '' && socket.current) {
      const message = {
        text: messageInput,
        timestamp: new Date().toISOString(),
        role: 'Cliente', // Incluir el rol en el mensaje
        client: clientName, // Incluir el nombre del cliente
      };

      // Enviar el mensaje a través de WebSocket
      socket.current.send(JSON.stringify(message));

      // Actualizar el estado local inmediatamente para reflejar el mensaje enviado
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, message];
        return removeDuplicateMessages(newMessages);
      });

      setMessageInput('');
    }
  };

  const handleClientNameSubmit = () => {
    if (clientName.trim() !== '') {
      setNameConfirmed(true);
    }
  };

  return (
    <div className="App container">
      {!nameConfirmed ? (
        <div className="name-input-container text-center">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Ingrese su nombre"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleClientNameSubmit}>
            Ingresar
          </button>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-header p-3">
            <h2>Chat de Soporte</h2>
          </div>
          <div className="chat-container">
            <div className="chat-messages p-3">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role === 'Admin' ? 'admin-message' : 'client-message'} p-2 mb-2 rounded`}>
                  <div className="message-content">
                    <span className="message-author">
                      {message.role === 'Admin' ? '' : clientName}
                    </span>
                    <span className="message-text">{message.text || message.message}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Referencia para el final de los mensajes }
            </div>
            <div className="chat-input p-3 d-flex align-items-center">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Escribe tu mensaje..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button className="btn btn-success" onClick={sendMessage}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Client;
*/

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
