import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AutoSuggestDropdown from '../dropdown/AutoSuggestDropdown';
import ProjetoSAPDropdown from '../dropdown/ProjetoSAPDropdown';

const API = import.meta.env.VITE_API_URL;

export default function FormTorre({ initialData = {}, onSubmit, onCancel }) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [localizacao, setLocalizacao] = useState(initialData?.localizacao || '');
  const [projeto, setProjeto] = useState(initialData?.projeto || '');
  const [clienteId, setClienteId] = useState(initialData?.cliente_id || '');
  const [clientes, setClientes] = useState([]);
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get(`${API}/clientes`);
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
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
      projeto: projeto?.toString() || null,
      cliente_id: parseInt(clienteId),
      ativo: !!ativo,
    });
  };

  const clientesOptions = clientes.map((c) => ({
    label: c.nome,
    value: c.id,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Torre' : 'Nova Torre'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome da Torre
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Localização
        </label>
        <input
          type="text"
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <ProjetoSAPDropdown
        value={projeto}
        onChange={setProjeto}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Cliente Vinculado
        </label>
        <AutoSuggestDropdown
          options={clientesOptions}
          selectedOption={
            clienteId
              ? {
                  label: clientes.find((c) => c.id === parseInt(clienteId))?.nome || '',
                  value: clienteId,
                }
              : null
          }
          onChange={(option) => setClienteId(option?.value || '')}
          placeholder="Buscar cliente..."
        />
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

      <div className="flex justify-end gap-2">
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
