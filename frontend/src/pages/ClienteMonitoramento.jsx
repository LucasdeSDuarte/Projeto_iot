import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardLayout from '../componente/DashboardLayout';

export default function ClienteMonitoramento() {
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    buscarSensores();
  }, []);

  const buscarSensores = async () => {
    try {
      const response = await api.get('/cliente/sensores');
      setSensores(response.data);
      setErro(false);
    } catch (error) {
      console.error('Erro ao carregar sensores:', error);
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout tipo="cliente">
      <h1 className="text-2xl font-bold mb-6">Monitoramento em Tempo Real</h1>

      {loading ? (
        <p className="text-gray-500">Carregando sensores...</p>
      ) : erro ? (
        <p className="text-red-500">Erro ao carregar sensores. Tente novamente mais tarde.</p>
      ) : sensores.length === 0 ? (
        <p className="text-gray-500">Nenhum sensor encontrado para sua conta.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensores.map((sensor) => (
            <div key={sensor.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2 capitalize">{sensor.tipo}</h2>
              <p><strong>Identificador:</strong> {sensor.identificador}</p>
              <p><strong>Unidade:</strong> {sensor.unidade}</p>
              <p><strong>Último valor:</strong> {sensor.ultimo_valor ?? '---'}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
