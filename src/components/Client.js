import React, { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '../WebSocketContext';
import '../App.css';

function Client() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [unreadOwnersCount, setUnreadOwnersCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const ws = useWebSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!ws) return;

    const fetchUnreadOwnersCount = async () => {
      console.log('Fetching unread owners count...');
      ws.send(JSON.stringify({ type: 'GET_UNREAD_OWNERS' }));
    };

    ws.onopen = () => {
      console.log('WebSocket connection opened.');
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log('Received message:', msg);

      if (msg.type === 'WELCOME') {
        setMessages([{ text: msg.message, role: 'system', timestamp: new Date().toISOString() }]);
      } else if (msg.type === 'MESSAGE') {
        setMessages((prev) => [...prev, msg.message]);
      } else if (msg.type === 'CHAT_STARTED') {
        setChatId(msg.chat_id);
      } else if (msg.type === 'REPORT_MESSAGE') {
        const existingMessage = messages.find(m => m.timestamp === msg.message.timestamp);
        if (!existingMessage) {
          setMessages(prevMessages => [...prevMessages, msg.message]);
        }
      } else if (msg.type === 'UNREAD_OWNERS_COUNT') {
        console.log('Received UNREAD_OWNERS_COUNT:', msg.count);
        setUnreadOwnersCount(msg.count);
      }
    };

    return () => clearInterval(intervalId);
  }, [ws, messages, intervalId]);

  useEffect(() => {
    console.log('unreadOwnersCount updated:', unreadOwnersCount);
  }, [unreadOwnersCount]);

  const startFetchingUnreadOwnersCount = () => {
    const fetchUnreadOwnersCount = async () => {
      console.log('Fetching unread owners count...');
      ws.send(JSON.stringify({ type: 'GET_UNREAD_OWNERS' }));
    };

    fetchUnreadOwnersCount();
    const newIntervalId = setInterval(fetchUnreadOwnersCount, 10000);
    setIntervalId(newIntervalId);
  };

  const handleSelectArea = (areaId, messageText) => {
    const userId = localStorage.getItem('user_id');
    setSelectedArea(areaId);
    setMessageInput(messageText);
    setShowQuestions(false);

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
    const message = {
      type: 'MESSAGE',
      text: messageInput,
      chat_id: chatId,
      owner_id: localStorage.getItem('user_id'),
    };
    ws.send(JSON.stringify(message));
    setMessageInput('');
    if (!intervalId) {
      startFetchingUnreadOwnersCount();
    }
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
  
      const text = await response.text();
  
      const data = JSON.parse(text);
      if (data.error) {
        console.error('Error al hacer el reporte:', data.error);
      } else {
        console.log('Reporte realizado con éxito:', data);
        const reportMessage = {
          type: 'MESSAGE',
          text: `Reporte realizado con éxito:\nServicio: ${data.report.servicio}\nCorreo: ${data.report.correo}\nContraseña: ${data.report.contrasena}\nPerfiles: ${data.report.perfiles}\nPIN: ${data.report.pin}\nProblema: ${data.report.problema}`,
          role: 'system',
          timestamp: data.report.timestamp,
          chat_id: chatId,
          owner_id: userId,
        };
  
        ws.send(JSON.stringify({
          type: 'REPORT_MESSAGE',
          message: reportMessage,
          user_id: userId,
          chat_id: chatId,
          owner_id: userId,
        }));
      }
    } catch (error) {
      console.error('Error al ejecutar la API de hacer_reporte:', error);
    }
  };

  const confirmReport = async () => {
    setShowModal(false);
    const userId = localStorage.getItem('user_id');
    if (!ws || !userId) {
      alert('WebSocket connection not established or user_id not found.');
      return;
    }
  
    handleSelectArea(3, 'Reporte: Problema reportado.');
  
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
  
      const text = await response.text();
  
      const data = JSON.parse(text);
      if (data.error) {
        console.error('Error al hacer el reporte:', data.error);
      } else {
        console.log('Reporte realizado con éxito:', data);
        const reportMessage = {
          type: 'MESSAGE',
          text: `Reporte realizado con éxito:\nServicio: ${data.report.servicio}\nCorreo: ${data.report.correo}\nContraseña: ${data.report.contrasena}\nPerfiles: ${data.report.perfiles}\nPIN: ${data.report.pin}\nProblema: ${data.report.problema}`,
          role: 'system',
          timestamp: data.report.timestamp,
          chat_id: chatId,
          owner_id: userId,
        };
  
        ws.send(JSON.stringify({
          type: 'REPORT_MESSAGE',
          message: reportMessage,
          user_id: userId,
          chat_id: chatId,
          owner_id: userId,
        }));
      }
    } catch (error) {
      console.error('Error al ejecutar la API de hacer_reporte:', error);
    }
  };

  const sendMessage = (text) => {
    if (text.trim() !== '' && ws && chatId) {
      const message = {
        type: 'MESSAGE',
        text: text,
        chat_id: chatId,
        owner_id: localStorage.getItem('user_id'),
      };
      ws.send(JSON.stringify(message));
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="client-container">
      {!showChat ? (
        <button className="chat-toggle-button" onClick={toggleChat}>
          <i className="bi bi-chat-dots"></i>
        </button>
      ) : (
        <div className="chat-window">
          <button className="chat-close-button" onClick={toggleChat}>
            <i className="bi bi-x"></i>
          </button>
          <h2>Chat {unreadOwnersCount > 0 && `(Lugar en cola aproximado: ${unreadOwnersCount})`}</h2>
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
              placeholder="Escribe tu mensaje..."
            />
            <button className="btn btn-success" onClick={handleSendMessage}>Enviar</button>
          </div>
          {showQuestions && (
            <div className="question-buttons mt-3">
              <button className="btn btn-outline-primary mb-2" onClick={() => handleSelectArea(1, 'Problemas con mi cuenta')}>Problemas con mi cuenta</button>
              <button className="btn btn-outline-primary mb-2" onClick={() => handleSelectArea(2, 'Problemas con mi pago')}>Problemas con mi pago</button>
              <button className="btn btn-outline-primary mb-2" onClick={() => handleSelectArea(3, 'Problemas con la página web')}>Problemas con la página web</button>
            </div>
          )}
          <div className="mt-3">
            <button className="btn btn-warning" onClick={handleReportClick}>Enviar reporte</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Envío de Reporte</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                ¿Estás seguro de que deseas enviar este reporte?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmReport}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default Client;
