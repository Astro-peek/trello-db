import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Columns, CreditCard, Plus, Loader2, LogOut, X } from 'lucide-react';
import api from './api';

// Components & Views will be placed in separate files.
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import OrgView from './pages/OrgView';
import Board from './pages/Board';

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/org/:orgId" element={<PrivateRoute><OrgView /></PrivateRoute>} />
        <Route path="/board/:boardId" element={<PrivateRoute><Board /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('trello_token');
  return token ? children : <Navigate to="/auth" />;
};

export default App;
