import { createContext, useContext, useState } from 'react';
import api from '../api/connect';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'user' atau 'admin'

  const login = async (username, password) => {
    try {
      const res = await api.signIn({ Email: username, password });
      if (!res.ok) {
        const message = res.data?.message || 'Login gagal';
        return { success: false, message };
      }

      const payload = res.data || {};
      const role = payload.role || (username && username.toLowerCase().includes('admin') ? 'admin' : 'user');
      setIsLoggedIn(true);
      setUser({ username: payload.Email || username, role });
      setUserRole(role);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Login error' };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
