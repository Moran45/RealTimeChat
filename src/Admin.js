import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function Admin() {
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const socket = useRef(null); // Utilizar useRef para la instancia de WebSocket
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [isFinalized, setIsFinalized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const messagesEndRef = useRef(null); // Referencia para el final de los mensajes

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

  useEffect(() => {
    // Desplazar automáticamente al final de los mensajes cuando se actualizan
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const finalizeReport = () => {
    if (socket.current && selectedClient) {
      const message = {
        text: 'El reporte ha sido finalizado.',
        timestamp: new Date().toISOString(),
        role: 'Admin',
        client: selectedClient,
        type: 'finalize'
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
        .then((data) => console.log('Finalization message saved:', data))
        .catch((error) => console.error('Error saving finalization message:', error));

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

      // Desactivar los botones
      setIsFinalized(true);
      setShowModal(false);
    }
  };

  const handleClientSelection = (client) => {
    setSelectedClient(client);
    setIsFinalized(false);
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
    <div className="admin-app container-fluid">
      {!selectedClient ? (
        <div className="admin-client-selection">
          <h1 className="text-center my-4">Selecciona un cliente para chatear</h1>
          <div className="admin-client-list">
            <h2>Conversaciones no leídas</h2>
            {unreadClients.map((client, index) => (
              <div key={index} className="admin-client-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <span>{client.name} (Mensajes sin leer: {client.unreadCount})</span>
                <button className="btn btn-primary" onClick={() => handleClientSelection(client.name)}>Chatear</button>
              </div>
            ))}
            <h2>Conversaciones leídas</h2>
            {readClients.map((client, index) => (
              <div key={index} className="admin-client-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <span>{client.name}</span>
                <button className="btn btn-primary" onClick={() => handleClientSelection(client.name)}>Chatear</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-chat-window">
          <h1 className="text-center my-4">Chat con {selectedClient}</h1>
          <div className="admin-chat-container">
            <div className="admin-chat-messages p-3">
              {messages[selectedClient]?.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role === 'Admin' ? 'admin-message' : 'client-message'} p-2 mb-2 rounded ${message.type === 'finalize' ? 'finalized-message' : ''}`}
                >
                  <span className="role-indicator">
                    {message.role === 'Admin' ? 'A' : 'C'}:
                  </span>
                  {message.text || message.message} {/* Mostrar texto o mensaje */}
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Referencia para el final de los mensajes */}
            </div>
            <div className="admin-chat-input d-flex align-items-center p-3">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Escribe tu mensaje..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={isFinalized}
              />
              <button className="btn btn-success me-2" onClick={sendMessage} disabled={isFinalized}>Enviar</button>
              <button className="btn btn-danger" onClick={() => setShowModal(true)} disabled={isFinalized}>Finalizar Reporte</button>
            </div>
          </div>
        </div>
      )}

      <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmar Finalización</h5>
              <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas finalizar este reporte?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={finalizeReport}>Finalizar Reporte</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
