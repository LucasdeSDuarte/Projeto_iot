import DashboardLayout from '../componente/DashboardLayout';
import { Server, Cpu, Users, AlertTriangle } from 'lucide-react';

export default function DashboardColaborador() {
  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Painel do Colaborador</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <Server className="text-blue-500" size={32} />
            <div>
              <p className="text-sm text-gray-500">Torres Ativas</p>
              <p className="text-xl font-semibold text-gray-800">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
          <div className="flex items-center gap-4">
            <Cpu className="text-indigo-500" size={32} />
            <div>
              <p className="text-sm text-gray-500">Dispositivos Conectados</p>
              <p className="text-xl font-semibold text-gray-800">36</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500">
          <div className="flex items-center gap-4">
            <Users className="text-emerald-500" size={32} />
            <div>
              <p className="text-sm text-gray-500">Usuários Ativos</p>
              <p className="text-xl font-semibold text-gray-800">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-red-500" size={32} />
            <div>
              <p className="text-sm text-gray-500">Alertas Diarios</p>
              <p className="text-xl font-semibold text-gray-800">2</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}