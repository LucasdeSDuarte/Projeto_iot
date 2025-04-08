import DashboardLayout from '../componente/DashboardLayout';
import { Plus } from 'lucide-react';

export default function Dispositivos() {
  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-800">Dispositivos</h1>
        <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          <Plus size={18} /> Novo Dispositivo
        </button>
      </div>
      <p className="text-gray-500">Lista de dispositivos conectados e em uso.</p>
    </DashboardLayout>
  );
}