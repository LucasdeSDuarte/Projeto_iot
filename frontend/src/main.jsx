import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { setAuthToken } from './services/api';
import ThemeProvider from './context/ThemeContext';

// Recupera o token salvo no localStorage e configura o axios
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
  </ThemeProvider>
);
