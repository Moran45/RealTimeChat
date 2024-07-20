import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../WebSocketContext';

function Login() {
  const [emailOrName, setEmailOrName] = useState('');
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
          localStorage.setItem('user_id', msg.user_id);
          if (msg.role === 'admin') {
            console.log('area_id',msg.area_id)
            localStorage.setItem('area_id', msg.area_id);
            navigate('/admin');
          } else if (msg.role === 'client') {
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

    ws.send(JSON.stringify({
      type: 'LOGIN',
      email_or_name: emailOrName,
    }));
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        value={emailOrName}
        onChange={(e) => setEmailOrName(e.target.value)}
        placeholder="Email o Nombre"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
