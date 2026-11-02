import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { loginUser, registerUser, getCurrentUser } from '../features/auth/services/authService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);

    const profile = await getCurrentUser();
    setUser(profile);
    return profile;
  };

  const register = async (email, password) => {
    const data = await registerUser(email, password);
    if (data?.access_token) {
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setUser(data);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

