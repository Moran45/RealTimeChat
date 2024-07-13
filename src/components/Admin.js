
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../WebSocketContext';

function Admin() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]); // Similar a Client.js
  const ws = useWebSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'CHATS') {
        setChats(msg.chats);
      } else if (msg.type === 'CHAT_MESSAGES' && msg.chat_id === selectedChat?.chat_id) {
        setMessages(msg.messages);
      } else if (msg.type === 'MESSAGE' && selectedChat) {
        console.log("message Admin",msg.type);
        setMessages((prev) => [...prev, msg.message]);
      }else if (msg.type === 'NEW_CHAT') {
        ws.send(JSON.stringify({ type: 'GET_CHATS' }));
      }else if (msg.type === 'CHAT_REDIRECTED') {
      ws.send(JSON.stringify({ type: 'GET_CHATS' }));
    }
    };

    ws.send(JSON.stringify({ type: 'GET_CHATS' }));

    return () => {
      if (ws) {
        ws.onmessage = null; // Cleanup listener
      }
    };
  }, [ws, selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    ws.send(JSON.stringify({ type: 'GET_CHAT_MESSAGES', chat_id: chat.chat_id }));
  };
  const handleRedirectChat = (chatId, newAreaId) => {
    if (!ws) {
      alert('WebSocket connection not established.');
      return;
    }

    ws.send(JSON.stringify({
      type: 'REDIRECT_CHAT',
      chat_id: chatId,
      new_area_id: newAreaId,
    }));

    ws.send(JSON.stringify({ type: 'GET_CHATS' }));
  };

  const handleSendMessage = () => {
    if (!ws || !selectedChat) {
      alert('WebSocket connection not established or chat not selected.');
      return;
    }

    console.log("selectedChatId: ",selectedChat.chat_id)
    const message = {
      type: 'MESSAGE',
      chat_id: selectedChat.chat_id,
      text: messageInput,
      owner_id: localStorage.getItem('user_id'),
      role: 'Admin'
    };

    console.log(JSON.stringify(message));
    ws.send(JSON.stringify(message));
    setMessageInput('');
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="admin-app container-fluid">
      <div className="admin-chat-container row">
        <div className="admin-chat-list col-md-4">
          <h2>Chats</h2>
          {chats.map((chat, index) => (
            <div key={index} onClick={() => handleSelectChat(chat)} className="chat-item">
              <div>{chat.user_name}</div>
              <button onClick={(e) => {
                e.stopPropagation();
                handleRedirectChat(chat.chat_id, 2);
              }}>Redirigir a área 2</button>
            </div>
          ))}
        </div>
        <div className="admin-chat-window col-md-8">
          {selectedChat ? (
            <>
              <h3>Chat with {selectedChat.user_name}</h3>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role === 'Admin' ? 'admin-message' : 'client-message'}`}>
                    <strong>{msg.role}:</strong> {msg.text}
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
                <button onClick={handleSendMessage}>Enviar</button>
              </div>
            </>
          ) : (
            <p>Select a chat to start messaging.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
