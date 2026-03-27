import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';

let refreshRequest = null;
let onAuthFailure = null;

// Move interceptors outside to ensure they are attached BEFORE any component mounts
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refreshToken');
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes('/api/auth/refresh');

    if (!isUnauthorized || !refreshToken || isRefreshCall || originalRequest?._retry) {
      // If it's a 401 and we can't refresh, trigger the global logout handler
      if (isUnauthorized && !isRefreshCall && onAuthFailure) {
        onAuthFailure();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = axios.post('/api/auth/refresh', { refreshToken });
      }
      const { data } = await refreshRequest;
      refreshRequest = null;

      const newToken = data.accessToken || data.token;
      localStorage.setItem('token', newToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      refreshRequest = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
      return Promise.reject(refreshError);
    }
  }
);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    onAuthFailure = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    };

    return () => {
      onAuthFailure = null;
    };
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('violation-alert', (alert) => {
      toast(
        () => (
          <div className="flex flex-col space-y-2">
            <div className="font-bold text-red-600">Violation Alert</div>
            <div className="text-sm">
              <p><strong>Vehicle:</strong> {alert.vehicleNumber}</p>
              <p><strong>Type:</strong> {alert.violationType}</p>
              <p><strong>Zone:</strong> {alert.zone}</p>
              <p className="mt-2 text-xs text-gray-600">{alert.message}</p>
            </div>
          </div>
        ),
        {
          duration: 10000,
          style: {
            background: '#fee',
            color: '#c41e3a',
            border: '2px solid #c41e3a'
          }
        }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogin = (payload) => {
    const accessToken = payload.accessToken || payload.token;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (payload.refreshToken) {
      localStorage.setItem('refreshToken', payload.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Ignore logout API failures and clear client state regardless.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/citizen'} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/admin/*"
          element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/citizen/*"
          element={user?.role === 'citizen' ? <CitizenDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/citizen') : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
