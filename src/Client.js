import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function Client() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const socket = useRef(null); // Utilizar useRef para la instancia de WebSocket
  const [clientName, setClientName] = useState(''); // Estado para almacenar el nombre del cliente
  const [nameConfirmed, setNameConfirmed] = useState(false); // Estado para confirmar el nombre del cliente

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
              {messages.map((message, index) => (
                <div key={index} className="message">
                  <span className="role-indicator">
                    {message.role === 'Admin' ? 'A' : 'C'}:
                  </span>
                  {message.text || message.message} {/* Asegurarse de mostrar el texto del mensaje */}
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
