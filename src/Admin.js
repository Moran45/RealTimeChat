import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function Admin() {
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const socket = useRef(null); // Utilizar useRef para la instancia de WebSocket
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    // Obtener todos los clientes y sus mensajes desde el servidor al montar el componente
    const fetchAllClientsAndMessages = async () => {
      try {
        const response = await fetch('https://phmsoft.tech/Ultimochatlojuro/getAllClients.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const clientData = data.map(client => ({
          name: client.client_name,
          unreadCount: parseInt(client.unread_count, 10),
        }));

        const clientMessages = {};
        for (const client of clientData) {
          const messagesResponse = await fetch(`https://phmsoft.tech/Ultimochatlojuro/get_messages.php?client_name=${client.name}`);
          if (!messagesResponse.ok) {
            throw new Error('Network response was not ok');
          }
          const messagesData = await messagesResponse.json();
          clientMessages[client.name] = messagesData;
        }

        setClients(clientData);
        setMessages(clientMessages);
      } catch (error) {
        console.error('Error fetching clients and messages:', error);
      }
    };

    fetchAllClientsAndMessages();

    const socketInstance = new WebSocket('ws://localhost:3001');
    socket.current = socketInstance; // Asignar la instancia de WebSocket a la referencia

    socketInstance.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socketInstance.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage.type === 'NEW_CLIENT') {
        setClients((prevClients) => {
          if (!prevClients.find(client => client.name === receivedMessage.client)) {
            return [...prevClients, { name: receivedMessage.client, unreadCount: 0 }];
          }
          return prevClients;
        });
      } else {
        setMessages((prevMessages) => {
          const updatedMessages = { ...prevMessages };
          if (!updatedMessages[receivedMessage.client]) {
            updatedMessages[receivedMessage.client] = [];
          }
          // Evitar agregar mensajes duplicados
          if (!updatedMessages[receivedMessage.client].find(msg => msg.timestamp === receivedMessage.timestamp && msg.text === receivedMessage.text)) {
            updatedMessages[receivedMessage.client].push(receivedMessage);
          }
          return updatedMessages;
        });

        if (receivedMessage.role === 'Cliente') {
          setClients((prevClients) =>
            prevClients.map((client) =>
              client.name === receivedMessage.client
                ? { ...client, unreadCount: client.unreadCount + 1 }
                : client
            )
          );
        }
      }
    };

    socketInstance.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socketInstance.close();
    };
  }, []);

  const fetchClientMessages = async (client) => {
    try {
      const response = await fetch(`https://phmsoft.tech/Ultimochatlojuro/get_messages.php?client_name=${client}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMessages(prevMessages => ({
        ...prevMessages,
        [client]: data
      }));
    } catch (error) {
      console.error('Error fetching client messages:', error);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() !== '' && socket.current && selectedClient) {
      const message = {
        text: messageInput,
        timestamp: new Date().toISOString(),
        role: 'Admin',
        client: selectedClient,
      };

      // Enviar el mensaje a través de WebSocket
      socket.current.send(JSON.stringify(message));

      // Guardar el mensaje en la base de datos
      fetch('https://phmsoft.tech/Ultimochatlojuro/save_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_name: selectedClient,
          message: message.text,
          sender: 'Admin',
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
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        if (!updatedMessages[selectedClient]) {
          updatedMessages[selectedClient] = [];
        }
        // Evitar agregar mensajes duplicados
        if (!updatedMessages[selectedClient].find(msg => msg.timestamp === message.timestamp && msg.text === message.text)) {
          updatedMessages[selectedClient].push(message);
        }
        return updatedMessages;
      });

      setMessageInput('');
    }
  };

  const handleClientSelection = (client) => {
    setSelectedClient(client);
    fetchClientMessages(client); // Obtener los mensajes del cliente seleccionado

    // Marcar los mensajes del cliente como leídos en la base de datos
    fetch('https://phmsoft.tech/Ultimochatlojuro/mark_messages_read.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_name: client,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((data) => {
        console.log('Messages marked as read:', data);
        // Actualizar el recuento de mensajes sin leer en el estado
        setClients((prevClients) =>
          prevClients.map((c) =>
            c.name === client ? { ...c, unreadCount: 0 } : c
          )
        );
      })
      .catch((error) => console.error('Error marking messages as read:', error));
  };

  const unreadClients = clients.filter(client => client.unreadCount > 0);
  const readClients = clients.filter(client => client.unreadCount === 0);

  return (
    <div className="App">
      {!selectedClient ? (
        <div>
          <h1>Selecciona un cliente para chatear</h1>
          {unreadClients.map((client, index) => (
            <div key={index} className="client-item">
              <span>{client.name} (Mensajes sin leer: {client.unreadCount})</span>
              <button onClick={() => handleClientSelection(client.name)}>Chatear</button>
            </div>
          ))}
          <h2>Conversaciones leídas</h2>
          {readClients.map((client, index) => (
            <div key={index} className="client-item">
              <span>{client.name} (Mensajes sin leer: {client.unreadCount})</span>
              <button onClick={() => handleClientSelection(client.name)}>Chatear</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h1>Chat con {selectedClient}</h1>
          <div className="chat-container">
            <div className="chat-messages">
              {messages[selectedClient]?.map((message, index) => (
                <div key={index} className="message">
                  <span className="role-indicator">
                    {message.role === 'Admin' ? 'A' : 'C'}:
                  </span>
                  {message.text || message.message} {/* Mostrar texto o mensaje */}
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

export default Admin;
