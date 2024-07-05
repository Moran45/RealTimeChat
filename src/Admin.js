import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function Admin() {
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const socket = useRef(null); // Utilizar useRef para la instancia de WebSocket
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [messageCount, setMessageCount] = useState({}); // Estado para contar los mensajes enviados por cada cliente

  useEffect(() => {
    // Obtener todos los clientes desde el servidor al montar el componente
    fetch('https://phmsoft.tech/Ultimochatlojuro/getAllClients.php')
      .then(response => response.json())
      .then(data => {
        const clientData = data.map(client => ({
          name: client.client_name,
          unreadCount: client.unread_count,
        }));
        setClients(clientData);
        // Inicializar el estado de mensajes y contadores
        const clientMessages = {};
        const clientCount = {};
        clientData.forEach(client => {
          clientMessages[client.name] = [];
          clientCount[client.name] = 0;
        });
        setMessages(clientMessages);
        setMessageCount(clientCount);
      })
      .catch(error => console.error('Error fetching clients:', error));

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
          updatedMessages[receivedMessage.client].push(receivedMessage);
          return updatedMessages;
        });

        if (receivedMessage.role === 'Cliente') {
          setMessageCount((prevCount) => ({
            ...prevCount,
            [receivedMessage.client]:
              (prevCount[receivedMessage.client] || 0) + 1,
          }));
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
      console.log('Fetched client messages:', data); // Para verificar que los datos se están recuperando
      setMessages(prevMessages => ({
        ...prevMessages,
        [client]: data
      }));
    } catch (error) {
      console.error('Error fetching client messages:', error);
    }
  };

  const removeDuplicateMessages = (messages) => {
    const uniqueMessages = {};
    for (const client in messages) {
      const seenTimestamps = new Set();
      uniqueMessages[client] = messages[client].filter(message => {
        if (!seenTimestamps.has(message.timestamp)) {
          seenTimestamps.add(message.timestamp);
          return true;
        }
        return false;
      });
    }
    return uniqueMessages;
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
        updatedMessages[selectedClient].push(message);
        return removeDuplicateMessages(updatedMessages);
      });

      setMessageInput('');
    }
  };

  const handleClientSelection = (client) => {
    setSelectedClient(client);
    fetchClientMessages(client); // Obtener los mensajes del cliente seleccionado
  };

  return (
    <div className="App">
      {!selectedClient ? (
        <div>
          <h1>Selecciona un cliente para chatear</h1>
          {clients.map((client, index) => (
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
