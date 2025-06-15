import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react'; // Make sure to import React

export const StudentProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // This is correct JSX for React
  }

  if (!isAuthenticated) {
    return <Navigate to="/student-login" state={{ from: location }} replace />;
  }

  return children;
};