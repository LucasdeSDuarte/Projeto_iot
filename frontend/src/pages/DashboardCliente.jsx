import DashboardLayout from '../componente/DashboardLayout';
import { Thermometer, Activity, AlarmClock } from 'lucide-react';

export default function DashboardCliente() {
  return (
    <DashboardLayout tipo="cliente">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6">Painel do Cliente</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <Thermometer className="text-green-500" size={32} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300">Temperatura Atual</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">22.5ºC</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border-l-4 border-yellow-400">
          <div className="flex items-center gap-4">
            <Activity className="text-yellow-400" size={32} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300">Vibração</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">Estável</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <AlarmClock className="text-red-500" size={32} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300">Alertas Diários</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">1 ativo</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
