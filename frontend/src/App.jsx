import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import NewChecklistPage from './pages/Operator/NewChecklistPage';
import SignaturePage from './pages/Operator/SignaturePage';
import DashboardPage from './pages/Admin/DashboardPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import FleetManagementPage from './pages/Admin/FleetManagementPage';
import HistoryPage from './pages/Admin/HistoryPage';

// Components
import Layout from './components/common/Layout';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'ADMINISTRATOR') {
    return <Navigate to="/checklist" />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/checklist" element={
        <ProtectedRoute>
          <NewChecklistPage />
        </ProtectedRoute>
      } />
      
      <Route path="/signature" element={
        <ProtectedRoute>
          <SignaturePage />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute requireAdmin>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute requireAdmin>
          <UserManagementPage />
        </ProtectedRoute>
      } />
      
      <Route path="/fleet" element={
        <ProtectedRoute requireAdmin>
          <FleetManagementPage />
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute requireAdmin>
          <HistoryPage />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/checklist" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
