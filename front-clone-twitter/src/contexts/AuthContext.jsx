import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('access');
    if (access) {
      api.get('/users/me/')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const { data } = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    const me = await api.get('/users/me/');
    setUser(me.data);
  }

  async function register(payload) {
    await api.post('/auth/register/', payload);
    await login(payload.username, payload.password);
  }

  function logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  }

  function updateUser(data) {
    setUser((prev) => ({ ...prev, ...data }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}