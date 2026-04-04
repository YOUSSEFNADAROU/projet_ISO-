import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const hasSelectedCompany = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('selectedCompanyId'));
};

const ProtectedRoute = ({ children, allowedRoles = null, requireCompanySelection = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }

  if (requireCompanySelection && user?.role === 'auditor' && !hasSelectedCompany()) {
    return <Navigate to="/auditor/companies" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;