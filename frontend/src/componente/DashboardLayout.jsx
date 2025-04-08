// src/components/DashboardLayout.jsx
import React from 'react';
import { LogOut, Home, Bell, Activity, Users, Server, Cpu, AlertTriangle, Monitor } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children, tipo }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Menus por tipo de usuário
  const menus = tipo === 'colaborador' ? [
    { label: 'Home', icon: Home, path: '/admin/dashboard' },
    { label: 'Monitoramento Geral', icon: Monitor, path: '/admin/monitoramento' },
    { label: 'Usuários', icon: Users, path: '/admin/usuarios' },
    { label: 'Torres', icon: Server, path: '/admin/torres' },
    { label: 'Dispositivos', icon: Cpu, path: '/admin/dispositivos' },
    { label: 'Sensores', icon: Activity, path: '/admin/sensores' },
    { label: 'Alertas Pendentes', icon: AlertTriangle, path: '/admin/alertas' },
    { label: 'Histórico', icon: Bell, path: '/admin/historico' },
  ] : [
    { label: 'Home', icon: Home, path: '/cliente/dashboard' },
    { label: 'Meu Monitoramento', icon: Monitor, path: '/cliente/monitoramento' },
    { label: 'Histórico', icon: Bell, path: '/cliente/historico' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:block relative">
        <div className="p-6 text-2xl font-bold border-b border-zinc-700">
          IoT <span className="text-green-400">Dashboard</span>
        </div>
        <nav className="mt-6 space-y-1">
          {menus.map((menu, idx) => {
            const isActive = location.pathname === menu.path;
            return (
              <div
                key={idx}
                onClick={() => navigate(menu.path)}
                className={`flex items-center gap-3 px-6 py-2 cursor-pointer transition
                  ${isActive ? 'bg-zinc-800 text-green-400' : 'hover:bg-zinc-800 text-white'}`}
              >
                <menu.icon size={20} />
                <span>{menu.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="absolute bottom-4 w-full px-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-red-400 hover:text-red-300"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
