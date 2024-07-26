import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Client from './components/Client';
import Admin from './components/Admin';
import Login from './components/Login';
import { WebSocketProvider } from './WebSocketContext';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isClientRoute = location.pathname === '/client';
  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className={`appscss-app`}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/client" element={<Client />} />
        <Route path="/admin" element={<Admin />} />
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
