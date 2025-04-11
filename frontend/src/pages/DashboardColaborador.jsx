import { useEffect, useState } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import { Server, Cpu, Users, AlertTriangle, Activity } from 'lucide-react';
import api from '../services/api';

export default function DashboardColaborador() {
  const [indicadores, setIndicadores] = useState({
    torres: 0,
    appliances: 0,
    sensores: 0,
    clientes: 0,
    alarmes: 0,
  });

  useEffect(() => {
    carregarIndicadores();
  }, []);

  const carregarIndicadores = async () => {
    try {
      const response = await api.get('/dashboard/indicadores');
      setIndicadores(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    }
  };

  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6">
        Painel do Colaborador
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <IndicadorCard
          icon={<Server size={32} className="text-blue-500" />}
          label="Torres Ativas"
          value={indicadores.torres}
          color="blue"
        />
        <IndicadorCard
          icon={<Cpu size={32} className="text-indigo-500" />}
          label="Dispositivos Ativos"
          value={indicadores.appliances}
          color="indigo"
        />
        <IndicadorCard
          icon={<Activity size={32} className="text-purple-500" />}
          label="Sensores Ativos"
          value={indicadores.sensores}
          color="purple"
        />
        <IndicadorCard
          icon={<Users size={32} className="text-emerald-500" />}
          label="Usuários Ativos"
          value={indicadores.clientes}
          color="emerald"
        />
        <IndicadorCard
          icon={<AlertTriangle size={32} className="text-red-500" />}
          label="Alertas Cadastrados"
          value={indicadores.alarmes}
          color="red"
        />
      </div>
    </DashboardLayout>
  );
}

function IndicadorCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">{label}</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
