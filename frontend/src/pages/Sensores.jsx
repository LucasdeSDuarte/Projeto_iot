import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardLayout from '../componente/DashboardLayout';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Sensores() {
  const [sensores, setSensores] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    buscarSensores();
  }, []);

  const buscarSensores = async () => {
    try {
      const response = await api.get('/sensores');
      setSensores(response.data);
    } catch (error) {
      console.error('Erro ao buscar sensores:', error);
    }
  };

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sensores</h1>
        <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          <Plus size={18} /> Novo Sensor
        </button>
      </div>

      <input
        type="text"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar sensor..."
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full table-auto">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Unidade</th>
              <th className="px-4 py-2 text-left">Identificador</th>
              <th className="px-4 py-2 text-left">Appliance</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sensores
              .filter((s) =>
                s.tipo.toLowerCase().includes(filtro.toLowerCase())
              )
              .map((sensor) => (
                <tr key={sensor.id} className="border-b">
                  <td className="px-4 py-2">{sensor.tipo}</td>
                  <td className="px-4 py-2">{sensor.unidade}</td>
                  <td className="px-4 py-2">{sensor.identificador}</td>
                  <td className="px-4 py-2">{sensor.appliance?.nome}</td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button className="text-blue-500 hover:text-blue-600">
                      <Pencil size={18} />
                    </button>
                    <button className="text-red-500 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
