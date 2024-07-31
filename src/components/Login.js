import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../WebSocketContext';
import '../Login.css'; // Asegúrate de importar el nuevo archivo CSS

function Login() {
  const [emailOrName, setEmailOrName] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const ws = useWebSocket();
  const [wsReady, setWsReady] = useState(false);

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        setWsReady(true);
        console.log('WebSocket connection is ready.');
      };

      ws.onclose = () => {
        setWsReady(false);
        console.log('WebSocket connection closed.');
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log('Login response:', msg);
        if (msg.type === 'LOGIN_SUCCESS') {
          console.log('Setting user_id:', msg.user_id);
          if (msg.role === 'admin') {
            console.log('area_id', msg.area_id);
            localStorage.setItem('user_id', msg.user_id);
            localStorage.setItem('area_id', msg.area_id);
            localStorage.setItem('user_id_admin', msg.user_id);
            localStorage.setItem('name', msg.name);
            localStorage.setItem('password', msg.password);
            localStorage.setItem('type_admin', msg.type_admin);
            localStorage.setItem('current_url', msg.current_url);
            navigate('/admin');
          } else if (msg.role === 'client') {
            localStorage.setItem('name_client', msg.name);
            localStorage.setItem('user_id_client', msg.user_id);
            navigate('/client');
          }
        } else if (msg.type === 'LOGIN_FAILURE') {
          alert('Login failed');
        }
      };
    }
  }, [ws, navigate]);

  const handleLogin = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert('WebSocket connection not established.');
      return;
    }

    const payload = {
      type: 'LOGIN',
      email_or_name: emailOrName,
    };

    if (isAdmin) {
      payload.password = password;
    }

    ws.send(JSON.stringify(payload));
  };

  return (
    <div className="appscss-login-container">
      <h2>Bienvenido</h2>
      <div className="appscss-tab-switch">
        <div
          className={`appscss-tab ${!isAdmin ? 'appscss-active' : ''}`}
          onClick={() => setIsAdmin(false)}
        >
          Cliente
        </div>
        <div
          className={`appscss-tab ${isAdmin ? 'appscss-active' : ''}`}
          onClick={() => setIsAdmin(true)}
        >
          Admin
        </div>
      </div>
      <div className="appscss-login-form">
        <input
          type="text"
          value={emailOrName}
          onChange={(e) => setEmailOrName(e.target.value)}
          placeholder="Email o nombre de usuario"
        />
        {isAdmin && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
        )}
        <button onClick={handleLogin}>Iniciar Sesión</button>
      </div>
    </div>
  );
}

export default Login;