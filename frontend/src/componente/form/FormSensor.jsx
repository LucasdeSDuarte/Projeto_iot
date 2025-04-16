import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AutoSuggestDropdown from '../dropdown/AutoSuggestDropdown';

const API = import.meta.env.VITE_API_URL;

export default function FormSensor({ initialData = {}, onSubmit, onCancel }) {
  const [tipo, setTipo] = useState(initialData?.tipo || '');
  const [unidade, setUnidade] = useState(initialData?.unidade || '');
  const [identificador, setIdentificador] = useState(initialData?.identificador || '');
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientesOptions, setClientesOptions] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [applianceSelecionado, setApplianceSelecionado] = useState(null);
  const [todasAppliances, setTodasAppliances] = useState([]);
  const [loadingAppliances, setLoadingAppliances] = useState(false);

  useEffect(() => {
    carregarClientesEAppliances();
  }, []);

  useEffect(() => {
    if (
      initialData?.id &&
      clientesOptions.length > 0 &&
      todasAppliances.length > 0
    ) {
      const appliance = todasAppliances.find(a => a.id === initialData.appliance?.id);
      if (appliance) {
        setApplianceSelecionado({
          label: appliance.tipo,
          value: appliance.id,
        });
  
        const cliente = clientesOptions.find(c => c.value === appliance.cliente_id);
        setClienteSelecionado(cliente || null);
      }
    }
  }, [clientesOptions, todasAppliances]);
  

  const carregarClientesEAppliances = async () => {
    setLoadingClientes(true);
    setLoadingAppliances(true);
    try {
      const [clientesRes, appliancesRes] = await Promise.all([
        axios.get(`${API}/clientes`),
        axios.get(`${API}/appliances`),
      ]);

      const clientes = clientesRes.data.data || [];
      const appliances = appliancesRes.data.data || [];

      setClientesOptions(clientes.map(c => ({ label: c.nome, value: c.id })));
      setTodasAppliances(appliances);
    } catch (err) {
      console.error('Erro ao carregar clientes/appliances:', err);
    } finally {
      setLoadingClientes(false);
      setLoadingAppliances(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const appliance_id = applianceSelecionado?.value;
    if (!appliance_id) {
      alert('Dispositivo não selecionado corretamente.');
      return;
    }

    onSubmit({
      tipo,
      unidade,
      identificador,
      appliance_id,
      ativo,
    });
  };

  const appliancesFiltradas = todasAppliances
    .filter((a) => a.cliente_id === clienteSelecionado?.value)
    .map((a) => ({
      label: `${a.tipo}`,
      value: a.id,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Sensor' : 'Novo Sensor'}
      </h2>

      <AutoSuggestDropdown
        label="Cliente"
        options={clientesOptions}
        selectedOption={clienteSelecionado}
        onChange={(opt) => {
          setClienteSelecionado(opt);
          setApplianceSelecionado(null);
        }}
        placeholder={loadingClientes ? 'Carregando clientes...' : 'Buscar cliente...'}
      />

      <AutoSuggestDropdown
        label="Dispositivo (Appliance)"
        options={appliancesFiltradas}
        selectedOption={applianceSelecionado}
        onChange={setApplianceSelecionado}
        placeholder={
          !clienteSelecionado
            ? 'Selecione um cliente primeiro...'
            : loadingAppliances
            ? 'Carregando dispositivos...'
            : 'Buscar dispositivo...'
        }
      />

      <div>
        <label className="block text-sm font-medium">Transdutor</label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Unidade</label>
        <input
          type="text"
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Identificador</label>
        <input
          type="text"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 text-green-600 border-gray-300 rounded"
        />
        <label className="text-sm">Ativo</label>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
