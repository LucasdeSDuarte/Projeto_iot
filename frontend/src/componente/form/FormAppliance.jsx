import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function FormAppliance({ initialData = {}, onSubmit, onCancel }) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [tipo, setTipo] = useState(initialData?.tipo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [rota, setRota] = useState(initialData?.rota || '');
  const [torreId, setTorreId] = useState(initialData?.torre_id || '');
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);
  const [torres, setTorres] = useState([]);

  useEffect(() => {
    carregarTorres();

    // Somente se for novo dispositivo (não está em edição)
    if (!initialData?.id) {
      gerarProximaRota();
    }
  }, []);

  const carregarTorres = async () => {
    try {
      const response = await axios.get(`${API}/torres`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setTorres(data);
    } catch (error) {
      console.error('Erro ao buscar torres:', error);
      setTorres([]);
    }
  };

  const gerarProximaRota = async () => {
    try {
      const response = await axios.get(`${API}/appliances`);
      const total = Array.isArray(response.data.data) ? response.data.data.length : 0;
      const proximoNumero = (total + 1).toString().padStart(2, '0');
      setRota(`/dispositivosmonitoramento${proximoNumero}`);
    } catch (err) {
      console.error('Erro ao gerar rota automática:', err);
      setRota('/dispositivosmonitoramento01');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome,
      tipo,
      descricao,
      rota,
      torre_id: parseInt(torreId),
      ativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Dispositivo' : 'Novo Dispositivo'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rota de Acesso (URL)</label>
        <input
          type="text"
          value={rota}
          disabled
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white cursor-not-allowed opacity-75"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Torre Vinculada</label>
        <select
          value={torreId}
          onChange={(e) => setTorreId(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        >
          <option value="">Selecione uma torre</option>
          {torres.map((torre) => (
            <option key={torre.id} value={torre.id}>
              {torre.nome}
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
