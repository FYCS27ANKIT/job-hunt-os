import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getInitialToken = () => {
    const saved = localStorage.getItem('job_hunt_os_token');
    return (saved && saved !== 'undefined' && saved !== 'null') ? saved : null;
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (!res.data || !res.data.token) {
      throw new Error('Authentication succeeded but server returned an invalid payload.');
    }
    localStorage.setItem('job_hunt_os_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    if (!res.data || !res.data.token) {
      throw new Error('Registration succeeded but server returned an invalid payload.');
    }
    localStorage.setItem('job_hunt_os_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const demoLogin = async (role = 'employee') => {
    if (role === 'employer') {
      return login('employer@techcorp.com', 'password123');
    } else if (role === 'admin') {
      return login('admin@jobhuntos.com', 'password123');
    }
    return login('demo@jobhuntos.com', 'password123');
  };

  const switchActiveRole = async (newRole) => {
    try {
      const res = await API.post('/auth/switch-role', { role: newRole });
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error('Failed to switch role:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('job_hunt_os_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updateData) => {
    const res = await API.put('/auth/profile', updateData);
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        demoLogin,
        switchActiveRole,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
