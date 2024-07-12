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
  const [chatId, setChatId] = useState(null); // Estado para almacenar el chat_id
  const ws = useWebSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!ws) return;
  
    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'WELCOME') {
        setMessages([{ text: msg.message, role: 'system', timestamp: new Date().toISOString() }]);
      } else if (msg.type === 'MESSAGE') {
        setMessages((prev) => [...prev, msg.message]);
      } else if (msg.type === 'CHAT_STARTED') {
        setChatId(msg.chat_id);
      } else if (msg.type === 'REPORT_MESSAGE') {
        // Verificar si el mensaje ya está en el estado antes de agregarlo
        const existingMessage = messages.find(m => m.timestamp === msg.message.timestamp);
        if (!existingMessage) {
          setMessages(prevMessages => [...prevMessages, msg.message]);
        }
      }
    };
  }, [ws, messages]); // Asegúrate de incluir messages en las dependencias para actualizar correctamente
  
  
  

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
      owner_id: localStorage.getItem('user_id'),
    }));

    setMessageInput('');
  };

  const handleReportClick = async () => {
    const userId = localStorage.getItem('user_id');
    if (!ws || !userId) {
      alert('WebSocket connection not established or user_id not found.');
      return;
    }
  
    handleSelectArea(3);
  
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'START_CHAT',
        user_id: userId,
      }));
    }, 500);
  
    try {
      const response = await fetch('https://phmsoft.tech/Ultimochatlojuro/hacer_reporte.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: userId,
        }),
      });
  
      const text = await response.text(); // Obtén la respuesta como texto primero
      console.log('Server response:', text); // Imprime la respuesta en la consola
  
      const data = JSON.parse(text); // Luego intenta convertirla a JSON
      if (data.error) {
        console.error('Error al hacer el reporte:', data.error);
      } else {
        console.log('Reporte realizado con éxito:', data);
        const reportMessage = {
          type: 'MESSAGE',
          text: `Reporte realizado con éxito:\nServicio: ${data.report.servicio}\nCorreo: ${data.report.correo}\nContraseña: ${data.report.contrasena}\nPerfiles: ${data.report.perfiles}\nPIN: ${data.report.pin}\nProblema: ${data.report.problema}`,
          role: 'system',
          timestamp: data.report.timestamp,
          chat_id: chatId, // Asegúrate de usar el chatId correcto aquí
          owner_id: userId,
        };
  
        // Informar al servidor WebSocket del nuevo reporte
        ws.send(JSON.stringify({
          type: 'REPORT_MESSAGE',
          message: reportMessage,
          user_id: userId,
          chat_id: chatId, // Asegúrate de enviar el chatId correcto al servidor
          owner_id: userId,
        }));
      }
    } catch (error) {
      console.error('Error al ejecutar la API de hacer_reporte:', error);
    }
  };
  
  
  
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="client-container">
      <div className='Reportar'>
        <p>Reportar cuenta</p>
        <button onClick={handleReportClick}>Enviar reporte</button>
      </div>
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
