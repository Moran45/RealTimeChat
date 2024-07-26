import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Client from './components/Client'; // Ajustada la ruta
import Admin from './components/Admin'; // Ajustada la ruta
import AdminFull from './components/Adminfull'; // Importa el nuevo componente
import Login from './components/Login'; // Ajustada la ruta
import { WebSocketProvider } from './WebSocketContext';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isClientRoute = location.pathname === '/client';
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/adminFull'; // Modificado

  return (
    <div className={`appscss-app`}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/client" element={<Client />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/adminFull" element={<AdminFull />} /> {/* Añadida la nueva ruta */}
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </Router>
  );
}

export default App;
