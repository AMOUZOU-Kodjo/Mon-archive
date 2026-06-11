import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

/**
 * Contexte d'authentification global.
 * Gère l'état de connexion, la vérification du token au démarrage,
 * la connexion et la déconnexion.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Vérification de l'authentification au chargement
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      if (response.data.authenticated) {
        setUser(response.data.user);
        setAuthenticated(true);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connexion
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthenticated(true);
    return response.data;
  };

  // Déconnexion
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Même si la requête échoue, on déconnecte côté frontend
    }
    localStorage.removeItem('token');
    setUser(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
