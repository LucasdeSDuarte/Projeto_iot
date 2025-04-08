import React, {  useState } from 'react';
import DashboardLayout from '../componente/DashboardLayout';

const MOCK_SENSORES = [
  {
    id: 1,
    tipo: 'Temperatura',
    cliente_nome: 'Cliente Alpha',
    torre_nome: 'Torre Norte',
    identificador: 'TEMP-AL-01',
    unidade: '°C',
    ultimo_valor: 26.7,
  },
  {
    id: 2,
    tipo: 'Temperatura',
    cliente_nome: 'Cliente Alpha',
    torre_nome: 'Torre Sul',
    identificador: 'TEMP-AL-02',
    unidade: '°C',
    ultimo_valor: 29.1,
  },
  {
    id: 3,
    tipo: 'Vibração',
    cliente_nome: 'Cliente Beta',
    torre_nome: 'Torre Leste',
    identificador: 'VIB-BE-01',
    unidade: 'Hz',
    ultimo_valor: 0.038,
  },
  {
    id: 4,
    tipo: 'Vibração',
    cliente_nome: 'Cliente Beta',
    torre_nome: 'Torre Oeste',
    identificador: 'VIB-BE-02',
    unidade: 'Hz',
    ultimo_valor: 0.042,
  },
  {
    id: 5,
    tipo: 'Temperatura',
    cliente_nome: 'Cliente Gamma',
    torre_nome: 'Torre Central',
    identificador: 'TEMP-GA-01',
    unidade: '°C',
    ultimo_valor: 24.9,
  },
  {
    id: 6,
    tipo: 'Vibração',
    cliente_nome: 'Cliente Gamma',
    torre_nome: 'Torre Central',
    identificador: 'VIB-GA-01',
    unidade: 'Hz',
    ultimo_valor: 0.031,
  },
];

export default function AdminMonitoramento() {
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const clientesUnicos = [...new Set(MOCK_SENSORES.map(s => s.cliente_nome))];

  const sensoresFiltrados = MOCK_SENSORES.filter(
    (s) => clienteSelecionado && s.cliente_nome === clienteSelecionado
  );

  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold mb-6">Monitoramento Geral dos Sensores</h1>

      <div className="mb-6 max-w-md">
        <label className="block mb-2 text-sm font-medium">Selecione um Cliente:</label>
        <select
          value={clienteSelecionado}
          onChange={(e) => setClienteSelecionado(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Selecione --</option>
          {clientesUnicos.map((cliente, idx) => (
            <option key={idx} value={cliente}>{cliente}</option>
          ))}
        </select>
      </div>

      {clienteSelecionado ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensoresFiltrados.map((sensor) => (
            <div key={sensor.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">{sensor.tipo} - {sensor.cliente_nome}</h2>
              <p><strong>Torre:</strong> {sensor.torre_nome}</p>
              <p><strong>Identificador:</strong> {sensor.identificador}</p>
              <p><strong>Unidade:</strong> {sensor.unidade}</p>
              <p><strong>Último valor:</strong> {sensor.ultimo_valor ?? '---'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-6">Selecione um cliente para visualizar os sensores.</p>
      )}
    </DashboardLayout>
  );
}
