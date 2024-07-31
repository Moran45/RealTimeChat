import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../WebSocketContext'; // Ajustada la ruta
import '../admin.css'; // Ajustada la ruta
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const navigate = useNavigate();
  const [wsReady, setWsReady] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]); // Similar a Client.js
  const [clients, setClients] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [finalizedChats, setFinalizedChats] = useState([]); // Lista de chats finalizados
  const [showAdminListModal, setShowAdminListModal] = useState(false); // Mostrar lista de administradores
  const [adminList, setAdminList] = useState([]); // Setear lista de admins
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Modal de confirmación para guardar cambios
  const [showConfirmationModalCreate, setShowConfirmationModalCreate] = useState(false); // Modal de confirmación para guardar cambios
  const [sortOrder, setSortOrder] = useState('desc');
  const [showRedirectButtons, setShowRedirectButtons] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false); // Estado para filtro de no leídos
  const messagesEndRef = useRef(null);
  const [editingAdminIndex, setEditingAdminIndex] = useState(null);
  const [newUserData, setNewUserData] = useState({
    user_id: '',
    name: '',
    email: '',
    area_id: '',
    created_at: '',
    contrasena: '',
    type_admin: ''
  });
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
      email_or_name: localStorage.getItem('name'),
      type_admin: localStorage.getItem('type_admin'),
      password: localStorage.getItem('password')
    };

    if (storedUser.user_id && storedUser.area_id) {
      setUser(storedUser);
      if (ws) {
        handleLogin(storedUser);
      }
      setWelcomeMessage(`Hola! ${storedUser.name}, tipo de admin: ${storedUser.type_admin}`);
    } else {
      navigate('/');
    }
  }, [ws, navigate]);

  const handleLogin = (storedUser) => {
    const handleLoginResponse = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LOGIN_SUCCESS') {
        // Store additional data
        localStorage.setItem('type_admin', msg.type_admin);

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
        if (isChatFinalized(selectedChat.chat_id)) {
          setFinalizedChats((prev) => prev.filter(id => id !== selectedChat.chat_id));
        }
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
        if (isChatFinalized(selectedChat?.chat_id)) {
          setFinalizedChats((prev) => prev.filter(id => id !== selectedChat.chat_id));
        }
      } else if (msg.type === 'NEW_CHAT') {
        ws.send(JSON.stringify({ type: 'GET_CHATS' }));
      } else if (msg.type === 'CHAT_REDIRECTED') {
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
      } else if (msg.type === 'GET_ADMINS') {
        setAdminList(msg.admins);
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
  }, [navigate]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowRedirectButtons(true);
    ws.send(JSON.stringify({ type: 'GET_CHAT_MESSAGES', chat_id: chat.chat_id }));
    ws.send(JSON.stringify({ type: 'MARK_AS_READ', chat_id: chat.chat_id }));
  };

  const handleCreateUser = () => {
    const storedUser = {
      user_id: localStorage.getItem('user_id'),
      name: localStorage.getItem('name'),
    }
    console.log(storedUser);
    const message = {
      type: 'CREATE_ADMIN',
      name: newUserData.name,
      email: newUserData.email,
      area_id: newUserData.area_id,
      contrasena: newUserData.contrasena,
      type_admin: newUserData.type_admin,
      user_mom: storedUser.name,
      user_mom_id: storedUser.user_id
    };
    console.log('New user:', message);
    ws.send(JSON.stringify(message));
    setShowCreateUserModal(false);
  };

  const handleShowAdminList = () => {
    const storedId = localStorage.getItem('user_id');
    const message = {
      type: 'GET_ADMINS',
      user_mom_id: storedId
    };
    ws.send(JSON.stringify(message));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value
    });
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
        type: 'FINALIZE',
        chat_id: selectedChat.chat_id,
        text: 'Reporte finalizado',
        owner_id: localStorage.getItem('user_id'),
        IsAdmin: 1,
        role: 'Admin',
        chat_finalized: 1
      };

      ws.send(JSON.stringify(message));
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

  const handleChange = (e, index, field) => {
    const updatedAdminList = [...adminList];
    updatedAdminList[index][field] = e.target.value;
    setAdminList(updatedAdminList);
  };

  const handleUpdate = (id, updatedAdmin) => {
    const adminToUpdate = { ...updatedAdmin, id };

    fetch('https://phmsoft.tech/Ultimochatlojuro/edit_admins.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminToUpdate),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Admin actualizado:', data);
          setShowAdminListModal(false);
        } else {
          console.error('Error al actualizar el admin:', data.error);
        }
      })
      .catch(error => {
        console.error('Error en la solicitud:', error);
      });
  };

  const handleDelete = (id) => {
    fetch('https://phmsoft.tech/Ultimochatlojuro/delate_admins.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setAdminList(adminList.filter(admin => admin.id !== id));
        } else {
          console.error('Error al eliminar el admin:', data.error);
        }
      });
  };

  const handleSaveChanges = (index) => {
    setShowConfirmationModal(true);
    setEditingAdminIndex(index);
  };

  const confirmSaveChanges = () => {
    if (editingAdminIndex !== null) {
      const adminToUpdate = adminList[editingAdminIndex];
      handleUpdate(adminToUpdate.id, adminToUpdate);
      setShowConfirmationModal(false);
      setEditingAdminIndex(null);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileDataUrl = reader.result;
        const message = {
          type: 'MESSAGE',
          text: fileDataUrl,
          content: reader.result,
          fileName: file.name,
          chat_id: selectedChat.chat_id,
          owner_id: localStorage.getItem('user_id'),
          IsAdmin: 1
        };
        ws.send(JSON.stringify(message));
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="admin-container">
      {showAdminListModal && <div className="modal-backdrop fade show"></div>}
      <div className={`modal ${showCreateUserModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crear usuario</h5>
              <button type="button" className="close" onClick={() => setShowCreateUserModal(false)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" className="form-control" name="name" value={newUserData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" name="email" value={newUserData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Área ID</label>
                <input type="text" className="form-control" name="area_id" value={newUserData.area_id} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" className="form-control" name="contrasena" value={newUserData.contrasena} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Tipo de Admin</label>
                <select className="form-control" name="type_admin" value={newUserData.type_admin} onChange={handleInputChange}>
                  <option value="Sub">Sub</option>
                  <option value="Full">Full</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateUserModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={() => setShowConfirmationModalCreate(true)}>Crear usuario</button>
            </div>
          </div>
        </div>
      </div>
      {showCreateUserModal && <div className="modal-backdrop fade show"></div>}
      {showConfirmationModalCreate && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmación</h5>
                <button type="button" className="close" onClick={() => setShowConfirmationModalCreate(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas crear este usuario?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModalCreate(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleCreateUser}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`admin-header ${user && user.type_admin !== 'Full' ? 'admin-header-blue' : 'bg-primary'} text-white p-3 d-flex justify-content-between align-items-center`}>
        <div className="header-left">
          <h2>Chats</h2>
          <p>{welcomeMessage}</p>
        </div>
        <div className="header-right">
          {user && user.type_admin === 'Full' && (
            <>
              <button className="btn btn-light" onClick={() => setShowCreateUserModal(true)}>Crear Usuario</button>
              <button className="btn btn-light ml-2" onClick={() => { setShowAdminListModal(true); handleShowAdminList(); }}>Lista de admins</button>
            </>
          )}
        </div>
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
      <div className={`admin-message ${msg.IsAdmin === 1 ? 'admin-message-admin' : 'admin-message-client'} p-2 mb-2 rounded ${msg.type === 'FINALIZE' || (msg.text === 'Reporte finalizado' && msg.IsAdmin === 1) ? 'admin-message-finalized' : ''}`}>
        <strong>{msg.IsAdmin === 1 ? 'Admin' : 'Cliente'}:</strong> 
        {msg.text.startsWith('data:image/') ? (
          // Si el mensaje comienza con 'data:image/', asumimos que es una imagen
          <div>
            <img src={msg.text} alt={msg.fileName || 'Imagen'} className="admin-message-image" />
          </div>
        ) : (
          <div>{msg.text}</div>
        )}
      </div>
      {msg.text === 'Reporte finalizado' && msg.IsAdmin === 1 && (
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
                <label className="file-upload-label">
                  Subir Archivo
                  <input type="file"  onClick={handleFileUpload}/>
                </label>
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
      {showAdminListModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lista de Admins</h5>
                <button type="button" className="close" onClick={() => setShowAdminListModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'scroll' }}>
                {adminList.map((admin, index) => (
                  <div key={index} className="admin-item mb-3 p-3 border rounded">
                    <div className="form-group">
                      <label>ID:</label>
                      <input type="text" className="form-control" value={admin.id} disabled />
                    </div>
                    <div className="form-group">
                      <label>Nombre:</label>
                      <input type="text" className="form-control" value={admin.name} onChange={(e) => handleChange(e, index, 'name')} />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input type="email" className="form-control" value={admin.email} onChange={(e) => handleChange(e, index, 'email')} />
                    </div>
                    <div className="form-group">
                      <label>Área:</label>
                      <input type="number" className="form-control" value={admin.area_id} onChange={(e) => handleChange(e, index, 'area_id')} />
                    </div>
                    <div className="form-group">
                      <label>Tipo Admin:</label>
                      <input type="text" className="form-control" value={admin.type_admin} onChange={(e) => handleChange(e, index, 'type_admin')} />
                    </div>
                    <div className="form-group">
                      <label>Contraseña:</label>
                      <input type="password" className="form-control" value={admin.contrasena} onChange={(e) => handleChange(e, index, 'contrasena')} />
                    </div>
                    <button className="btn btn-danger me-2" onClick={() => handleDelete(admin.id)}>Eliminar</button>
                    <button className="btn btn-success" onClick={() => handleSaveChanges(index)}>Guardar Cambios</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmación</h5>
                <button type="button" className="close" onClick={() => setShowConfirmationModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas guardar los cambios?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={confirmSaveChanges}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
