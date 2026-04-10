import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
          toastStyle={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(94, 37, 26, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.58)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,251,246,0.96))',
            color: '#2c1d18',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
