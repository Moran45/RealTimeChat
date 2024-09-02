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
      current_Url: currentUrl
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
    const name = localStorage.getItem('name_client');
    const token = localStorage.getItem('token_client');
    const fetchUnreadOwnersCount = async () => {
      console.log('Fetching unread owners count...');
      ws.send(JSON.stringify({ type: 'GET_UNREAD_OWNERS', token: token, email_or_name: name }));
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
  
    console.log('hola' + storedChatId)

  }, [ws]);

  const startFetchingUnreadOwnersCount = () => {
    const fetchUnreadOwnersCount = async () => {
      const name = localStorage.getItem('name_client');
      const token = localStorage.getItem('token_client');
      console.log('Fetching unread owners count...');
      ws.send(JSON.stringify({ type: 'GET_UNREAD_OWNERS', email_or_name: name, token: token }));
    };

    fetchUnreadOwnersCount();
    const newIntervalId = setInterval(fetchUnreadOwnersCount, 10000);
    setIntervalId(newIntervalId);
  };

  const handleSelectArea = (areaId, areaText) => {
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('name_client');
    const token = localStorage.getItem('token_client');
    setSelectedArea(areaId);
    setShowQuestions(false); //ocultar botones de seleccionar area
    setIsDisabled(false); // Habilitar input y botón
    ws.send(JSON.stringify({
      type: 'SELECT_AREA',
      area_id: areaId,
      current_url : currentUrl,
      token: token,
      email_or_name: name
    }));

    // Enviar mensaje al chat sobre la selección del área
    const message = {
      type: 'MESSAGE',
      text: `Área seleccionada: ${areaText}`,
      chat_id: chatId,
      owner_id: userId,
      IsAdmin: 0,
      area_id : selectedArea,
      timestamp: new Date().toISOString(),
      current_url: currentUrl,
      token: token,
      email_or_name: name
    };
    
    // Enviar mensaje al servidor
    ws.send(JSON.stringify(message));

    if (!intervalId) {
      startFetchingUnreadOwnersCount();
    }
  };

  const handleLogin = (storedUserClient) => {
    const handleLoginResponse = (event) => {
      const msg = JSON.parse(event.data);
      const name = localStorage.getItem('name_client');
      const token = localStorage.getItem('token_client');
      if (msg.type === 'LOGIN_SUCCESS') {
        ws.send(JSON.stringify({
          type: 'GET_CHATS_CLIENT',
          email_or_name: name,
          chat_id: localStorage.getItem('chat_id_client'),
          current_url: currentUrl, // Incluye la URL actual en la solicitud de chats
          token: token
        }));

        ws.addEventListener('message', (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === 'CHATS_CLIENT') {
            const areaId = localStorage.getItem('area_id_client');
            const name = localStorage.getItem('name_client');
            if (areaId) {
              setSelectedArea(areaId); // Actualiza selectedArea con el valor de localStorage
              ws.send(JSON.stringify({
                type: 'SELECT_AREA',
                area_id: areaId,
                current_url: currentUrl, // Incluye la URL actual en la selección de área
                token: token,
                email_or_name: name
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
    const token = localStorage.getItem('token_client');
    ws.send(JSON.stringify({
      type: 'LOGIN',
      ...storedUserClient,
      token: token
    }));
  };  

  const handleSendMessage = () => {
    if (!ws || !selectedArea) {
      alert('No area selected or WebSocket connection not established.');
      return;
    }
    const name = localStorage.getItem('name_client');
    const token = localStorage.getItem('token_client');
    console.log(localStorage.getItem(name))
    console.log(localStorage.getItem('chat_id_client'))
    // Evitar enviar el mensaje dos veces
    const message = {
      type: 'MESSAGE',
      text: messageInput,
      chat_id: chatId,
      owner_id: localStorage.getItem('user_id'),
      area_id : selectedArea,
      IsAdmin: 0,
      current_url: currentUrl,
      chat_finalized: 0,
      token: token,
      email_or_name: name
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
    const token = localStorage.getItem('token_client');
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
        area_id : selectedArea,
        timestamp: new Date().toISOString(),
        current_url: currentUrl,
        token: token
      };
      console.log('Sending report message with URL:', message); // Verificar el mensaje de reporte antes de enviarlo
      ws.send(JSON.stringify(message));
    }

    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'START_CHAT',
        user_id: userId,
        token: token
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
          current_url: currentUrl,
          token : token
        };
  
        ws.send(JSON.stringify({
          type: 'REPORT_MESSAGE',
          message: reportMessage,
          timestamp: data.report.timestamp,
          user_id: userId,
          chat_id: chatId,
          area_id: selectedArea,
          owner_id: userId,
          current_url: currentUrl,
          token: token
        }));
      }
    } catch (error) {
      console.error('Error al ejecutar la API de hacer_reporte:', error);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleFileUpload = async (event) => {
    const token = localStorage.getItem('token_client');
    const file = event.target.files[0];
    if (file) {
      // Verificar el tamaño del archivo
      const maxSizeInMB = 10;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convertir MB a bytes
  
      if (file.size > maxSizeInBytes) {
        alert('El archivo es demasiado grande. Debe ser menor de 10 MB.');
        return; // Detener el procesamiento si el archivo es demasiado grande
      }
  
      try {
        // Redimensionar la imagen
        const resizedFile = await resizeImage(file, 800, 600); // 800x600 es un ejemplo, ajusta según necesites
  
        // Crear un objeto FormData para enviar la imagen redimensionada
        const formData = new FormData();
        formData.append('image', resizedFile, file.name);
  
        // Enviar la imagen redimensionada a la API
        const response = await fetch('https://phmsoft.tech/Ultimochatlojuro/upload_images.php', {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) {
          throw new Error('Error al subir la imagen');
        }
  
        // Obtener la respuesta JSON de la API
        const data = await response.json();
  
        if (data.error) {
          throw new Error(data.error);
        }
  
        // La URL de la imagen devuelta por la API
        const imageUrl = data.image_url;
  
        // Crear el mensaje con la URL de la imagen
        const message = {
          type: 'MESSAGE',
          text: imageUrl,  // Usar la URL de la imagen en lugar del Data URL
          content: imageUrl,  // Puedes ajustar esto si necesitas un formato diferente
          fileName: file.name,
          chat_id: chatId,
          owner_id: localStorage.getItem('user_id'),
          area_id: selectedArea,
          IsAdmin: 0,
          current_url: currentUrl,
          token: token
        };
  
        // Enviar el mensaje a través del WebSocket
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error en la carga de archivos:', error);
      }
    }
  };
  
  
  // Función para redimensionar la imagen
  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          }, file.type);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
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
      {msg.text.startsWith('https://phmsoft.tech/Ultimochatlojuro/images') ? (
          //modificar la url segun su servidor donde guarden sus imagenes
          <div>
            <img src={msg.text} alt={msg.fileName} className="Client-message-image" />
          </div>
        ) : (
          <div>{msg.text}</div>
        )}
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
            <label className="btn btn-primary">
              Subir archivo
              <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
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
