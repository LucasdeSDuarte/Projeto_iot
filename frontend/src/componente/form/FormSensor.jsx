import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function FormSensor({ initialData = {}, onSubmit, onCancel }) {
  const [applianceId, setApplianceId] = useState(initialData?.appliance_id || '');
  const [tipo, setTipo] = useState(initialData?.tipo || '');
  const [unidade, setUnidade] = useState(initialData?.unidade || '');
  const [identificador, setIdentificador] = useState(initialData?.identificador || '');
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    carregarAppliances();
  }, []);

  const carregarAppliances = async () => {
    try {
      const response = await axios.get(`${API}/appliances`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setAppliances(data);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      appliance_id: parseInt(applianceId),
      tipo,
      unidade,
      identificador,
      ativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Sensor' : 'Novo Sensor'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unidade</label>
        <input
          type="text"
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Identificador</label>
        <input
          type="text"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dispositivo (Appliance)</label>
        <select
          value={applianceId}
          onChange={(e) => setApplianceId(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">Selecione um dispositivo</option>
          {appliances.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
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
        <label className="text-sm text-gray-700">Ativo</label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm"
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
