import React, { useState } from 'react';
import DashboardLayout from '../componente/DashboardLayout';

const mockData = [
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Media', valor: 28.5, timestamp: '01/01/1970 00:02:11' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Media', valor: 28.5, timestamp: '02/04/2025 16:22:36' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Media', valor: 28.5, timestamp: '02/04/2025 16:26:26' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Media', valor: 28.5, timestamp: '02/04/2025 16:36:15' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Media', valor: 28.5, timestamp: '02/04/2025 18:57:17' },
];

export default function HistoricoCliente() {
  const clienteLogado = 'cliente01'; // mock do cliente logado

  const [filtroAlarme, setFiltroAlarme] = useState('');
  const [filtroSensor, setFiltroSensor] = useState('');
  const [filtroTorre, setFiltroTorre] = useState('');

  const dadosDoCliente = mockData.filter(item => item.cliente_id === clienteLogado);

  const dadosFiltrados = dadosDoCliente.filter(item => {
    return (
      (!filtroAlarme || item.alarme === filtroAlarme) &&
      (!filtroSensor || item.sensor_tipo === filtroSensor) &&
      (!filtroTorre || item.torre_id === filtroTorre)
    );
  });

  const alarmesUnicos = [...new Set(dadosDoCliente.map(item => item.alarme))];
  const sensoresUnicos = [...new Set(dadosDoCliente.map(item => item.sensor_tipo))];
  const torresUnicas = [...new Set(dadosDoCliente.map(item => item.torre_id))];

  return (
    <DashboardLayout tipo="cliente">
      <h1 className="text-2xl font-bold mb-4">Histórico de Leituras</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select onChange={(e) => setFiltroAlarme(e.target.value)} className="p-2 rounded border">
          <option value="">Filtrar por Alarme</option>
          {alarmesUnicos.map((a, idx) => (
            <option key={idx} value={a}>{a}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltroSensor(e.target.value)} className="p-2 rounded border">
          <option value="">Filtrar por Tipo de Sensor</option>
          {sensoresUnicos.map((s, idx) => (
            <option key={idx} value={s}>{s}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltroTorre(e.target.value)} className="p-2 rounded border">
          <option value="">Filtrar por Torre</option>
          {torresUnicas.map((t, idx) => (
            <option key={idx} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4 text-left">Torre</th>
              <th className="py-2 px-4 text-left">Sensor</th>
              <th className="py-2 px-4 text-left">Alarme</th>
              <th className="py-2 px-4 text-left">Valor</th>
              <th className="py-2 px-4 text-left">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2 px-4">{item.torre_id}</td>
                <td className="py-2 px-4 capitalize">{item.sensor_tipo}</td>
                <td className="py-2 px-4">{item.alarme}</td>
                <td className="py-2 px-4">{item.valor}</td>
                <td className="py-2 px-4">{item.timestamp}</td>
              </tr>
            ))}
            {dadosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">Nenhum dado encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
