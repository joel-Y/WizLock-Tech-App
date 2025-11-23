import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LockProvisioning from './pages/LockProvisioning';
import GatewayProvisioning from './pages/GatewayProvisioning';
import Diagnostics from './pages/Diagnostics';
import BLEScan from './pages/BLEScan';
import UserManagement from './pages/UserManagement';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/provision/lock" element={<LockProvisioning />} />
        <Route path="/provision/gateway" element={<GatewayProvisioning />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/scan" element={<BLEScan />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;