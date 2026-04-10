import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchCurrentUser, loginUser, removeOwnAccount, signupUser, updateCurrentUser } from '../services/authService';
import { registerSessionExpiredHandler } from '../services/api';
import { fetchNotifications } from '../services/notificationService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('blogUser');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed?.role === 'Student' ? { ...parsed, role: 'Author' } : parsed;
  });
  const [currentToken, setCurrentToken] = useState(() => localStorage.getItem('blogToken') || '');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      logout({ silent: true });
      toast.error('Session expired, please login again');
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    if (!currentUser || !currentToken) {
      setNotificationCount(0);
      return;
    }
    refreshNotifications();
  }, [currentUser, currentToken]);

  function showToast(message, type = 'info') {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warn(message);
    else toast.info(message);
  }

  // Kept for backward compat (AppLayout uses it, now a no-op)
  function clearToast() {}

  async function login(payload) {
    const data = await loginUser(payload);
    const normalizedUser = data.user?.role === 'Student' ? { ...data.user, role: 'Author' } : data.user;
    setCurrentUser(normalizedUser);
    setCurrentToken(data.token);
    localStorage.setItem('blogUser', JSON.stringify(normalizedUser));
    localStorage.setItem('blogToken', data.token);
    setNotificationCount(0);
    return { ...data, user: normalizedUser };
  }

  async function signup(payload) {
    return signupUser(payload);
  }

  async function refreshCurrentUser() {
    const data = await fetchCurrentUser();
    setCurrentUser(data.user);
    localStorage.setItem('blogUser', JSON.stringify(data.user));
    return data.user;
  }

  async function refreshNotifications() {
    if (!localStorage.getItem('blogToken')) {
      setNotificationCount(0);
      return 0;
    }
    try {
      const data = await fetchNotifications();
      const count = data.unreadCount || 0;
      setNotificationCount(count);
      return count;
    } catch (err) {
      if (err.message !== 'Session expired, please login again') {
        setNotificationCount(0);
      }
      return 0;
    }
  }

  async function updateProfile(payload) {
    const data = await updateCurrentUser(payload);
    setCurrentUser(data.user);
    localStorage.setItem('blogUser', JSON.stringify(data.user));
    return data.user;
  }

  async function deleteAccount() {
    await removeOwnAccount();
    logout({ silent: true });
  }

  function logout(options = {}) {
    const { silent = false } = options;
    setCurrentUser(null);
    setCurrentToken('');
    setNotificationCount(0);
    localStorage.removeItem('blogUser');
    localStorage.removeItem('blogToken');
    if (!silent) toast.success('Logged out successfully');
  }

  const value = useMemo(() => ({
    currentUser,
    currentToken,
    notificationCount,
    isAuthenticated: Boolean(currentUser && currentToken),
    // Legacy shims — toast calls now go directly to React Toastify
    toast: null,
    showToast,
    clearToast,
    login,
    signup,
    refreshCurrentUser,
    refreshNotifications,
    updateProfile,
    deleteAccount,
    logout,
  }), [currentUser, currentToken, notificationCount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
