import React, { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '../WebSocketContext';
import { useNavigate } from 'react-router-dom';
import '../client.css';

function Client() {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const [user, setUserClient] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [unreadOwnersCount, setUnreadOwnersCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [currentUrl] = useState(window.location.href); // Nuevo estado para almacenar la URL actual
  const ws = useWebSocket();
  const messagesEndRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    console.log('Current URL:', currentUrl); // Verificar que la URL se captura correctamente
    const storedUserClient = {
      user_id: localStorage.getItem('user_id_client'),
      role: 'client', // Asumiendo que solo los admins llegan a esta página
      name: localStorage.getItem('name_client'),
      email_or_name: localStorage.getItem('name_client'),
    };

    if (storedUserClient.user_id && storedUserClient.name) {
      setUserClient(storedUserClient);
      if (ws) {
        handleLogin(storedUserClient);
      }
    } else {
      navigate('/'); // Redirigir al login si no hay información de usuario
    }
  }, [ws, navigate]);

  useEffect(() => {
    const storedAreaId = localStorage.getItem('area_id_client');
    if (storedAreaId) {
      setSelectedArea(storedAreaId);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!ws) return;

    const fetchUnreadOwnersCount = async () => {
      console.log('Fetching unread owners count...');
      ws.send(JSON.stringify({ type: 'GET_UNREAD_OWNERS' }));
    };

    ws.onopen = () => {
      console.log('WebSocket connection opened.');
      fetchUnreadOwnersCount();
      const newIntervalId = setInterval(fetchUnreadOwnersCount, 10000);
      setIntervalId(newIntervalId);
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log('Received message:', msg);

      switch (msg.type) {
        case 'WELCOME':
          setMessages([{ text: msg.message, role: 'system', timestamp: new Date().toISOString() }]);
          break;
        case 'MESSAGE':
          setMessages((prev) => [...prev, msg.message]);
          if (msg.message.IsAdmin === 1) {
            setUnreadOwnersCount(0);
          }
          localStorage.setItem('chat_id_client', msg.message.chat_id);
          localStorage.setItem('area_id_client', selectedArea);
          console.log(localStorage.getItem('chat_id_client'));
          console.log(selectedArea);
          break;
        case 'CHAT_STARTED':
          setChatId(msg.chat_id);
          break;
        case 'REPORT_MESSAGE':
          const existingMessage = messages.find(m => m.timestamp === msg.message.timestamp);
          if (!existingMessage) {
            setMessages(prevMessages => [...prevMessages, msg.message]);
          }
          break;
        case 'UNREAD_OWNERS_COUNT':
          console.log('Received UNREAD_OWNERS_COUNT:', msg.count);
          setUnreadOwnersCount(msg.count);
          break;
        case 'CHATS_CLIENT':
          if (msg.chats.length === 0) {
            localStorage.removeItem('area_id_client');
            setSelectedArea(null);
            setShowQuestions(true); // Forzar al usuario a seleccionar un área
          } else {
            setShowQuestions(false); // eliminar botones de area
            setMessages(msg.chats.map(chat => ({
              ...chat
            })));
          }
          break;
        default:
          console.log('Unknown message type:', msg.type);
      }
      if (msg.message && msg.message.text === 'Reporte finalizado' && msg.message.IsAdmin === 1) {
        setShowQuestions(true); // Forzar al usuario a seleccionar un área
        setIsDisabled(true); // Deshabilitar input y botón
      }
    };

    return () => clearInterval(intervalId);
  }, [ws, messages, intervalId]);

  useEffect(() => {
    const storedChatId = localStorage.getItem('chat_id_client'); // Recuperar chat_id de localStorage
    console.log('hola' + storedChatId);
  }, [ws]);

  const startFetchingUnreadOwnersCount = () => {
    const fetchUnreadOwnersCount = async () => {
      console.log('Fetching unread owners count...');
      ws.send(JSON.stringify({ type: 'GET_UNREAD_OWNERS' }));
    };

    fetchUnreadOwnersCount();
    const newIntervalId = setInterval(fetchUnreadOwnersCount, 10000);
    setIntervalId(newIntervalId);
  };

  const handleSelectArea = (areaId, areaText) => {
    const userId = localStorage.getItem('user_id');
    setSelectedArea(areaId);
    setShowQuestions(false); //ocultar botones de seleccionar area
    setIsDisabled(false); // Habilitar input y botón
    ws.send(JSON.stringify({
      type: 'SELECT_AREA',
      area_id: areaId,
    }));

    // Enviar mensaje al chat sobre la selección del área
    const message = {
      type: 'MESSAGE',
      text: `Área seleccionada: ${areaText}`,
      chat_id: chatId,
      owner_id: userId,
      IsAdmin: 0,
      area_id: selectedArea,
      timestamp: new Date().toISOString(),
      url: currentUrl // Incluye la URL actual en el mensaje
    };

    console.log('Sending message with URL:', message); // Verificar el mensaje antes de enviarlo

    // Enviar mensaje al servidor
    ws.send(JSON.stringify(message));

    if (!intervalId) {
      startFetchingUnreadOwnersCount();
    }
  };

  const handleLogin = (storedUserClient) => {
    const handleLoginResponse = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LOGIN_SUCCESS') {
        ws.send(JSON.stringify({
          type: 'GET_CHATS_CLIENT',
          chat_id: localStorage.getItem('chat_id_client'),
          url: currentUrl // Incluye la URL actual en la solicitud de chats
        }));

        ws.addEventListener('message', (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === 'CHATS_CLIENT') {
            const areaId = localStorage.getItem('area_id_client');
            if (areaId) {
              setSelectedArea(areaId); // Actualiza selectedArea con el valor de localStorage
              ws.send(JSON.stringify({
                type: 'SELECT_AREA',
                area_id: areaId,
                url: currentUrl // Incluye la URL actual en la selección de área
              }));
            } else {
              console.error('No area_id found in localStorage');
            }
          }
        });

        ws.removeEventListener('message', handleLoginResponse);
      } else if (msg.type === 'LOGIN_FAILURE') {
        navigate('/'); // Redirigir al login si el login falla
        ws.removeEventListener('message', handleLoginResponse);
      }
    };

    ws.addEventListener('message', handleLoginResponse);

    const loginMessage = {
      type: 'LOGIN',
      ...storedUserClient,
      url: currentUrl // Incluye la URL actual en la solicitud de login
    };
    console.log('Sending login message with URL:', loginMessage); // Verificar el mensaje de login

    ws.send(JSON.stringify(loginMessage));
  };

  const handleSendMessage = () => {
    if (!ws || !selectedArea) {
      alert('No area selected or WebSocket connection not established.');
      return;
    }

    console.log(localStorage.getItem('name_client'));
    console.log(localStorage.getItem('chat_id_client'));
    // Evitar enviar el mensaje dos veces
    const message = {
      type: 'MESSAGE',
      text: messageInput,
      chat_id: chatId,
      owner_id: localStorage.getItem('user_id'),
      area_id: selectedArea,
      IsAdmin: 0,
      url: currentUrl // Incluye la URL actual en el mensaje
    };
    console.log('Sending message with URL:', message); // Verificar el mensaje antes de enviarlo

    ws.send(JSON.stringify(message)); //aqui es donde se envia el mensaje y se muestra en pantalla
    setMessageInput('');

    if (!intervalId) {
      startFetchingUnreadOwnersCount();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleReportClick = async () => {
    const userId = localStorage.getItem('user_id');
    if (!ws || !userId) {
      alert('WebSocket connection not established or user_id not found.');
      return;
    }

    // Verificar si el área ya está seleccionada
    if (selectedArea === null) {
      handleSelectArea(3, 'Reporte realizado con éxito');
    } else {
      // Mostrar un mensaje en el chat de que el reporte se está realizando sin cambiar el área
      const message = {
        type: 'MESSAGE',
        text: 'Reporte realizado con éxito',
        chat_id: chatId,
        owner_id: userId,
        IsAdmin: 0,
        area_id: selectedArea,
        timestamp: new Date().toISOString(),
        url: currentUrl // Incluye la URL actual en el mensaje
      };
      console.log('Sending report message with URL:', message); // Verificar el mensaje de reporte antes de enviarlo
      ws.send(JSON.stringify(message));
    }

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
          area_id: selectedArea,
          owner_id: userId,
          url: currentUrl // Incluye la URL actual en el mensaje
        };

        console.log('Sending report message with URL:', reportMessage); // Verificar el mensaje de reporte antes de enviarlo
        ws.send(JSON.stringify({
          type: 'REPORT_MESSAGE',
          message: reportMessage,
          timestamp: data.report.timestamp,
          user_id: userId,
          chat_id: chatId,
          area_id: selectedArea,
          owner_id: userId,
          url: currentUrl // Incluye la URL actual en el mensaje
        }));
      }
    } catch (error) {
      console.error('Error al ejecutar la API de hacer_reporte:', error);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="Client-container">
      {!showChat ? (
        <button className="Client-chat-toggle-button" onClick={toggleChat}>
          <img src="https://cdn-icons-png.freepik.com/512/5041/5041093.png" alt="Chat Icon" className="Client-chat-icon" />
        </button>
      ) : (
        <div className="Client-chat-window">
          <button className="Client-chat-close-button" onClick={toggleChat}>
            <i className="bi bi-x"></i>
          </button>
          <h2>Chat {unreadOwnersCount > 0 && `Lugar en cola aproximado: ${unreadOwnersCount}`}</h2>
          <div className="Client-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`Client-message ${msg.IsAdmin ? 'Admin' : 'Client'} ${msg.text === 'Reporte finalizado' && msg.IsAdmin === 1 ? 'finalized' : ''}`}>
                <div className="Client-message-content">
                  <div>{msg.text}</div>
                  <div className="Client-message-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="Client-message-input">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="form-control"
              onKeyPress={handleKeyPress}
              disabled={isDisabled} // Deshabilitar input
            />
            <button className="btn btn-success" onClick={handleSendMessage} disabled={isDisabled}>Enviar</button>
          </div>
          {showQuestions && (
            <div className="Client-question-buttons mt-3">
              <p>Seleccionar area</p>
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
    </div>
  );
}

export default Client;
