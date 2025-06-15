import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple JWT parsing
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedLoginType = localStorage.getItem('loginType');

      if (storedToken && storedUser) {
        try {
          const decoded = parseJwt(storedToken);
          
          if (decoded && decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }

          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Auth initialization error:', error);
          clearAuth();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginType');
    setToken(null);
    setUser(null);
  };

  const login = async (token, userData, loginType) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('loginType', loginType);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        login,
        logout,
        parseJwt
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};