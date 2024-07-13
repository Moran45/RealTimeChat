import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Client from './components/Client'; // Ajustada la ruta
import Admin from './components/Admin'; // Ajustada la ruta
import Login from './components/Login'; // Ajustada la ruta
import { WebSocketProvider } from './WebSocketContext';
import './App.css';

function App() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Router>
      <WebSocketProvider>
        <div className={`App_nav d-flex ${isExpanded ? 'App_nav_expanded' : ''}`}>
          <nav className="App_nav_sidebar d-flex flex-column align-items-center p-3 text-white bg-dark">
            <a href="/" className="App_nav_brand d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
              <span className="App_nav_circle fs-4">A</span>
            </a>
            <hr className="App_nav_hr" />
            <ul className="nav nav-pills flex-column mb-auto">
              <li className="nav-item">
                <Link to="/client" className="nav-link text-white App_nav_icon d-flex align-items-center">
                  <i className="bi bi-house-door-fill"></i>
                  {isExpanded && <span className="App_nav_text ms-2">Cliente</span>}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin" className="nav-link text-white App_nav_icon d-flex align-items-center">
                  <i className="bi bi-chat-dots-fill"></i>
                  {isExpanded && <span className="App_nav_text ms-2">Admin</span>}
                </Link>
              </li>
              {/* Puedes añadir más enlaces si es necesario */}
            </ul>
            <div className="App_nav_handle" onClick={toggleSidebar}></div>
          </nav>
          <div className="App_nav_content flex-grow-1 p-3">
            <div className="App_nav_header d-flex justify-content-between align-items-center mb-4">
              <h2>Messages</h2>
              <button className="btn btn-primary">+</button>
            </div>
            <div className="App_nav_search mb-4">
              <input type="text" className="form-control" placeholder="Search messages" />
            </div>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/client" element={<Client />} />
              <Route path="/admin" element={<Admin />} />
              {/* Añadir rutas para mensajes, búsqueda y configuración si es necesario */}
            </Routes>
          </div>
        </div>
      </WebSocketProvider>
    </Router>
  );
}

export default App;
