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
      const fetchMessages = async () => {
        try {
          const response = await fetch(`https://phmsoft.tech/Ultimochatlojuro/get_messages.php?client_name=${clientName}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log('Messages fetched:', data);
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();

      const socketInstance = new WebSocket('ws://localhost:3001');

      socketInstance.onopen = () => {
        console.log('WebSocket connection established.');
        // Enviar el nombre del cliente al servidor
        socketInstance.send(JSON.stringify({ type: 'NEW_CLIENT', client: clientName }));
      };

      socketInstance.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        console.log('Received message:', receivedMessage);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      };

      socketInstance.onerror = (error) => {
        console.error('WebSocket error:', error);
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

      // Enviar el mensaje a través de WebSocket
      socket.send(JSON.stringify(message));

      // Guardar el mensaje en la base de datos
      fetch('https://phmsoft.tech/Ultimochatlojuro/save_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_name: clientName,
          message: message.text,
          sender: 'Cliente',
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then((data) => console.log('Message saved:', data))
        .catch((error) => console.error('Error saving message:', error));

      // Actualizar el estado local inmediatamente para reflejar el mensaje enviado
      setMessages((prevMessages) => [...prevMessages, message]);
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
