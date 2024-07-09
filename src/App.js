// src/App.js
/*
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Client from './Client';
import Admin from './Admin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/client">Cliente</Link>
            </li>
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/client" element={<Client />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
*/

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Client from './components/Client';
import Admin from './components/Admin';
import Login from './components/Login';
import { WebSocketProvider } from './WebSocketContext';
import './App.css';

function App() {
  return (
    <Router>
      <WebSocketProvider>
        <div className="App">
          <nav>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/client" element={<Client />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </WebSocketProvider>
    </Router>
  );
}

export default App;
