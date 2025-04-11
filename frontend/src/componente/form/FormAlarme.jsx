import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function FormAlarme({ initialData = {}, onSubmit, onCancel }) {
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [valorAlarme, setValorAlarme] = useState(initialData?.valor_alarme || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [sensorId, setSensorId] = useState(initialData?.sensor_id || '');
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);
  const [sensores, setSensores] = useState([]);

  useEffect(() => {
    fetchSensores();
  }, []);

  const fetchSensores = async () => {
    try {
      const response = await axios.get(`${API}/sensores`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setSensores(data);
    } catch (error) {
      console.error('Erro ao carregar sensores:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      descricao,
      valor_alarme: parseFloat(valorAlarme),
      email,
      sensor_id: parseInt(sensorId),
      ativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Alerta' : 'Novo Alerta'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor do Alarme</label>
        <input
          type="number"
          step="0.01"
          value={valorAlarme}
          onChange={(e) => setValorAlarme(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail de Destino</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sensor Vinculado</label>
        <select
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        >
          <option value="">Selecione um sensor</option>
          {sensores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.identificador || `Sensor ${s.id}`} — {s.appliance?.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">Ativo</label>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
