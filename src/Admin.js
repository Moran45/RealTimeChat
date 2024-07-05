// src/Admin.js
import React, { useState, useEffect } from 'react';
import './App.css';

function Admin() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [canAdminSend, setCanAdminSend] = useState(false); // Estado para controlar si el admin puede enviar mensajes
  const [clients, setClients] = useState([]); // Estado para almacenar la lista de clientes
  const [selectedClient, setSelectedClient] = useState(''); // Estado para almacenar el cliente seleccionado por el admin

  useEffect(() => {
    const socketInstance = new WebSocket('ws://localhost:3001');

    socketInstance.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socketInstance.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage.type === 'NEW_CLIENT') {
        setClients((prevClients) => [...prevClients, receivedMessage.client]);
      } else {
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);

        // Permitir que el admin envíe un mensaje después de recibir uno del cliente
        if (receivedMessage.role === 'Cliente') {
          setCanAdminSend(true);
        }
      }
    };

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== '' && socket && selectedClient) {
      const message = {
        text: messageInput,
        timestamp: new Date().toISOString(),
        role: 'Admin', // Incluir el rol en el mensaje
        client: selectedClient, // Incluir el nombre del cliente
      };
      socket.send(JSON.stringify(message));
      setMessageInput('');
      setCanAdminSend(false);
    }
  };

  const handleClientSelection = (client) => {
    setSelectedClient(client);
    setCanAdminSend(true);
  };

  return (
    <div className="App">
      {!selectedClient ? (
        <div>
          <h1>Selecciona un cliente para chatear</h1>
          {clients.map((client, index) => (
            <div key={index} className="client-item">
              <span>{client}</span>
              <button onClick={() => handleClientSelection(client)}>Chatear</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h1>Chat con {selectedClient}</h1>
          <div className="chat-container">
            <div className="chat-messages">
              {messages
                .filter((message) => message.client === selectedClient)
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
                disabled={!canAdminSend} // Deshabilitar el input si el admin no puede enviar
              />
              <button
                onClick={sendMessage}
                disabled={!canAdminSend} // Deshabilitar el botón si el admin no puede enviar
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
