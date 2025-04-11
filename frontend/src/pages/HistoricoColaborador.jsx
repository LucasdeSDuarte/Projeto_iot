import React, { useState } from 'react';
import DashboardLayout from '../componente/DashboardLayout';

const mockData = [
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Média', valor: 28.5, timestamp: '01/01/1970 00:02:11' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Média', valor: 28.5, timestamp: '02/04/2025 16:22:36' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Média', valor: 28.5, timestamp: '02/04/2025 16:26:26' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Média', valor: 28.5, timestamp: '02/04/2025 16:36:15' },
  { cliente_id: 'cliente01', torre_id: 'torre01', sensor_tipo: 'temperatura', alarme: 'Temperatura Média', valor: 28.5, timestamp: '02/04/2025 18:57:17' },
];

export default function HistoricoColaborador() {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroAlarme, setFiltroAlarme] = useState('');
  const [filtroSensor, setFiltroSensor] = useState('');
  const [filtroTorre, setFiltroTorre] = useState('');

  const dadosFiltrados = mockData.filter(item => {
    return (
      (!filtroCliente || item.cliente_id === filtroCliente) &&
      (!filtroAlarme || item.alarme === filtroAlarme) &&
      (!filtroSensor || item.sensor_tipo === filtroSensor) &&
      (!filtroTorre || item.torre_id === filtroTorre)
    );
  });

  const clientesUnicos = [...new Set(mockData.map(item => item.cliente_id))];
  const alarmesUnicos = [...new Set(mockData.map(item => item.alarme))];
  const sensoresUnicos = [...new Set(mockData.map(item => item.sensor_tipo))];
  const torresUnicas = [...new Set(mockData.map(item => item.torre_id))];

  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-white">Histórico Geral de Leituras</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select onChange={(e) => setFiltroCliente(e.target.value)} className="p-2 rounded border dark:bg-zinc-800 dark:text-white dark:border-zinc-600">
          <option value="">Filtrar por Cliente</option>
          {clientesUnicos.map((c, idx) => (
            <option key={idx} value={c}>{c}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltroAlarme(e.target.value)} className="p-2 rounded border dark:bg-zinc-800 dark:text-white dark:border-zinc-600">
          <option value="">Filtrar por Alarme</option>
          {alarmesUnicos.map((a, idx) => (
            <option key={idx} value={a}>{a}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltroSensor(e.target.value)} className="p-2 rounded border dark:bg-zinc-800 dark:text-white dark:border-zinc-600">
          <option value="">Filtrar por Tipo de Sensor</option>
          {sensoresUnicos.map((s, idx) => (
            <option key={idx} value={s}>{s}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltroTorre(e.target.value)} className="p-2 rounded border dark:bg-zinc-800 dark:text-white dark:border-zinc-600">
          <option value="">Filtrar por Torre</option>
          {torresUnicas.map((t, idx) => (
            <option key={idx} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-800 shadow rounded">
          <thead>
            <tr className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300">
              <th className="py-2 px-4 text-left">Cliente</th>
              <th className="py-2 px-4 text-left">Torre</th>
              <th className="py-2 px-4 text-left">Sensor</th>
              <th className="py-2 px-4 text-left">Alarme</th>
              <th className="py-2 px-4 text-left">Valor</th>
              <th className="py-2 px-4 text-left">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200 dark:border-zinc-600">
                <td className="py-2 px-4 text-zinc-800 dark:text-white">{item.cliente_id}</td>
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{item.torre_id}</td>
                <td className="py-2 px-4 capitalize text-gray-700 dark:text-gray-300">{item.sensor_tipo}</td>
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{item.alarme}</td>
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{item.valor}</td>
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{item.timestamp}</td>
              </tr>
            ))}
            {dadosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500 dark:text-gray-400">Nenhum dado encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
