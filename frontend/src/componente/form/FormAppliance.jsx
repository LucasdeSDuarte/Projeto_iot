import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AutoSuggestDropdown from '../dropdown/AutoSuggestDropdown';

const API = import.meta.env.VITE_API_URL;

export default function FormAppliance({ initialData = {}, onSubmit, onCancel }) {
  const [tipo, setTipo] = useState(initialData?.tipo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [rota, setRota] = useState(initialData?.rota || '');
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientesOptions, setClientesOptions] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [torreSelecionada, setTorreSelecionada] = useState(null);
  const [todasTorres, setTodasTorres] = useState([]);
  const [loadingTorres, setLoadingTorres] = useState(false);

  useEffect(() => {
    carregarClientesETorres();
    if (!initialData?.id) gerarProximaRota();
  }, []);

  useEffect(() => {
    if (
      initialData?.id &&
      todasTorres.length > 0 &&
      !torreSelecionada &&
      (initialData?.torre_id || initialData?.torre?.id)
    ) {
      const torreId = initialData.torre_id || initialData?.torre?.id;
      const torreAtual = todasTorres.find(t => t.id === torreId);
      if (torreAtual) {
        setTorreSelecionada({ label: torreAtual.nome, value: torreAtual.id });
      }
    }
  }, [initialData, clienteSelecionado, todasTorres]);

  const carregarClientesETorres = async () => {
    setLoadingClientes(true);
    setLoadingTorres(true);
    try {
      const [clientesRes, torresRes] = await Promise.all([
        axios.get(`${API}/clientes`),
        axios.get(`${API}/torres`)
      ]);

      const clientes = clientesRes.data.data || [];
      const torres = torresRes.data.data || [];

      setClientesOptions(clientes.map(c => ({ label: c.nome, value: c.id })));
      setTodasTorres(torres);

      if (initialData?.id && clientes.length) {
        const clienteAtual = clientes.find(c => c.id === initialData.cliente_id);
        if (clienteAtual) {
          setClienteSelecionado({ label: clienteAtual.nome, value: clienteAtual.id });
        }
      }
    } catch (err) {
      console.error('Erro ao carregar clientes/torres:', err);
    } finally {
      setLoadingClientes(false);
      setLoadingTorres(false);
    }
  };

  const gerarProximaRota = async () => {
    try {
      const response = await axios.get(`${API}/appliances`);
      const total = Array.isArray(response.data.data) ? response.data.data.length : 0;
      const proximoNumero = (total + 1).toString().padStart(2, '0');
      setRota(`/dispositivosmonitoramento${proximoNumero}`);
    } catch {
      setRota('/dispositivosmonitoramento01');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome: clienteSelecionado?.label || '',
      cliente_id: clienteSelecionado?.value,
      torre_id: torreSelecionada?.value,
      tipo,
      descricao,
      rota,
      ativo,
    });
  };

  const torresFiltradas = todasTorres
    .filter(t => t.cliente_id === clienteSelecionado?.value)
    .map(t => ({ label: t.nome, value: t.id }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">{initialData?.id ? 'Editar Dispositivo' : 'Novo Dispositivo'}</h2>

      <AutoSuggestDropdown
        label="Cliente"
        options={clientesOptions}
        selectedOption={clienteSelecionado}
        onChange={(opt) => {
          setClienteSelecionado(opt);
          setTorreSelecionada(null);
        }}
        placeholder={loadingClientes ? 'Carregando clientes...' : 'Buscar cliente...'}
      />

      <AutoSuggestDropdown
        label="Torre Vinculada"
        options={torresFiltradas}
        selectedOption={torreSelecionada}
        onChange={setTorreSelecionada}
        placeholder={
          !clienteSelecionado
            ? 'Selecione um cliente primeiro...'
            : loadingTorres
            ? 'Carregando torres...'
            : 'Buscar torre...'
        }
      />

      <div>
        <label className="block text-sm font-medium">Modelo / Utilização</label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Rota de Acesso (URL)</label>
        <input
          type="text"
          value={rota}
          disabled
          className="w-full p-2 border rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 border-gray-300 text-green-500 focus:ring-green-500"
        />
        <label className="text-sm">Ativo</label>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md text-sm">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md text-sm">
          Salvar
        </button>
      </div>
    </form>
  );
}
