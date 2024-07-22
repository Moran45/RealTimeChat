import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../WebSocketContext'; // Ajustada la ruta
import '../admin.css'; // Ajustada la ruta
import Login from './Login';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [wsReady, setWsReady] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]); // Similar a Client.js
  const [clients, setClients] = useState([]);
  const [finalizedChats, setFinalizedChats] = useState([]); // Lista de chats finalizados
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [showRedirectButtons, setShowRedirectButtons] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false); // Estado para filtro de no leídos
  const messagesEndRef = useRef(null);
  const [currentAdminArea, setCurrentAdminArea] = useState(() => {
    const storedArea = localStorage.getItem('area_id');
    return storedArea ? parseInt(storedArea, 10) : 1; // Usa 1 como valor por defecto si no hay área almacenada
  });
  const ws = useWebSocket();  

  useEffect(() => {
    const storedUser = {
      user_id: localStorage.getItem('user_id'),
      area_id: localStorage.getItem('area_id'),
      role: 'admin', // Asumiendo que solo los admins llegan a esta página
      name: localStorage.getItem('name'),
      email_or_name: localStorage.getItem('name')
    };
  
    if (storedUser.user_id && storedUser.area_id) {
      setUser(storedUser);
      if (ws) {
        handleLogin(storedUser);
      }
    } else {
      navigate('/'); // Redirigir al login si no hay información de usuario
    }
  }, [ws, navigate]);
  

  useEffect(() => {
    if (!ws) return;

    const handleNewMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'CHATS') {
        setChats(msg.chats);
        sortChats(msg.chats, 'desc');
      } else if (msg.type === 'CHAT_MESSAGES' && msg.chat_id === selectedChat?.chat_id) {
        setMessages(msg.messages || []);
      } else if (msg.type === 'MESSAGE') {
        setMessages((prev) => [...prev, msg.message]);
        scrollToBottom();
      } else if (msg.type === 'NEW_CHAT' || msg.type === 'CHAT_REDIRECTED' || msg.type === 'CHAT_DELETED') {
        ws.send(JSON.stringify({ type: 'GET_CHATS' }));
      }
    };

    ws.onclose = () => {
      setWsReady(false);
      console.log('WebSocket connection closed.');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log('Received message:', msg);
      if (msg.type === 'CHATS') {
        setChats(msg.chats);
        sortChats(msg.chats, 'desc');
      } else if (msg.type === 'CHAT_MESSAGES' && msg.chat_id === selectedChat?.chat_id) {
        setMessages(msg.messages);
      } else if (msg.type === 'MESSAGE' && selectedChat) {
        setMessages((prev) => [...prev, msg.message]);
      } else if (msg.type === 'NEW_CHAT') {
        ws.send(JSON.stringify({ type: 'GET_CHATS' }));
      }else if (msg.type === 'CHAT_REDIRECTED') {
        ws.send(JSON.stringify({ type: 'GET_CHATS' }));
      } else if (msg.type === 'CHAT_DELETED') {
        ws.send(JSON.stringify({ type: 'GET_CHATS' }));
      } else if (msg.type === 'NEW_CLIENT') {
        setClients((prevClients) => {
          if (!prevClients.find(client => client.name === msg.client)) {
            return [...prevClients, { name: msg.client, unreadCount: 0 }];
          }
          return prevClients;
        });
      } else {
        setMessages((prevMessages) => {
          const updatedMessages = { ...prevMessages };
          if (!updatedMessages[msg.client]) {
            updatedMessages[msg.client] = [];
          }
          if (!updatedMessages[msg.client].find(message => message.timestamp === msg.timestamp && message.text === msg.text)) {
            updatedMessages[msg.client].push(msg);
          }
          return updatedMessages;
        });

        if (msg.role === 'Cliente') {
          setClients((prevClients) =>
            prevClients.map((client) =>
              client.name === msg.client
                ? { ...client, unreadCount: client.unreadCount + 1 }
                : client
            )
          );
        }
      }
    };

    ws.send(JSON.stringify({ type: 'GET_CHATS' }));
  
    return () => {
      ws.removeEventListener('message', handleNewMessage);
    };
  }, [ws, selectedChat]);
  
  const handleLogin = (storedUser) => {
    const handleLoginResponse = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LOGIN_SUCCESS') {
        ws.send(JSON.stringify({
          type: 'GET_CHATS'
        }));
        ws.removeEventListener('message', handleLoginResponse);
      } else if (msg.type === 'LOGIN_FAILURE') {
        navigate('/'); // Redirigir al login si el login falla
        ws.removeEventListener('message', handleLoginResponse);
      }
    };

    ws.addEventListener('message', handleLoginResponse);

    ws.send(JSON.stringify({
      type: 'LOGIN',
      ...storedUser
    }));
  };

  const sortChats = (chatsToSort, order) => {
    const chatsWithUnreadMessages = chatsToSort.filter(chat => chat.unread_count > 0);
    const sortedChats = chatsWithUnreadMessages.sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1];
      const lastMessageB = b.messages[b.messages.length - 1];
      return order === 'desc'
        ? new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp)
        : new Date(lastMessageA.timestamp) - new Date(lastMessageB.timestamp);
    });
    const unchangedChats = chatsToSort.filter(chat => chat.unread_count === 0);
    setChats([...sortedChats, ...unchangedChats]);
    setSortOrder(order);
  };


  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    else navigate('/');
  }, [navigate]);
  

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowRedirectButtons(true);
    ws.send(JSON.stringify({ type: 'GET_CHAT_MESSAGES', chat_id: chat.chat_id }));
    ws.send(JSON.stringify({ type: 'MARK_AS_READ', chat_id: chat.chat_id }));
  };

  const handleRedirectChat = (newAreaId) => {
    if (!ws || !selectedChat) {
      alert('WebSocket connection not established or chat not selected.');
      return;
    }

    ws.send(JSON.stringify({
      type: 'REDIRECT_CHAT',
      chat_id: selectedChat.chat_id,
      new_area_id: newAreaId,
    }));

    ws.send(JSON.stringify({ type: 'GET_CHATS' }));
    setShowRedirectButtons(false);
  };

  const handleSendMessage = () => {
    if (!ws || !selectedChat) {
      alert('WebSocket connection not established or chat not selected.');
      return;
    }

    const message = { 
      type: 'MESSAGE',
      chat_id: selectedChat.chat_id,
      text: messageInput,
      owner_id: localStorage.getItem('user_id'),
      role: 'Admin',
      IsAdmin: 1,
    };

    ws.send(JSON.stringify(message));
    console.log('Sent message:', message);
    
    setMessageInput('');
    scrollToBottom();
  };

  const finalizeReport = () => {
    if (ws && selectedChat) {
      const message = {
        type: 'finalize',
        chat_id: selectedChat.chat_id,
        text: 'Reporte finalizado',
        owner_id: localStorage.getItem('user_id'),
        IsAdmin : 1,
        role: 'Admin',
      };

      ws.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setFinalizedChats((prev) => [...prev, selectedChat.chat_id]);
      setShowModal(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleUnreadFilter = () => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const handleSortChats = () => {
    sortChats(chats, sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const getRedirectOptions = () => {
    const allAreas = [1, 2, 3];
    return allAreas.filter(area => area !== currentAdminArea);
  };

  const isChatFinalized = (chatId) => finalizedChats.includes(chatId);

 return (
    <div className="admin-container">
      <div className="admin-header bg-primary text-white p-3">
        <h2>Chats</h2>
        {user && <p>Logged in as: {user.user_id}</p>}
      {user && <p>area is: {user.area_id}</p>}
      {user && <p>role: {user.role}</p>}
      {user && <p>name: {user.name}</p>}
      </div>
      <div className="admin-main d-flex">
        <div className="admin-chat-list p-3">
          <div className="d-flex justify-content-between mb-3">
            <h4>Mostrando {sortOrder === 'desc' ? 'más recientes' : 'más antiguos'}</h4>
            <button className="btn btn-light" onClick={handleSortChats}>
              {sortOrder === 'desc' ? 'Mostrar más antiguos' : 'Mostrar más recientes'}
            </button>
          </div>
          <button className="btn btn-light mb-3" onClick={handleToggleUnreadFilter}>
            {showUnreadOnly ? 'Todos' : 'No Leídos'}
          </button>
          {chats.filter(chat => !showUnreadOnly || chat.unread_count > 0).map((chat, index) => (
            <div key={index} onClick={() => handleSelectChat(chat)} className={`admin-chat-item p-2 mb-2 ${selectedChat?.chat_id === chat.chat_id ? 'bg-info text-white' : 'bg-light'}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>{chat.user_name} - {chat.unread_count} no leídos</div>
                {chat.unread_count > 0 && <div className="unread-indicator"></div>}
              </div>
            </div>
          ))}
        </div>
        <div className="admin-chat-window p-3 flex-grow-1">
          {selectedChat ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <h3>Chat con {selectedChat.user_name}</h3>
                {showRedirectButtons && (
                  <div className='div-btn'>
                    {getRedirectOptions().map(area => (
                      <button
                        key={area}
                        className="btn btn-secondary me-2"
                        onClick={() => handleRedirectChat(area)}
                      >
                        Redirigir a área {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-chat-messages p-3 border rounded mb-3">
                {Array.isArray(messages) && messages.map((msg, index) => (
                  <div key={index} className={`message-container ${msg.IsAdmin === 1 ? 'admin-message-container' : ''}`}>
                    <div
                      className={`admin-message ${msg.IsAdmin === 1 ? 'admin-message-admin' : 'admin-message-client'} p-2 mb-2 rounded ${msg.type === 'finalize' ? 'admin-message-finalized' : ''}`}
                    >
                      <strong>{msg.IsAdmin === 1 ? 'Admin' : 'Cliente'}:</strong> {msg.text}
                    </div>
                    {msg.type === 'finalize' && (
                      <div className="admin-message-separator">
                        <strong>Reporte finalizado</strong>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="admin-chat-input d-flex align-items-center">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Escribe tu mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  disabled={isChatFinalized(selectedChat.chat_id)}
                />
                <button className="btn btn-success me-2" onClick={handleSendMessage} disabled={isChatFinalized(selectedChat.chat_id)}>Enviar</button>
                <button className="btn btn-danger" onClick={() => setShowModal(true)} disabled={isChatFinalized(selectedChat.chat_id)}>Finalizar Reporte</button>
              </div>
            </>
          ) : (
            <p>Selecciona un chat para empezar a mensajear.</p>
          )}
        </div>
      </div>

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
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default Admin;

//