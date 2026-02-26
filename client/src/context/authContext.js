import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const decodedToken = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Invalid token/user data on load:", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = response.data;
    
    setToken(token);
    setUser(loggedInUser);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));

    if (loggedInUser.role === 'reviewer' && !loggedInUser.is_approved) {
      navigate('/pending-approval');
    } else {
      navigate(`/${loggedInUser.role}/dashboard`);
    }
  };
  
  const register = async (userData) => {
    await apiClient.post('/auth/register', userData);
    navigate('/register-success');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = { user, token, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};