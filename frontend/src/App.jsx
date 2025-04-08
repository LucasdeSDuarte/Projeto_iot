import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardCliente from './pages/DashboardCliente';
import DashboardColaborador from './pages/DashboardColaborador';
import PrivateRoute from './routes/PrivateRoute';
import Torres from './pages/Torres';
import Dispositivos from './pages/Dispositivos';
import Usuarios from './pages/Usuarios';
import Alertas from './pages/Alertas';
import Sensores from './pages/Sensores';
import AdminMonitoramento from './pages/AdminMonitoramento';
import ClienteMonitoramento from './pages/ClienteMonitoramento';
import HistoricoColaborador from './pages/HistoricoColaborador';
import HistoricoCliente from './pages/HistoricoCliente';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Rotas do Cliente */}
      <Route
        path="/cliente/dashboard"
        element={
          <PrivateRoute tipo="cliente">
            <DashboardCliente />
          </PrivateRoute>
        }
      />
      <Route
        path="/cliente/monitoramento"
        element={
          <PrivateRoute tipo="cliente">
            <ClienteMonitoramento />
          </PrivateRoute>
        }
      />
      <Route
        path="/cliente/historico"
        element={
          <PrivateRoute tipo="cliente">
            <HistoricoCliente />
          </PrivateRoute>
        }
      />

      {/* Rotas do Colaborador */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute tipo="colaborador">
            <DashboardColaborador />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/monitoramento"
        element={
          <PrivateRoute tipo="colaborador">
            <AdminMonitoramento />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/historico"
        element={
          <PrivateRoute tipo="colaborador">
            <HistoricoColaborador />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/torres"
        element={
          <PrivateRoute tipo="colaborador">
            <Torres />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dispositivos"
        element={
          <PrivateRoute tipo="colaborador">
            <Dispositivos />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <PrivateRoute tipo="colaborador">
            <Usuarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/alertas"
        element={
          <PrivateRoute tipo="colaborador">
            <Alertas />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/sensores"
        element={
          <PrivateRoute tipo="colaborador">
            <Sensores />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
