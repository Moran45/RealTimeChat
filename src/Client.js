// src/Client.js
import React, { useState, useEffect } from 'react';
import './App.css';

function Client() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [clientName, setClientName] = useState(''); // Estado para almacenar el nombre del cliente
  const [nameConfirmed, setNameConfirmed] = useState(false); // Estado para confirmar el nombre del cliente

  useEffect(() => {
    if (nameConfirmed) {
      const socketInstance = new WebSocket('ws://localhost:3001');

      socketInstance.onopen = () => {
        console.log('WebSocket connection established.');
        // Enviar el nombre del cliente al servidor
        socketInstance.send(JSON.stringify({ type: 'NEW_CLIENT', client: clientName }));
      };

      socketInstance.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      };

      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      };
    }
  }, [nameConfirmed, clientName]);

  const sendMessage = () => {
    if (messageInput.trim() !== '' && socket) {
      const message = {
        text: messageInput,
        timestamp: new Date().toISOString(),
        role: 'Cliente', // Incluir el rol en el mensaje
        client: clientName, // Incluir el nombre del cliente
      };
      socket.send(JSON.stringify(message));
      setMessageInput('');
    }
  };

  const handleClientNameSubmit = () => {
    if (clientName.trim() !== '') {
      setNameConfirmed(true);
    }
  };

  return (
    <div className="App">
      {!nameConfirmed ? (
        <div>
          <input
            type="text"
            placeholder="Ingrese su nombre"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <button onClick={handleClientNameSubmit}>Ingresar</button>
        </div>
      ) : (
        <div>
          <h1>Estás en Cliente</h1>
          <div className="chat-container">
            <div className="chat-messages">
              {messages
                .filter((message) => message.client === clientName)
                .map((message, index) => (
                  <div key={index} className="message">
                    <span className="role-indicator">
                      {message.role === 'Admin' ? 'A' : 'C'}:
                    </span>
                    {message.text}
                  </div>
                ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Client;
