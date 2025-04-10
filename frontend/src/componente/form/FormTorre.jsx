import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function FormTorre({ initialData = {}, onSubmit, onCancel }) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [localizacao, setLocalizacao] = useState(initialData?.localizacao || '');
  const [clienteId, setClienteId] = useState(initialData?.cliente_id || '');
  const [clientes, setClientes] = useState([]);
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  // Carregar os clientes disponíveis
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get(`${API}/clientes`);

        // Verifica se o retorno é um array diretamente ou dentro de .data
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setClientes(data);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        setClientes([]);
      }
    };

    fetchClientes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome,
      localizacao,
      cliente_id: parseInt(clienteId),
      ativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Torre' : 'Nova Torre'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome da Torre</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Localização</label>
        <input
          type="text"
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente Vinculado</label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">Selecione um cliente</option>
          {Array.isArray(clientes) &&
            clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
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
