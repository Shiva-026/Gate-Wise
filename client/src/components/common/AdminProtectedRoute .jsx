// AdminProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const loginType = localStorage.getItem('loginType');

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated || loginType !== 'admin') {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

// SecurityProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export const SecurityProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const loginType = localStorage.getItem('loginType');

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated || loginType !== 'security') {
    return <Navigate to="/security-login" state={{ from: location }} replace />;
  }

  return children;
};