import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState(''); // Estado para almacenar el rol seleccionado
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [canAdminSend, setCanAdminSend] = useState(false); // Estado para controlar si el admin puede enviar mensajes
  const [clientName, setClientName] = useState(''); // Estado para almacenar el nombre del cliente
  const [clients, setClients] = useState([]); // Estado para almacenar la lista de clientes
  const [selectedClient, setSelectedClient] = useState(''); // Estado para almacenar el cliente seleccionado por el admin

  useEffect(() => {
    if (role) {
      const socketInstance = new WebSocket('ws://localhost:3001');

      socketInstance.onopen = () => {
        console.log('WebSocket connection established.');
      };

      socketInstance.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);

        // Permitir que el admin envíe un mensaje después de recibir uno del cliente
        if (role === 'Admin' && receivedMessage.role === 'Cliente') {
          setCanAdminSend(true);
        } else if (role === 'Cliente') {
          setCanAdminSend(false);
        }
      };

      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      };
    }
  }, [role]);

  const sendMessage = () => {
    if (messageInput.trim() !== '' && socket) {
      const message = {
        text: messageInput,
        timestamp: new Date().toISOString(),
        role: role, // Incluir el rol en el mensaje
        client: role === 'Cliente' ? clientName : selectedClient, // Incluir el nombre del cliente
      };
      socket.send(JSON.stringify(message));
      setMessageInput('');

      if (role === 'Admin') {
        setCanAdminSend(false);
      } else if (role === 'Cliente') {
        setCanAdminSend(true);
      }
    }
  };

  const handleRoleSelection = (selectedRole) => {
    if (selectedRole === 'Cliente') {
      setRole('NombreCliente');
    } else {
      setRole(selectedRole);
    }
    setCanAdminSend(selectedRole === 'Cliente'); // Inicialmente, permitir que el cliente envíe mensajes
  };

  const handleClientNameSubmit = () => {
    if (clientName.trim() !== '') {
      setClients([...clients, clientName]);
      setRole('Cliente');
    }
  };

  const handleClientSelection = (client) => {
    setSelectedClient(client);
    setCanAdminSend(true);
  };

  return (
    <div className="App">
      {role === '' && (
        <div>
          <button onClick={() => handleRoleSelection('Admin')}>Admin</button>
          <button onClick={() => handleRoleSelection('Cliente')}>Cliente</button>
        </div>
      )}
      {role === 'NombreCliente' && (
        <div>
          <input
            type="text"
            placeholder="Ingrese su nombre"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <button onClick={handleClientNameSubmit}>Ingresar</button>
        </div>
      )}
      {role === 'Admin' && !selectedClient && (
        <div>
          <h1>Selecciona un cliente para chatear</h1>
          {clients.map((client, index) => (
            <div key={index} className="client-item">
              <span>{client}</span>
              <button onClick={() => handleClientSelection(client)}>Chatear</button>
            </div>
          ))}
        </div>
      )}
      {(role === 'Admin' && selectedClient) && (
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
                disabled={role === 'Admin' && !canAdminSend} // Deshabilitar el input si es admin y no puede enviar
              />
              <button
                onClick={sendMessage}
                disabled={role === 'Admin' && !canAdminSend} // Deshabilitar el botón si es admin y no puede enviar
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {role === 'Cliente' && (
        <div>
          <h1>Estás en {role}</h1>
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
                disabled={role === 'Admin' && !canAdminSend} // Deshabilitar el input si es admin y no puede enviar
              />
              <button
                onClick={sendMessage}
                disabled={role === 'Admin' && !canAdminSend} // Deshabilitar el botón si es admin y no puede enviar
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

export default App;
